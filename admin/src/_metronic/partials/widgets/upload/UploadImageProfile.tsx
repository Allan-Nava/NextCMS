/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import {toAbsoluteUrl} from '../../../helpers'

type Props = {
  className?: string,
  defaultSrc?: string
}

const UploadImageProfile: React.FC<Props> = ({className, defaultSrc}) => {
  let style = {}
  if (defaultSrc){
    style={backgroundImage: `url(${toAbsoluteUrl(defaultSrc)})`}
  }

  return <div
    className={`image-input image-input-outline ${defaultSrc ? '' : 'image-input-empty'}`}
    data-kt-image-input='true'
    style={{backgroundImage: `url(${toAbsoluteUrl('/media/avatars/blank.png')})`}}
  >
    <div
      className='image-input-wrapper w-125px h-125px'
      style={style}
    ></div>
    <label className="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow"
      data-kt-image-input-action="change"
      data-bs-toggle="tooltip"
      data-bs-dismiss="click"
      title="Change avatar">
      <i className="bi bi-pencil-fill fs-7"></i>
      <input type="file" name="avatar" accept=".png, .jpg, .jpeg" />
      <input type="hidden" name="avatar_remove" />
    </label>
    <span className="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow"
        data-kt-image-input-action="cancel"
        data-bs-toggle="tooltip"
        data-bs-dismiss="click"
        title="Cancel avatar">
        <i className="bi bi-x fs-2"></i>
    </span>

    <span className="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow"
        data-kt-image-input-action="remove"
        data-bs-toggle="tooltip"
        data-bs-dismiss="click"
        title="Remove avatar">
        <i className="bi bi-x fs-2"></i>
    </span>
  </div>
}

export default UploadImageProfile