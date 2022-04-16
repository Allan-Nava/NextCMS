import React from 'react'
import { PageComponent } from '../../lib/types/page';
import DraggableCard from './DraggableCard';

const Sidebar: React.FC<{components: PageComponent[]}> = ({components}) => {

	return (

		<div className="d-flex flex-column flex-shrink-0 p-3 bg-light">
			<a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-dark text-decoration-none">
				<span className="fs-4">Sidebar</span>
			</a>
			{
				components.map((item, index) => <DraggableCard key={`draggable-${item.name}-${index}`} component={item}/>)
			}
		</div>
	)
}

export default Sidebar