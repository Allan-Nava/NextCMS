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
import DynamicComponents from '../components/DynamicComponents'
import { PageComponent } from '../lib/types/page'
//
// 
// 
//
interface IProps {
  page: PageComponent[]
}
const Index: NextPage<IProps> = ({page}) => {
  //const [indexComponent, setIndexComponent] = useState<Component>()
  //render component arrived from server side call
  return <DynamicComponents page={page} />
}
// 
// 
export const getServerSideProps: GetServerSideProps = async (context) => {
  
  //
  // API CALL TO GET INDEX PAGE INFORMATION
  // 
  // run inside `async` function
  //const pages = await prisma.page.findMany();
  // const index: Page = await page.getPage("/") 
  //
  return {
    props: {
      page: [{
        name: "navbar",
        path: "./First",
        props: {"ciao": "ciao"},
        supportNestedComponent: false
      },
      {
        name: "hero",
        path: "./Elements/Hero",
        supportNestedComponent: false
      },
      {
        name: "features",
        path: "./Elements/Features",
        supportNestedComponent: false
      }]
    }
  }
  // ...
}
//
export default Index;
//