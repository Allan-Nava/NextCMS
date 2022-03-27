/*
 * File: DynamicCompontent.tsx
 * Project: next-cms
 * File Created: Sunday, 27th March 2022 10:42:47 am
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 27th March 2022 10:43:00 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
import dynamic from 'next/dynamic'  
import fs, { PathLike } from "fs"
//
const config: Component[] = [
  {
    name: 'First',
    path: './First',
    props: {name: 'Yannis', surname: 'Marios'}
  },
  {
    name: 'Second',
    path: './Second',
    props: {name: 'John', surname: 'Doe'}
  }
]

interface GenericObject {
  [key: string]: GenericObject | GenericObject[] | string | number
}

const validation = <Obj extends GenericObject>(obj: Obj) => obj


interface Component {
  name?: string
  path?: string
  props?: GenericObject
}
interface Components {
  name?: any
}
const importedComponents = () => {
  const components: Components =  {}
  for(let i = 0; i < config.length; i++) {
    const key = config[i].name as string
    components[key as keyof Components] = dynamic(() => import(`${config[i].path}`), { loading: ()=> <p>No component {config[i].path}</p>, ssr: false })
  }
  return components
}

const DynamicComponents = () => {
  const componentsList = importedComponents()
  // const Components: Components =  importedComponents()
  
  const components = config.map((c, i) => {
    const key = config[i].name as string
    return componentsList[key as keyof Components] 
  })
 
  return <>
    {components.map((Component, index) => {
      return <Component props={config[index].props} key={`component-${index}`} />
    })}
  </>
  
}
//
export default DynamicComponents;
//