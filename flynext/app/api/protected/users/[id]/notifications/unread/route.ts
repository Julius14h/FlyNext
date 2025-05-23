import  prisma from "@/utils/prisma";
import { authenticate} from "@/utils/auth";
import { NextResponse } from "next/server";
import { IDParam, Params } from "@/utils/types";

// generated by grok
export async function GET(request:Request, { params }: IDParam) { 
  try {
  const authenticated = authenticate(request);
  if (!authenticated) {
    return NextResponse.json({error: "Unauthorized"}, { status: 401 });
  }
  const {id} = await params;
  const userId = Number(id);
  if (authenticated.user !== userId) {
    return NextResponse.json(
      { error: 'Forbidden: You cannot get the notifications of another user' },
      { status: 403 }
    );
  }
  const unreadCount = await prisma.notification.count({
    where: {
      userId: userId,
      isRead: false,
    },
  });
  return NextResponse.json({ unreadCount }, { status: 200 });
} catch (error) {
  return NextResponse.json(
    { error: 'Internal Server Error' },
    { status: 500 }
  );
} 
}
