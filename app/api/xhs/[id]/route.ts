// app/api/xhs/[id]/route.ts
import { NextResponse } from "next/server";
import { getXhsNoteById, deleteXhsNoteById } from "@/app/lib/xhs"; // 引入刚才的文件

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await getXhsNoteById(id); // ✅ 直接调用函数

    if (!data) {
      return NextResponse.json({ error: "小红书笔记不存在" }, { status: 404 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "服务器内部错误" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteXhsNoteById(id); // ✅ 直接调用函数

    if (!success) { // 如果返回 null，说明没找到
      return NextResponse.json({ error: "小红书笔记不存在" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "小红书笔记已成功删除" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "服务器内部错误" },
      { status: 500 }
    );
  }
}