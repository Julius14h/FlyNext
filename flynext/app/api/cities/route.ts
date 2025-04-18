import { NextResponse } from "next/server";
import { send_request } from "@/utils/AFS";
import prisma from "@/utils/prisma";
import { authenticate } from "@/utils/auth";

// As a visitor, I want to have an auto-complete dropdown to suggest 
// cities and airports as I type in the source or destination field.
export async function GET(_request: Request){
    return NextResponse.json(await send_request("/cities", {method:"GET"}))
}

// Create a new city
export async function POST(request: Request) {
  try {
    // Authenticate the request
    const payload = await authenticate(request);
    if (!payload || !payload.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, country } = await request.json();

    if (!name || !country) {
      return NextResponse.json(
        { error: "Name and country are required" },
        { status: 400 }
      );
    }

    // Check if the city already exists
    const existingCity = await prisma.city.findFirst({
      where: {
        name,
        country,
      },
    });

    if (existingCity) {
      return NextResponse.json(existingCity);
    }

    // Create the city
    const newCity = await prisma.city.create({
      data: {
        name,
        country,
      },
    });

    return NextResponse.json(newCity, { status: 201 });
  } catch (error) {
    console.error("Error creating city:", error);
    return NextResponse.json(
      { error: "Failed to create city" },
      { status: 500 }
    );
  }
}