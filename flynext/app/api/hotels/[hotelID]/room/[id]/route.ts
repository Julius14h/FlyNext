import prisma from "@/utils/prisma";
import { HotelIDParam, Params } from "@/utils/types";
import { validateParams } from "@/utils/validateParams";
import { NextResponse } from "next/server";

type PutBody = {
    imageUrl: string | null,
}
export async function PUT(request: Request, { params }: Params<{id: string}>) {
    try {
        const parameters = await params;
        const [id, id_err] = validateParams(parameters.id)
        if (id_err) return id_err

        const body = await request.json() as PutBody
        if (!body.imageUrl){
            return NextResponse.json({ error: 'no url' }, { status: 400 });
        }

        const hotel = await prisma.roomTypeImage.update({
            where: { id: id! },
            data: {
                imageUrl: body.imageUrl!
            },
        });

        if (!hotel) {
            return NextResponse.json({ error: 'room not found' }, { status: 404 });
        }

        return NextResponse.json({}, { status: 200 });
    } catch (error) {
        console.error('Error fetching hotel details:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}