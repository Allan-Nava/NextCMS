/*
 * File: page-builder.tsx
 * Project: next-cms
 * File Created: Sunday, 24th April 2022 11:51:06 am
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 24th April 2022 11:51:16 am
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
import { store } from '../lib/reducers/store';
import { Provider } from 'react-redux';
import { componentRepo } from '../lib/helpers/component-repo';

interface PageBuilderProps {
  availableComponents: PageComponent[]
}

const PageBuilder: NextPage<PageBuilderProps> = ({availableComponents}) => {
  
  return (
    <Provider store={store}>
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
    </Provider>
  );
}
//
// 
export const getServerSideProps: GetServerSideProps = async (context) => {
  console.log(context);
  // API CALL TO GET ALL COMPONENTS AVAILABLE
  // run inside `async` function
  let components = await componentRepo.getAll();
  console.log("components", components);
  let availableComponents = components.map(component => {
    console.log("component ", component.property);
    return JSON.parse(component.property);
  });
  console.log("availableComponents", availableComponents);
  //
  return {
    props: {
      availableComponents: availableComponents // COMPONENTS RETRIEVED BY COMPONENTS API CALL
    }
  }
  // ...
}
//
export default PageBuilder;
//