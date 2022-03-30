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
//
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router';
import '../styles/sass/style.scss'
import '../styles/sass/style.react.scss'
//
function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const isAdmin = router.pathname.startsWith('/admin');

  return <>
    <Component {...pageProps} />
    </>
  
}
//
export default MyApp;
//
