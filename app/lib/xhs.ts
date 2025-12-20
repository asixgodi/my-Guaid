// lib/xhs-data.ts
import { prisma } from "@/lib/prisma";

// 1. 把接口定义也搬过来，导出它，方便其他地方复用类型
export interface XhsApiResponse {
  id: string;
  title: string;
  body: string;
  images: string[];
  ocrTexts: string[] | null;
  jsonBody: any;
  createdAt: string;
  updatedAt: string | null;
}

// 2. 提取获取单个笔记的逻辑 (GET)
export async function getXhsNoteById(id: string): Promise<XhsApiResponse | null> {
  try {
    const xhsNote = await prisma.xhsNote.findUnique({
      where: { id },
    });

    if (!xhsNote) {
      return null;
    }

    // 格式化数据
    const responseData: XhsApiResponse = {
      id: xhsNote.id,
      title: xhsNote.title,
      body: xhsNote.body,
      images: xhsNote.images as string[],
      ocrTexts: xhsNote.ocrTexts as string[] | null,
      jsonBody: xhsNote.jsonBody,
      createdAt: xhsNote.createdAt.toISOString(),
      updatedAt: xhsNote.updatedAt?.toISOString() || null,
    };

    return responseData;
  } catch (error) {
    console.error("Database Error (getXhsNoteById):", error);
    throw new Error("获取笔记数据失败");
  }
}

// 3. 提取删除逻辑 (DELETE) - 虽然你现在可能不用，但为了完整性
export async function deleteXhsNoteById(id: string) {
  try {
    const xhsNote = await prisma.xhsNote.findUnique({
      where: { id },
    });

    if (!xhsNote) {
      return null; // 表示没找到，无法删除
    }

    await prisma.xhsNote.delete({
      where: { id },
    });

    return true; // 删除成功
  } catch (error) {
    console.error("Database Error (deleteXhsNoteById):", error);
    throw new Error("删除笔记失败");
  }
}