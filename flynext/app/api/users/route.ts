import prisma from "@/utils/prisma";
import { hashPassword, isValidEmail, isValidPhone, isValidURL } from "@/utils/auth";
import { NextResponse } from "next/server";

type PostBody = { 
    userName: string, 
    firstName: string, 
    lastName: string, 
    password: string, 
    email: string, 
    profilePicture: string, 
    phoneNumber: string 
}
export async function POST(request: Request) {
    try {
        const { userName, firstName, lastName, password, email, profilePicture, phoneNumber } = await request.json() as PostBody;

        if (!userName || !firstName || !lastName || !password || !email) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        if (!isValidEmail(email)) {
            return NextResponse.json({ error: "Email format invalid" }, { status: 400 })
        }

        if (phoneNumber) {
            if (!isValidPhone(phoneNumber)) {
                return NextResponse.json({ error: "Phone number is invalid" }, { status: 400 })
            }
        }

        if (profilePicture) {
            if (!isValidURL(profilePicture)) {
                return NextResponse.json({ error: "URL is invalid" }, { status: 400 })
            }
        }


        try {
            // existing user generated by chat gpt
            const existingUserName = await prisma.user.findFirst({ where: { userName: userName } });
            if (existingUserName) {
                return NextResponse.json({ error: "Username already exists" }, { status: 400 })
            }
            const existingEmail = await prisma.user.findFirst({ where: { email: email } });
            if (existingEmail) {
                return NextResponse.json({ error: "Email already exists" }, { status: 400 })
            }

            const user = await prisma.user.create({
                data: {
                    userName,
                    firstName,
                    lastName,
                    email,
                    profilePicture,
                    phoneNumber,
                    password: hashPassword(password),
                },
                select: {
                    firstName: true,
                    email: true,
                    userName: true,
                },
            });
            return NextResponse.json({ message: "User created successfully", user: user }, { status: 201 });
        } catch (error) {
            return NextResponse.json({ error: "Error creating user" }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}