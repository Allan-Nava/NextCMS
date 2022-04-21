/* eslint-disable jsx-a11y/anchor-is-valid */
/*
 * File: HeaderUserMenu.tsx
 * Project: next-admin
 * File Created: Tuesday, 19th April 2022 11:25:16 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Thursday, 21st April 2022 8:11:46 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
import {FC} from 'react'
import {shallowEqual, useSelector} from 'react-redux'
//
import {useDispatch} from 'react-redux'
// import {Link} from 'react-router-dom'
// import {Languages} from './Languages'
// import {toAbsoluteUrl} from '../../../helpers'

const HeaderUserMenu: FC = () => {
  
  return (
    <div
      className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px'
      data-kt-menu='true'
    >
      <div className='menu-item px-3'>
        <div className='menu-content d-flex align-items-center px-3'>
          <div className='d-flex flex-column'>
            <div className='fw-bolder d-flex align-items-center fs-5'>
              
            </div>
            <a href='#' className='fw-bold text-muted text-hover-primary fs-7'>
              
            </a>
          </div>
        </div>
      </div>

      {/* <Languages /> */}
      <div className='menu-item px-5'>
        <a className='menu-link px-5'>
          Sign Out
        </a>
      </div>
    </div>
  )
}
//
export {HeaderUserMenu};
//