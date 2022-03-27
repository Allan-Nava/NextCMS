import type { GetServerSideProps, NextPage } from 'next'
import DynamicComponents from "../components/DynamicCompontent";

const Index: NextPage = () => {
  //const [indexComponent, setIndexComponent] = useState<Component>()
  //render component arrived from server side call
  return <DynamicComponents />
}


export const getServerSideProps: GetServerSideProps = async (context) => {
  
  // API CALL TO GET INDEX PAGE INFORMATION

  // const index: Page = await page.getPage("/")

  return {
    props: {
      //index: index
    }
  }
  // ...
}

export default Index