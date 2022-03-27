/*
 * File: _middleware.ts
 * Project: next-cms
 * File Created: Sunday, 27th March 2022 10:56:47 am
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 27th March 2022 10:57:15 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
//
import { NextFetchEvent, NextRequest, NextResponse } from "next/server";
// 
// 
export function middleware(req: NextRequest, ev: NextFetchEvent ) {
    //
    return NextResponse.next();    
    //
};
//