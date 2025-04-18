import prisma from "@/utils/prisma";
import { comparePassword, generateAccessToken, generateRefreshToken } from "@/utils/auth";
import { NextResponse } from "next/server";

type PostBody = { userName: string, password: string, email: string }
export async function POST(request: Request) {
    try {
        const { userName, password, email } = await request.json() as PostBody;
        if ((!userName && !email) || !password) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        if (userName) {
            var user = await prisma.user.findFirst({ where: { userName: userName } });
            if (!user) {
                return NextResponse.json({ error: "Incorrect username or password" }, { status: 401 })
            }

            if (!comparePassword(password, user.password)) {
                return NextResponse.json({ error: "Incorrect username or password" }, { status: 401 })
            }

        } else {
            var user = await prisma.user.findFirst({ where: { email: email } });
            if (!user) {
                return NextResponse.json({ error: "Incorrect email or password" }, { status: 400 })
            }
            if (!comparePassword(password, user.password)) {
                return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 })
            }
        }

        const accessToken = generateAccessToken({ user: user.id });
        const refreshToken = generateRefreshToken({ user: user.id });

        return NextResponse.json({ userId: user.id, accessToken: accessToken, refreshToken: refreshToken })
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}