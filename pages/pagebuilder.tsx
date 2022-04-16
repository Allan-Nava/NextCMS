import { NextPage } from 'next';
import { DndProvider} from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import LayoutZone from '../components/pagebuilder/LayoutZone';
import Sidebar from '../components/pagebuilder/Sidebar';
import { GetServerSideProps } from 'next';
import { PageComponent } from '../lib/types/page';
import { store } from '../lib/reducers/store';
import { Provider } from 'react-redux';

interface PageBuilderProps {
  availableComponents: PageComponent[]
}

const PageBuilder: NextPage<PageBuilderProps> = ({availableComponents}) => {
  
  return (
    <Provider store={store}>
      <DndProvider backend={HTML5Backend}>
        <div className='container-fluid'>
          <div className='row overflow-hidden'>
            <div className='col-2'>
              <div className='row h-100'>
                <Sidebar components={availableComponents} />
              </div>
            </div>
            <div className='col-10 overflow-auto'>
              <LayoutZone />
            </div>
          </div>
        </div>
      </DndProvider>
    </Provider>
  );
}

// 
export const getServerSideProps: GetServerSideProps = async (context) => {
  
  //
  // API CALL TO GET ALL COMPONENTS AVAILABLE
  // 
  // run inside `async` function
  //const availableComponents = await prisma.coponents.findMany();
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
      }]
    }
  }
  // ...
}


export default PageBuilder