import { NextRequest,NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function POST(req:NextRequest){
    try{
        const {title, desc:body, images, userId} = await req.json();
        const sparkRes = await fetch("https://spark-api-open.xf-yun.com/v2/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.APIPassword}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "spark-x",
                messages: [
                    {
                        role: "user",
                        content: `${body} 读取内容，提取景点，整理，直接返回以下格式的 JSON 字符串：
                        {
                        "city": "城市名称",
                        "data": [
                            {
                            "day": 1,
                            "places": [
                                {
                                "name": "景点A",
                                "description": "景点A的介绍"
                                },...
                            ]
                            },...
                        ]
                        }`,
                    },
                ],
                max_tokens: 2048,
            }),
        });
        const sparkData = await sparkRes.json();
        console.log("Spark API 返回数据:", sparkData);
        let jsonBody = sparkData.choices?.[0]?.message?.content || "";

        jsonBody = jsonBody.replace(/```json/g, "").replace(/```/g, "").trim();
        const match = jsonBody.match(/{[\s\S]*}/);
        if (!match) throw new Error("无效的 JSON 响应");

        const parsedJson = JSON.parse(match[0]);
        //console.log("解析后行程JSON:", parsedJson);
        const noteCount = await prisma.xhsNote.count({ where: { userId } });
        if (noteCount >= 6) {
            return NextResponse.json({ error: "小红书笔记数量已达上限 (6)，请先删除几个再继续解析" }, { status: 400 });
        }

        const xhsNote = await prisma.xhsNote.create({
            data: {
                userId,
                title,
                body,
                images,
                ocrTexts:[],
                jsonBody: parsedJson,
            },
        });

        return NextResponse.json(xhsNote, { status: 200 });
    }catch(error){

    }
}