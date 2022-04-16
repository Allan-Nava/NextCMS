import React, {useMemo} from "react";
import { useDrop } from "react-dnd";
import { useAppSelector } from "../../lib/hooks/dispatchHook";
import { selectLayout } from "../../lib/reducers/layout/reducer";
import { dragAndDrop } from "../../lib/reducers/dragAndDrop/reducer";
import DynamicComponents from "../DynamicComponents";
import { ItemsType } from "../../lib/types/layout";

const LayoutZone: React.FC = () => {
	const pages = useAppSelector(selectLayout);
	const components = useMemo(() => pages.components, [pages.components])

	return (
		<div className="vh-100 layout-zone">
			{
				components.length > 0 
				?
				<DynamicComponents page={components} Wrapper={DroppableLayer}/> 
				:
				<DroppableLayer position={1}>
					<div className="empty-zone">
						<p>Drag and drop components here</p>
					</div>
				</DroppableLayer>
				}
			
			
		</div>
	)
}

const DroppableLayer: React.FC<{position: number}> = ({children, position}) => {
	const dragging = useAppSelector(dragAndDrop).dragging;
	
	return <div className={`droppable-layer${dragging ? " dragging" : ""}`}>
		<DroppableArea className="first" index={position-1}  />
		{children}
		<DroppableArea className="last" index={position} />
	</div>
}


const DroppableArea: React.FC<{index?: number, className?: string}> = ({index, className}) => {
	
	const [{ canDrop, isOver }, drop] = useDrop(() => ({
		accept: ItemsType.COMPONENT,
		drop: () => ({ name: 'LayoutComponent', index: index }),
		collect: (monitor) => ({
			isOver: monitor.isOver(),
			canDrop: monitor.canDrop(),
		}),
	}), [index])

	return <div ref={drop} role={"LayoutComponent"} className={`droppable-area${isOver ? " isOver" : ""}${className ? ` ${className}` : "" }`}></div>
}


export default LayoutZone