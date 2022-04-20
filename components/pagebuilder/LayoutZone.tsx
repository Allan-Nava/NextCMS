/*
 * File: LayoutZone.tsx
 * Project: next-cms
 * File Created: Tuesday, 19th April 2022 10:56:57 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Wednesday, 20th April 2022 7:26:37 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

import React, {useMemo} from "react";
import { useDrop } from "react-dnd";
import { useAppSelector, useAppDispatch } from "../../lib/hooks/dispatchHook";
import { moveItem, removeItem, selectLayout } from "../../lib/reducers/layout/reducer";
import { dragAndDrop } from "../../lib/reducers/dragAndDrop/reducer";
import DynamicComponents from "../DynamicComponents";
import { ItemsType } from "../../lib/types/layout";

const LayoutZone: React.FC = () => {
	const pages = useAppSelector(selectLayout);
	const components = useMemo(() => pages.components, [pages.components])

	return (
		<div className="vh-100 layout-zone">
			<div className="container">
				{
					components.length > 0 
					?
					<DynamicComponents page={components} Wrapper={DroppableLayer}/> 
					:
					<InitialDroppableArea />
				}
			</div>
		</div>
	)
	
}

const InitialDroppableArea: React.FC = () => {
	const dragging = useAppSelector(dragAndDrop).dragging;
	return  <div className={`d-flex droppable-layer${dragging ? " dragging" : ""} justify-content-center align-items-center vh-100`}>
		<DroppableArea className="first" index={0}  />
		<h1>Drag and Drop Component in the red areas</h1>
		<DroppableArea className="last" index={0}  />
	</div>
}

const DroppableLayer: React.FC<{position: number, total: number}> = ({children, position, total}) => {
	const dragging = useAppSelector(dragAndDrop).dragging;
	const dispatch = useAppDispatch();
	
	return <div className={`droppable-layer${dragging ? " dragging" : ""}`}>
		<DroppableArea className="first" index={position}  />
		{children}
		<DroppableArea className="last" index={position+1} />
		<div className="component-settings justify-content-end px-3 py-1">
			{
				position == 0
				?
				""
				:
				<div className="component-settings-item">
					<button className="btn" onClick={() => {
						dispatch(moveItem({from: position, to: position-1}))
					}}>
					<i className="bi bi-arrow-bar-up"></i>
					</button>
				</div>
			}
			<div className="component-settings-item">
				<button className="btn" onClick={() => { dispatch(removeItem({index: position})) }}>
					<i className="bi bi-trash"></i>
				</button>
			</div>
			{
			position == total - 1
			?
			""
			:
			<div className="component-settings-item">
				<button className="btn" onClick={() => {
					dispatch(moveItem({from: position, to: position+1}))
				}}>
				<i className="bi bi-arrow-bar-down"></i>
				</button>
			</div>

			}
		</div>
		
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