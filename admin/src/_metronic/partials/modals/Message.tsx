/*
 * File: Message.tsx
 * Project: next-admin
 * File Created: Tuesday, 19th April 2022 11:25:16 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Thursday, 21st April 2022 8:18:24 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

import React from 'react'
import { Modal } from 'react-bootstrap'
import { KTSVG } from '../../helpers'

interface MessageProp{
    show: boolean
    message: string
    type: string
    handleClose: () => void
}

const Message: React.FC<MessageProp> = ({show, type, message, handleClose}) => {
    

    return <Modal show={show} handleClose={handleClose}> 
            <div className="modal-header">
                <h5 className="modal-title">{type === "success" ? "Success" : "Error"}</h5>
                <div className='btn btn-sm btn-icon btn-active-color-primary' onClick={handleClose}>
                    <KTSVG path='/media/icons/duotune/arrows/arr061.svg' className='svg-icon-1' />
                </div>
            </div>
            <div className="modal-body">
                <p>{message}</p>
            </div>
            <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={handleClose}>Close</button>
            </div>
        </Modal>
}

export default Message