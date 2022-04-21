/*
 * File: MultipleAssign.tsx
 * Project: next-admin
 * File Created: Tuesday, 19th April 2022 11:25:16 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Thursday, 21st April 2022 8:04:57 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

import React, {useEffect, useState} from 'react'
import { Modal } from 'react-bootstrap'
import { KTSVG } from '../../helpers'
import Message from './Message'

interface MultipleAssignProp{
    show: boolean
    handleClose: () => void
    media_ids: number[]
}

const MultipleAssign: React.FC<MultipleAssignProp> = ({show, handleClose, media_ids}) => {

    const [loading, setLoading] = useState(false)
    const [filterState, setFilterState]         = useState({"event": "", "round": "", "day": "", "moment": ""});
    const [messageModal, setMessageModal] = useState({"show": false, "message": "", "type": ""})
    //
    const onHide = () => {
        setLoading(false)
    }

    return <>
            <Modal show={show} handleClose={handleClose} onExit={onHide} onHide={onHide}> 
                <div className="modal-header">
                    <h5 className="modal-title">Assign</h5>
                    <div className='btn btn-sm btn-icon btn-active-color-primary' onClick={handleClose}>
                        <KTSVG path='/media/icons/duotune/arrows/arr061.svg' className='svg-icon-1' />
                    </div>
                </div>
                <div className="modal-body">
                </div>
            </Modal>
            <Message show={messageModal.show} message={messageModal.message} type={messageModal.type} handleClose={() => { setMessageModal({...messageModal, "show": false}) }} />
            </>
}
//
export default MultipleAssign;
//