/*
 * File: index.tsx
 * Project: next-cms
 * File Created: Sunday, 27th March 2022 10:42:47 am
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 27th March 2022 10:49:39 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
//
import type { GetServerSideProps, NextPage } from 'next'
import DynamicComponents from "../components/DynamicCompontent";

import prisma from '../lib/prisma';
// 
// 
// 
const Index: NextPage = () => {
  //const [indexComponent, setIndexComponent] = useState<Component>()
  //render component arrived from server side call
  return <DynamicComponents />
}
// 
// 
export const getServerSideProps: GetServerSideProps = async (context) => {
  
  //
  console.log(context);
  // API CALL TO GET INDEX PAGE INFORMATION
  // 
  // run inside `async` function
  //const pages = await prisma.page.findMany();
  console.log("prisma", prisma);
  // const index: Page = await page.getPage("/") 
  //
  return {
    props: {
      //index: index
    }
  }
  // ...
}
//
export default Index;
//