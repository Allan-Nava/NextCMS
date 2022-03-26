/*
 * File: _app.tsx
 * Project: next-cms
 * File Created: Saturday, 26th March 2022 10:04:25 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Saturday, 26th March 2022 10:24:58 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
//
import '../styles/globals.css'
import type { AppProps } from 'next/app'
//
function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
//
export default MyApp;
//
