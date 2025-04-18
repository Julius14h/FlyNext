import  prisma  from "@/utils/prisma";
import { Prisma } from "@prisma/client";

export async function createNotification(userId: number, message: string, bookingId: number | null) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      message,
      bookingId,
    },
  });

}