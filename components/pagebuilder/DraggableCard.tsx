import { useDrag } from "react-dnd";
import React, { useEffect } from 'react';
import { PageComponent } from "../../lib/types/page";
import { Card } from "react-bootstrap";
import { ItemsType } from "../../lib/types/layout";
import { useAppDispatch } from "../../lib/hooks/dispatchHook";
import { insertItem } from "../../lib/reducers/layout/reducer";
import { dragHandler } from "../../lib/reducers/dragAndDrop/reducer";


const DraggableCard: React.FC<{component: PageComponent}> = ({component}) => {

  const dispatch = useAppDispatch();

  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemsType.COMPONENT,
    item: { "name":  component.name},
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult<{name: string, index: number}>()
      const newComponent = JSON.parse(JSON.stringify(component))
      if (item && dropResult) {
        const position = dropResult?.index
        dispatch(insertItem({index: position, item: newComponent}))
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      handlerId: monitor.getHandlerId(),
    }),
  }))
  useEffect(() => {
    dispatch(dragHandler({dragging: isDragging}))
  }, [isDragging])

  return <Card ref={drag} role="Box" className='mb-2'>
    <Card.Body>
      {component.name}
    </Card.Body>
  </Card>
}
export default DraggableCard