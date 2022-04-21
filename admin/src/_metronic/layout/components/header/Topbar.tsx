import clsx from 'clsx'
import {FC} from 'react'
import {KTSVG, toAbsoluteUrl} from '../../../helpers'
import {shallowEqual, useSelector} from 'react-redux'
// import {RootState} from '../../../../setup'
// import {UserModel} from '../../../../app/modules/auth/models/UserModel'
import { HeaderUserMenu } from '../../../partials'
import {useLayout} from '../../core'

const toolbarButtonMarginClass = 'ms-1 ms-lg-3',
  toolbarUserAvatarHeightClass = 'symbol-30px symbol-md-40px'

const Topbar: FC = () => {
  // const {config} = useLayout()
  // const user: UserModel = useSelector<RootState>(({auth}) => auth.user, shallowEqual) as UserModel
  return <></>
  // return (
  //   <div className='d-flex align-items-stretch flex-shrink-0'>
  //     <div className='fw-bolder d-flex align-items-center fs-5'>
  //       {user.first_name} {user.last_name}
  //     </div>
  //     <div
  //       className={clsx('d-flex align-items-center', toolbarButtonMarginClass)}
  //       id='kt_header_user_menu_toggle'
  //     >
  //       <div
  //         className={clsx('cursor-pointer symbol', toolbarUserAvatarHeightClass)}
  //         data-kt-menu-trigger='click'
  //         data-kt-menu-attach='parent'
  //         data-kt-menu-placement='bottom-end'
  //         data-kt-menu-flip='bottom'
  //       >
  //         <img src={toAbsoluteUrl('/media/avatars/blank.png')} alt='metronic' />
  //       </div>
  //       <HeaderUserMenu />
  //     </div>
  //     {config.header.left === 'menu' && (
  //       <div className='d-flex align-items-center d-lg-none ms-2 me-n3' title='Show header menu'>
  //         <div
  //           className='btn btn-icon btn-active-light-primary w-30px h-30px w-md-40px h-md-40px'
  //           id='kt_header_menu_mobile_toggle'
  //         >
  //           <KTSVG path='/media/icons/duotune/text/txt001.svg' className='svg-icon-1' />
  //         </div>
  //       </div>
  //     )}
  //   </div>
  // )
}

export {Topbar}
