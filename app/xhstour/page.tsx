import { XhsDdContent } from "./XhsDdContent";
import { getXhsNoteById } from "@/app/lib/xhs";
// 1. 修改类型定义：searchParams 是一个 Promise
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Page({searchParams}:{searchParams: SearchParams;}) {
 // 2. 关键步骤：先 await 等待 Promise 解析
  const resolvedSearchParams = await searchParams;
  
  // 3. 然后再从解析后的对象中取值
  const noteId = resolvedSearchParams.noteId as string;
  //console.log("resolvedSearchParams:", resolvedSearchParams); // 这里就会打印出真正的对象了
  if(!noteId){
    return <div className="p-6">缺少 noteId 参数</div>
  }
  // 1. 服务端数据获取
  // 注意：fetch 需要完整 URL。如果在本地开发，通常需要配置基础 URL
  // 建议：如果数据库逻辑在同一个项目，直接调用数据库函数比 fetch 更好，可以省去 HTTP 开销
  // 这里演示 Fetch 写法：
  const initialData = await getXhsNoteById(noteId);
  const slimData = {
    id: initialData?.id,
    title: initialData?.title,
    // jsonBody 是生成地图必须的，保留
    jsonBody: initialData?.jsonBody, 
  };
  // 2. 将数据传给 Client 组件
  // 此时，Server Component 任务完成，数据随 HTML 一起发送
  return <XhsDdContent initialData={slimData} />;
}