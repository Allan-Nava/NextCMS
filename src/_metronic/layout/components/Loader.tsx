import React from 'react'

const Loader: React.FC = () => {
    return <div className='overlay overlay-show'>
                <div className="overlay-layer rounded bg-white">
                    <span className='spinner-border spinner-border-lg align-middle text-primary'></span>
                </div>
            </div>
}

export default Loader