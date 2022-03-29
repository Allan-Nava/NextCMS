/*
 * File: index.tsx
 * Project: next-cms
 * File Created: Saturday, 26th March 2022 10:04:25 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Saturday, 26th March 2022 10:24:49 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
//
import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import DynamicComponents from '../components/DynamicCompontent'
import styles from '../styles/Home.module.css'

//
const Home: NextPage = () => {
  return (
    <DynamicComponents />
  )
}
//
//
export const getServerSideProps: GetServerSideProps = async (context) => {
  // API CALL TO GET SLUG PAGE INFORMATION
  // IF THE SLUG IS NOT PRESENT ON THE DB PAGE TABLE REDIRECT TO 404
  // const page: Page = await page.getPage(context.req.url)
  // if (page.statusCode == 400)
  //   return {
  //     notFound: true
  //   };
  return {
    props: {

    }
  }
  // ...
}
//
export default Home;
//