import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

// 1. 模拟浏览器 Header
const headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Cookie": process.env.XHS_COOKIE || '', // ⚠️ 必须在 .env.local 配置最新 Cookie
  "Referer": "https://www.xiaohongshu.com/",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
  "Cache-Control": "no-cache",
  "Pragma": "no-cache",
  "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": '"Windows"',
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1"
};

// 2. 工具函数：提取纯净 URL
function extractUrl(text: string): string | null {
  const urlRegex = /(https?:\/\/[^\s]+)/;
  const match = text.match(urlRegex);
  return match ? match[0] : null;
}

export async function POST(req: Request) {
  try {
    const { link } = await req.json();

    if (!link) {
        return NextResponse.json({ error: "链接不能为空" }, { status: 400 });
    }

    const extractedUrl = extractUrl(link);

    if (!extractedUrl) {
        return NextResponse.json({ error: "未找到有效的小红书链接" }, { status: 400 });
    }

    // 3. 请求小红书网页
    const response = await fetch(extractedUrl, { headers });
    
    // 检查 HTTP 状态码
    if (!response.ok) {
        console.error(`请求失败，状态码: ${response.status}`);
        return NextResponse.json({ error: "无法访问小红书，可能 Cookie 失效或 IP 被封" }, { status: response.status });
    }

    const html = await response.text();

    // 调试日志：检查是否遇到验证码
    const $ = cheerio.load(html);
    const pageTitle = $("title").text();

    if (pageTitle.includes("验证") || pageTitle.includes("登录")) {
        return NextResponse.json({ error: "触发了小红书验证码拦截，请更新 Cookie" }, { status: 403 });
    }

    // 4. ：暴力搜索数据源
    // 不再依赖 ID，而是遍历所有 script 标签，找包含 window.__INITIAL_STATE__ 的那个
    let scriptContent = "";
    $("script").each((i, el) => {
        const content = $(el).html() || "";
        if (content.includes("window.__INITIAL_STATE__=")) {
            scriptContent = content;
            return false; // 找到了，停止循环
        }
    });

    if (!scriptContent) {
      console.log("HTML预览(前500字符):", html.slice(0, 500));
      return NextResponse.json({ error: "页面结构已变更，未找到数据源 (__INITIAL_STATE__)" }, { status: 500 });
    }

    // 5. 数据清洗：把 JS 赋值语句变成纯 JSON 字符串
    // 去掉开头的 "window.__INITIAL_STATE__="
    let jsonStr = scriptContent.replace("window.__INITIAL_STATE__=", "");
    
    // 处理 undefined 关键字 (JS里合法，JSON里非法)
    jsonStr = jsonStr.replace(/undefined/g, "null");
    
    // 去掉空白字符
    jsonStr = jsonStr.trim();
    
    // 去掉末尾可能存在的分号
    if (jsonStr.endsWith(";")) {
        jsonStr = jsonStr.slice(0, -1);
    }

    // 6. 解析 JSON
    let data;
    try {
        data = JSON.parse(jsonStr);
    } catch (e) {
        console.error("JSON 解析错误:", e);
        return NextResponse.json({ error: "数据解析失败，JSON 格式错误" }, { status: 500 });
    }

    // 7. 提取业务字段
    // 小红书的数据结构层级比较深，且 key 是动态的 noteId
    const noteMap = data.note?.noteDetailMap || data.note?.firstNote || {};
    const firstKey = Object.keys(noteMap)[0];
    const noteData = noteMap[firstKey]?.note || noteMap[firstKey];

    if (!noteData) {
        return NextResponse.json({ error: "未找到笔记详情数据 (Data Structure Changed)" }, { status: 500 });
    }

    const result = {
      title: noteData.title,
      desc: noteData.desc,
      // 兼容视频笔记(imageList可能为空)和图文笔记
      images: noteData.imageList?.map((img: any) => img.urlDefault) || [],
    };

    console.log("✅ 解析成功:", result);
    return NextResponse.json(result,{status:200});

  } catch (error: any) {
    console.error("❌ 服务端内部错误:", error);
    return NextResponse.json({ error: `解析失败: ${error.message}` }, { status: 500 });
  }
}