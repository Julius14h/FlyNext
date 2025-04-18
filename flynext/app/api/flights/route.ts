import { NextRequest, NextResponse } from "next/server";
import {send_request, build_query} from "@/utils/AFS";


// As a visitor, I want to search for flights by specifying a source, destination, and date(s). 
// Source and destination could be either a city or an airport. 
// I want to search for one-way or round-trip flights.

// 2: (Left for frontend) 
// As a visitor, I want to view flight details, including 
// departure/arrival times, duration, and layovers.
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const origin = searchParams.get('source');
    const destination = searchParams.get('destination');
    const dates = searchParams.get('dates')?.split(",") ?? []
    
    
    let flights: {[key: string]: string} = {}
    for (const date of dates) {
        flights[date] = await send_request("/flights" + build_query({origin, destination, date}))
    }

    return NextResponse.json(flights)
}