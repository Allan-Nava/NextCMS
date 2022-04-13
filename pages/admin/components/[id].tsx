/*
 * File: [id].tsx
 * Project: next-cms
 * File Created: Wednesday, 13th April 2022 9:58:47 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Wednesday, 13th April 2022 9:59:09 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
import type { GetServerSideProps, NextPage, GetStaticProps } from 'next';

// need to pass the props from server side render
const ComponentDetail: NextPage = ( { data }: any) => {
    console.log("data ", data);
    return (
      <></>
    )
}
//
export default ComponentDetail;
//