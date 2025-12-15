/**
 User[用户点击提交] --> Front[前端 fetchTourismGuide]
    Front -- GET /api/getTourismGuide?city=xx&days=xx --> API[Next.js API GET Handler]
    
    subgraph Backend [后端逻辑]
        API --> Auth[验证用户登录 & 检查生成次数上限]
        Auth -- 通过 --> AI[调用讯飞星火 API 生成文字攻略]
        AI -- 返回文字JSON --> Images[遍历景点获取图片 (高德/备用API)]
        Images -- 组合数据 --> DB[(Prisma 存入数据库)]
    end
 */

import { NextResponse,NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {prisma} from '@/lib/prisma'

const IFLYTEK_API_KEY = process.env.IFLYTEK_API_KEY;
const IFLYTEK_API_SECRET = process.env.IFLYTEK_API_SECRET;
const AMAP_API_KEY = process.env.AMAP_API_KEY;
const APIPassword = process.env.APIPassword;
const IMAGE_API_ID = process.env.IMAGE_API_ID;
const IMAGE_API_KEY = process.env.IMAGE_API_KEY;
interface Place {
    name: string;
    description: string;
    image: string;
}
const getRecommendedPlacesFromXunfei = async(city:string,keyword:string,days:number):Promise<{day:number,places:Place[]}[]>=>{
    try{
        const res = await fetch(" https://spark-api-open.xf-yun.com/v2/chat/completions",
        {
            method:"POST",
            headers: {
                Authorization: `Bearer ${APIPassword}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "spark-x",
                messages: [
                    {
                        role: "system",
                        content:
                            "你是一位专业的旅行规划师，熟知中国各城市的热门景点。请根据用户输入的城市和关键字，推荐该城市的真实旅游景点。",
                        },
                    {
                        role: "user",
                        content: `请为我在${city}规划一个${days}天的旅行攻略，推荐与"${keyword}"相关的热门景点。
                            1-2天：每天4个左右景点，3天，可以3个左右。
                            直接返回以下格式的 JSON 字符串，不要包含任何多余的文本、Markdown 标记或其他内容。
                            格式：
                            [
                            { "day": 1, "places": [{ "name": "景点A", "description": "简短描述" },
                                { "name": "景点B", "description": "简短描述" } ] },
                            ]`,
                    },
                ],
                max_tokens: 2048,
            }),
        })
        if(!res.ok){
            throw new Error(`讯飞 API 请求失败，状态码: ${res.status}`);
        }
        const data = await res.json();
        console.log("讯飞星火完整响应:", data);
        // 检查响应数据是否有效
        if (!data || !data.choices || !data.choices[0]?.message?.content) {
            throw new Error("讯飞 API 返回的数据无效或为空");
        }
        const content = data.choices[0].message.content.trim()
        if(!content){
            throw new Error("讯飞 API 返回的内容为空");
        }

        // 清理并解析json字符串
        let cleanedContent = content.replace(/^```json/, "").replace(/```$/, "");
        let itinerary;
        try{
            itinerary = JSON.parse(cleanedContent);
        }catch(parseError){
            console.error("JSON 解析失败，尝试手动提取数据:", parseError);
            const placePattern =
                /"name":\s*"([^"]+)"[^}]*"description":\s*"([^"]+)"/g;
            const matches = [...cleanedContent.matchAll(placePattern)];

            if (matches.length === 0) {
                throw new Error("无法从讯飞 API 提取有效景点数据");
            }

            itinerary = Array.from({ length: days }, (_, day) => ({
                    day: day + 1,
                    // 每个景点存储：景点名称、描述、和图片
                    places: matches.slice(day * 2, (day + 1) * 2).map((match) => ({
                        name: match[1],
                        description: match[2],
                        image: "/default.jpg",
                })),
            }));
        }

        if (!Array.isArray(itinerary)) {
            throw new Error("讯飞 API 返回的行程数据格式错误");
        }

        if (itinerary.length !== days) {
            console.warn(
                `讯飞 API 返回的天数 (${itinerary.length}) 不匹配请求天数 (${days})`
            );
            itinerary = itinerary.slice(0, days);
        }

        console.log(`成功解析 ${itinerary.length} 天行程`);
        return itinerary;
    }catch(err){
        console.error("解析讯飞星火数据失败:", err);
        throw err;
    }
}

// 调用高德地图API获取景点图片,每次调用返回一个图片URL，所以返回值是Promise<string>
const getPlaceImage = async(city:string,placeName:string):Promise<string>=>{
    // extensions=all会返回photos字段
    const amapUrl = `https://restapi.amap.com/v3/place/text?keywords=${encodeURIComponent(
        placeName
    )}&city=${encodeURIComponent(city)}&extensions=all&key=${AMAP_API_KEY}`

    // 定义一个带有超时功能的fetch函数
    const fetchWithTimeout = async(url:string,options:RequestInit,timeout:5000)=>{
        const controller = new AbortController();
        const id = setTimeout(()=>controller.abort(), timeout);
        try{
            const response = await fetch(url,{
                ...options,
                signal:controller.signal
            })
            clearTimeout(id);
            // 检查响应状态
        if (!response.ok) {
            throw new Error(`请求失败，状态码: ${response.status}`);
        }
      return response;
        }catch(err){
            clearTimeout(id);
            throw err;
        }
    }
    try{
        const res = await fetchWithTimeout(amapUrl, {}, 5000);
        const data = await res.json()
        if (data.status === "1" && data.pois?.length > 0) {
            const photos = data.pois[0].photos || [];
            if (photos.length > 0) {
                return photos[0].url;
            }
        }
    }catch(err){
        console.error(`高德 API 获取 ${placeName} 图片失败`, err);
    }
    return "/default.jpg";
}

export async function GET(req:NextRequest){
    const url = new URL(req.url);
    const city = url.searchParams.get('city');
    let keyword = url.searchParams.get("keyword") || "";
    const days = Math.max(parseInt(url.searchParams.get("days") || "1", 10), 1);
    const session = await getServerSession(authOptions);
    console.log(`收到请求: 城市=${city}, 天数=${days}`);
    if(!session){
        return NextResponse.json({error:'用户未登录'}, {status:401});
    }
    
    const userId = session.user?.id;
    if(!keyword){
       keyword = "博物馆\文化\艺术\历史\商场\图书馆等各式各样景点";
    }
    // !city || !AMAP_API_KEY || !IFLYTEK_API_KEY || !IFLYTEK_API_SECRET
    if(!city || !IFLYTEK_API_KEY || !IFLYTEK_API_SECRET){
        return NextResponse.json({error:'缺少必要的参数或API密钥'}, {status:400});
    }
    try{
        const user = await prisma.user.findUnique({
            where:{id:userId}
        })
        if(!user){
            return NextResponse.json({error:'用户不存在'}, {status:404});
        }

        // 检查用户已有的行程数量
        const totalItineraries = await prisma.itinerary.count({
            where:{userId}
        })
        if(totalItineraries >=9){
            return NextResponse.json({error:'您已达到最大行程数量限制，请删除一些旧的行程后再创建新的行程。'}, {status:403});
        }

        // 调用API获取AI行程
        let itinerary = await getRecommendedPlacesFromXunfei(city, keyword, days);
        console.log("生成的行程:", itinerary);

        // 解析每一天的行程，并调用API来获取每个景点的图片
        // 生成的行程: [ { day: 1, places: [ [Object], [Object], [Object], [Object] ] } ],这个数组中有几个对象就有几天，每一天都有好几个places
        // 所以对每一天的行程进行处理，对每一天的每一个景点进行处理，获取图片
        let completedItinerary = await Promise.all(
            itinerary.map(async(day)=>{
                const updatedPlaces = await Promise.all(
                        day.places.map(async(place)=>({
                        ...place,
                        image: await getPlaceImage(city,place.name)
                    }))
                )
                return { day: day.day, places: updatedPlaces };
            })
        )
        console.log("生成的行程详情:", JSON.stringify(completedItinerary, null, 2));
        const savedItinerary = await prisma.itinerary.create({
            data: {
                userId,
                city,
                schedule: completedItinerary,
                generatedAt: new Date(),
            },
        });
        return new Response(
            JSON.stringify({
                id: savedItinerary.id,
                city,
                schedule: completedItinerary,
                generatedAt: savedItinerary.generatedAt.toISOString(),
            }),
            {
                status: 200,
                headers: {
                "Content-Type": "application/json", // 确保 Content-Type 是 JSON
                "Cache-Control":
                    "no-store, no-cache, must-revalidate, proxy-revalidate",
                },
            }
        );
    }catch(error){
        console.error("生成旅游攻略失败:", error);
        return new NextResponse(
            JSON.stringify({
                message: "生成旅游攻略失败",
                error: error || String(error),
            }),
            {
                status: 500,
                headers: {
                "Content-Type": "application/json", // 确保 Content-Type 是 JSON
                },
            }
        );
    }
    
}