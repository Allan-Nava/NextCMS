import React, {useState} from 'react'
import { Modal } from 'react-bootstrap'
import { KTSVG } from '../../helpers'

const Confirmation: React.FC<{show: boolean, title: string, description?: string, handleClose: () => void, onConfirm: () => void}> = ({show, title, description, handleClose, onConfirm}) => {
    
    const [loading, setLoading] = useState(false)

    const clickConfirm = async () => {
        setLoading(true)
        onConfirm()
    }
    const onHide = () => {
        setLoading(false)
    }
    return <Modal show={show} handleClose={handleClose} onExit={onHide} onHide={onHide}> 
            <div className="modal-header">
                <h5 className="modal-title">{title}</h5>
                <div className='btn btn-sm btn-icon btn-active-color-primary' onClick={handleClose}>
                    <KTSVG path='/media/icons/duotune/arrows/arr061.svg' className='svg-icon-1' />
                </div>
            </div>
            <div className="modal-body">
                <p>{description}</p>
            </div>
            <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
                <button type="button" onClick={clickConfirm} className="btn btn-primary">
                    {!loading && <span className='indicator-label'>Continue</span>}
                    {loading && (
                        <span className='indicator-progress' style={{display: 'block'}}>
                        Please wait...
                        <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                        </span>
                    )}
                </button>
            </div>
        </Modal>
}

export default Confirmation