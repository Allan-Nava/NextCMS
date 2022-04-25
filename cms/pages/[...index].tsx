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
import { pagesRepo } from '../lib/helpers/page-repo';
//
// need to pass the props from server side render
const Home: NextPage = ( { data }: any) => {
  console.log("data ", data);
  return (
    <DynamicComponents page={data} />
  )
}
//
//
//
export const getServerSideProps: GetServerSideProps = async (context) => {
  // API CALL TO GET SLUG PAGE INFORMATION
  // IF THE SLUG IS NOT PRESENT ON THE DB PAGE TABLE REDIRECT TO 404
  //const page: Page = await prisma.page.getPage(context.req.url)
  // if (page.statusCode == 400)
  //   return {
  //     notFound: true
  //   };
  console.log("getServerSideProps context ", context);
  // need to fix with base url programmatically
  if(context.req.url != null){
    console.log("getServerSideProps context.req.url ", context.req.url);
    const pages = await pagesRepo.getBySlug(context.req.url);
    console.log("pages", pages);
    const basePages = JSON.parse(JSON.stringify(pages));
    return {
      props: { basePages },
    }
  } else {
    return {
      notFound: true
    }
  }
  //
}
//
export default Home;
//