import React from 'react';
import { PageComponent } from '../lib/types/page';
import dynamic from 'next/dynamic';


const DynamicComponents: React.FC<{ page?: PageComponent[], Wrapper?: React.FC<{position: number, total: number}> }> = ({ page, Wrapper }) => {
  
  if (!page) {
    return <></>
  }
  const dynamicComponents = page.map((item, i) => {
    return dynamic(() => import(`${item.path}`).catch((err) => import("./NoComponent")), { loading: ()=> <p>No component {item.path}</p> })
  })
  
  return <>{dynamicComponents.map((Component, index) => 
      Wrapper ?
        <Wrapper key={`wrapper-component-${index}`} position={index} total={page.length}>
          
          <Component {...page[index].props} path={page[index].path}>
            {
              page[index].supportNestedComponent
                ?
                <DynamicComponents page={page[index].components} />
                :
                <></>
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
              <></>
          }
        </Component>
  )}
  </>
}

export const DynamicComponent: React.FC<{path: string}> = ({ children, path }) => {
  const Component = dynamic(() => import(`${path}`).catch((err) => import("./NoComponent")), { loading: ()=> <p>No component {path}</p> })

  return <>{<Component path={path} />}</>
}

export default DynamicComponents