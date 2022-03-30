/* eslint-disable jsx-a11y/anchor-is-valid */
import clsx from 'clsx'
import React, {FC} from 'react'
import {useLayout} from '../../core'
import {DefaultTitle} from '../header/page-title/DefaultTitle'

const Toolbar2: FC = () => {
  
  const {classes} = useLayout()

  return (
    <div className='toolbar' id='kt_toolbar'>
      <div
        id='kt_toolbar_container'
        className={clsx(classes.toolbarContainer.join(' '), 'd-flex flex-stack')}
      >
        <DefaultTitle />
      </div>
    </div>
  )
}

export {Toolbar2}
