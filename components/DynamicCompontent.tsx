import dynamic from 'next/dynamic'
import React, { lazy, Suspense } from 'react'
import ErrorBoundary from './ErrorBoundary'

const config = [
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
  name?: React.ComponentType
}
const importedComponents = () => {
  const components: Components =  {}
  for(let i = 0; i < config.length; i++) {
    const key = config[i].name as string
    
    components[key as keyof Components] = dynamic(() => import(`${config[i].path}`), { loading: ()=> <p>loading {config[i].path}</p> })
  }
  return components
}

const DynamicComponents = () => {
  const Components: Components =  importedComponents()
  
  const components = config.map((c, i) => {
    const key = config[i].name as string
    const Component = Components[key as keyof Components]
    return <Component key={i} />
  })
 
  return <>{components}</>
  
}

export default DynamicComponents