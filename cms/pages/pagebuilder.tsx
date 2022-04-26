/*
 * File: pagebuilder.tsx
 * Project: next-cms
 * File Created: Monday, 18th April 2022 10:55:41 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Monday, 18th April 2022 10:55:56 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
//
import { NextPage } from 'next';
import { DndProvider} from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import LayoutZone from '../components/pagebuilder/LayoutZone';
import Sidebar from '../components/pagebuilder/Sidebar';
import { GetServerSideProps } from 'next';
import { PageComponent } from '../lib/types/page';

interface PageBuilderProps {
  availableComponents: PageComponent[]
}

const PageBuilder: NextPage<PageBuilderProps> = ({availableComponents}) => {
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className='container-fluid'>
        <div className='row overflow-hidden'>
          <div className='col-3'>
            <div className='row vh-100 overflow-auto'>
              <Sidebar components={availableComponents} />
            </div>
          </div>
          <div className='col-9'>
            <LayoutZone />
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
//
// 
export const getServerSideProps: GetServerSideProps = async (context) => {
  console.log(context);
  //
  // API CALL TO GET ALL COMPONENTS AVAILABLE
  // 
  // run inside `async` function
  //const availableComponents = await prisma.components.findMany();
  //
  return {
    props: {
      availableComponents: [{
        name: "navbar",
        path: "./Elements/Navbar",
        props: {"ciao": "ciao"},
        supportNestedComponent: false
      },
      {
        name: "hero",
        path: "./Elements/Hero",
        supportNestedComponent: false
      },
      {
        name: "ciao",
        path: "./Elements/Ciao",
        supportNestedComponent: false
      },
      {
        name: "features",
        path: "./Elements/Features",
        supportNestedComponent: false
      }] // COMPONENTS RETRIEVED BY COMPONENTS API CALL
    }
  }
  // ...
}


export default PageBuilder