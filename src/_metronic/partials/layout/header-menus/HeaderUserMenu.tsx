/* eslint-disable jsx-a11y/anchor-is-valid */
import {FC} from 'react'
import {shallowEqual, useSelector} from 'react-redux'
import {UserModel} from '../../../../app/modules/auth/models/UserModel'
import {RootState} from '../../../../setup'
import * as auth from '../../../../app/modules/auth/redux/AuthRedux'
import {useDispatch} from 'react-redux'
// import {Link} from 'react-router-dom'
// import {Languages} from './Languages'
// import {toAbsoluteUrl} from '../../../helpers'

const HeaderUserMenu: FC = () => {
  const user: UserModel = useSelector<RootState>(({auth}) => auth.user, shallowEqual) as UserModel

  const dispatch = useDispatch()
  const logout = () => {
    dispatch(auth.actions.logout())
  }

  return (
    <div
      className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px'
      data-kt-menu='true'
    >
      <div className='menu-item px-3'>
        <div className='menu-content d-flex align-items-center px-3'>
          <div className='d-flex flex-column'>
            <div className='fw-bolder d-flex align-items-center fs-5'>
              {user.first_name} {user.last_name}
            </div>
            <a href='#' className='fw-bold text-muted text-hover-primary fs-7'>
              {user.email}
            </a>
          </div>
        </div>
      </div>

      {/* <Languages /> */}

      <div className='menu-item px-5'>
        <a onClick={logout} className='menu-link px-5'>
          Sign Out
        </a>
      </div>
    </div>
  )
}

export {HeaderUserMenu}
