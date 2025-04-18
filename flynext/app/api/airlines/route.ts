import { NextResponse } from "next/server";
import { send_request } from "@/utils/AFS";

export async function GET(_request: Request) {
    return NextResponse.json(await send_request("/airlines", {method:"GET"}))
}