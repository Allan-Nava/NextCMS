/*
 * File: Sidebar.tsx
 * Project: next-cms
 * File Created: Monday, 18th April 2022 10:55:41 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Tuesday, 19th April 2022 11:31:45 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

import React from 'react'
import Link from 'next/link';
import { PageComponent } from '../../lib/types/page';
import DraggableCard from './DraggableCard';
//
const Sidebar: React.FC<{components: PageComponent[]}> = ({components}) => {

	return (
		<div className="d-flex flex-column flex-shrink-0 p-3 bg-light">
			{/* href="/"  */}
			<div className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-dark text-decoration-none">
				<span className="fs-4">Sidebar</span>
			</div>
			{
				components.map((item, index) => <DraggableCard key={`draggable-${item.name}-${index}`} component={item}/>)
			}
		</div>
	)
}
//
export default Sidebar;
//