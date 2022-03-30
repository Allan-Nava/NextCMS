/*
 * Created on Thu Mar 17 2022
 * Updated on Thu Mar 17 2022
 *
 * [ Allan Nava ] 
 * Copyright (©)  2022 HiWay Media SRL
 */

import { FC } from 'react'
import { Modal } from 'react-bootstrap'
import {KTSVG} from '../../../helpers'
import MediaList  from '../../../../app/modules/media/components/MediaList'
import { MediaModel } from '../../../../app/modules/media/models/MediaModel'
//

const MultiMedia: FC<{show: boolean, action: string, type?: string, format?: string,  handleClose: () => void, onSelect: (item: MediaModel) => void}> = ({show, action, type, format, handleClose, onSelect}) =>{
  //
  const onSelectMedia = (item: MediaModel) => {
    onSelect(item)
    handleClose()
  }
  return (
    // <div className='modal fade' id='multiMedia' aria-hidden='true'>
    <Modal show={show} fullscreen={true} handleClose={handleClose}>
      <div className='modal-header'>
        <h2>Media update</h2>

        <div className='btn btn-sm btn-icon btn-active-color-primary' onClick={handleClose}>
          <KTSVG path='/media/icons/duotune/arrows/arr061.svg' className='svg-icon-1' />
        </div>
      </div>

      <div className='modal-body py-lg-10 px-lg-10'>
        <MediaList action={action} type={type} format={format} onSelect={onSelectMedia} />
      </div>
    </Modal>
  )
}

export {MultiMedia}