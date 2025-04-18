import { NextResponse } from "next/server";

export const validateParams = (id: string): [number | null, NextResponse<{error: string}> | null] => {
    if (!(id && !isNaN(Number(id)))){
        return [null, NextResponse.json({error: "invalid param"}, { status: 400 })];
    }
    return [Number(id), null]
} 