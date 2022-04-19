/*
 * File: DynamicComponents.tsx
 * Project: next-cms
 * File Created: Monday, 18th April 2022 10:55:41 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Tuesday, 19th April 2022 10:51:44 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

import React from 'react';
import { PageComponent } from '../lib/types/page';
import dynamic from 'next/dynamic';
//
//
const DynamicComponents: React.FC<{ page?: PageComponent[], Wrapper?: React.FC<{position: number}> }> = ({ page, Wrapper }) => {
  
  if (!page) {
    return <></>
  }
  const dynamicComponents = page.map((item, i) => {
    return dynamic(() => import(`${item.path}`).catch((err) => import("./NoComponent")), { loading: ()=> <p>No component {item.path}</p> })
  })
  
  return <>{dynamicComponents.map((Component, index) => 
      Wrapper ?
        <Wrapper key={`component-${index}`} position={index+1}>
          
          <Component {...page[index].props} path={page[index].path}>
            {
              page[index].supportNestedComponent
                ?
                <DynamicComponents page={page[index].components} />
                :
                ""
            }
          </Component>
        </Wrapper>
        :
        <Component key={`component-${index}`} {...page[index].props} path={page[index].path}>
          {
            page[index].supportNestedComponent
              ?
              <DynamicComponents page={page[index].components} />
              :
              ""
          }
        </Component>
  )}
  </>
}

export default DynamicComponents