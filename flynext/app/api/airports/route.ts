import { NextResponse } from "next/server";
import { send_request } from "@/utils/AFS";

// As a visitor, I want to have an auto-complete dropdown to suggest 
// cities and airports as I type in the source or destination field.
export async function GET(_request: Request) {
    return NextResponse.json(await send_request("/airports", {method:"GET"}))
}