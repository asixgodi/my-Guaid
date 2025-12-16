import { NextRequest,NextResponse } from "next/server";
const apiKey = process.env.DEEPSEEK_API_KEY;
const apiUrl = process.env.DEEPSEEK_API_URL;
export async function POST(req:NextRequest){
    const {messages} = await req.json();
    if(!messages || !Array.isArray(messages) || messages.some(msg=>!msg.role || !msg.content)){
        return NextResponse.json({error:"无效的消息格式"}, {status:400});
    }
    if (!apiKey || !apiUrl) {
      console.error("环境变量未正确配置");
      return NextResponse.json({ error: "服务器配置错误" }, { status: 500 });
    }
    const systemMessage = {
      role: "system",
      content: `你是一个专业的旅行规划师，专门为用户提供旅行建议。请判断用户输入是否与旅行相关。
                如果是，则提供详细的旅行建议，包括推荐景点、行程规划、住宿、交通等。
                如果不是，回答：'抱歉，我只能回答与旅行相关的问题。'`,
    };
    try{
        // 设置请求超时
        const controller  = new AbortController();
        const timeoutId = setTimeout(()=>{
            controller.abort()
        },50000)
        const res = await fetch(apiUrl,{
            method:"POST",
            headers:{
                "Content-Type":'application/json',
                Authorization:`Bearer ${apiKey}`
            },
            body:JSON.stringify({
                model:"qwen-plus",
                messages:[systemMessage,...messages],
                temperature: parseFloat("1.3"),
            }),
            signal:controller.signal
        })
        clearTimeout(timeoutId);
        if (!res.ok) {
            const errorText = await res.text();
            console.error("AI API 请求失败，错误详情:", errorText);
            return NextResponse.json({ error: `API 请求失败: ${errorText}` }, { status: res.status });
        }

        const data = await res.json();
        console.log("AI API 返回数据:", data); // ✅ 确保格式正确

        // 得到 AI 回复内容
        const aiResponse = data.choices?.[0]?.message?.content || "AI 无法生成回复";
        console.log("AI 回复内容:", aiResponse); // ✅ 检查回复内容
        return NextResponse.json({ response: aiResponse });
    }catch(error:any){
        if (error.name === "AbortError") {
            console.error("AI API 请求超时");
            return NextResponse.json({ error: "AI 响应超时，请稍后再试。" }, { status: 500 });
        }

        console.error("AI API 请求错误:", error.message);
        return NextResponse.json({ error: "AI 响应失败，请稍后再试。" }, { status: 500 });
    }
}