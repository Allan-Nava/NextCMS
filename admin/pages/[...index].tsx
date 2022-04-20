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
import type { GetServerSideProps, NextPage, GetStaticProps } from 'next';
import type { AppProps } from 'next/app';
import DynamicComponents from '../components/DynamicComponents';
//
// need to pass the props from server side render
const Home: NextPage = ( { data }: any) => {
  console.log("data ", data);
  return (
    <DynamicComponents />
  )
}
//
/*export const getStaticProps : GetStaticProps = async (context) => {
  const res = await fetch('http://localhost:3000/api/components');
  console.log("res components", res);
  const pages = await res.json();
  return {
    props: { pages },
  }
  //
}*/
//

export const getServerSideProps: GetServerSideProps = async (context) => {
  // API CALL TO GET SLUG PAGE INFORMATION
  // IF THE SLUG IS NOT PRESENT ON THE DB PAGE TABLE REDIRECT TO 404
  //const page: Page = await prisma.page.getPage(context.req.url)
  // if (page.statusCode == 400)
  //   return {
  //     notFound: true
  //   };
  const res = await fetch('http://localhost:3000/api/page');
  console.log("res", res);
  const pages = await res.json();
  return {
    props: { pages },
  }
  //
}
//
export default Home;
//