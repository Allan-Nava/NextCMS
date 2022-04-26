import { Action } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { put, takeLatest, select } from 'redux-saga/effects'
import { getUserByToken } from '../../crud/AuthCrud'
import { UserModel } from '../../types/user'


export interface ActionWithPayload<T> extends Action {
  payload?: T
}

export const actionTypes = {
  Login: '[Login] Action',
  Logout: '[Logout] Action',
  UserLoaded: '[Load User] Auth API',
  UserRequested: '[Request User] Action',
}



const initialAuthState: IAuthState = {
  user: undefined,
  accessToken: undefined,
  refreshToken: undefined,
}

export interface IAuthState {
  user?: UserModel
  accessToken?: string
  refreshToken?: string
}


export const reducer = persistReducer(
  {storage, key: 'cms-auth', whitelist: ['user', 'accessToken', 'refreshToken']},
  (state: IAuthState = initialAuthState, action: ActionWithPayload<IAuthState>) => {
    switch (action.type) {
      case actionTypes.Login: {
        const accessToken = action.payload?.accessToken
        const refreshToken = action.payload?.refreshToken
        return {accessToken, refreshToken, user: undefined}
      }
      case actionTypes.Logout: {
        return initialAuthState
      }
      case actionTypes.UserLoaded: {
        const user = action.payload?.user
        return {...state, user}
      }

      default:
        return state
    }
  }
)

export const actions = {
  login: (access_token: string, refresh_token: string) => ({type: actionTypes.Login, payload: {accessToken: access_token, refreshToken: refresh_token}}),
  logout: () => ({type: actionTypes.Logout}),
  requestUser: () => ({
    type: actionTypes.UserRequested,
  }),
  fulfillUser: (user: UserModel) => ({type: actionTypes.UserLoaded, payload: {user}}),
}

export function* saga() {
  yield takeLatest(actionTypes.Login, function* loginSaga() {
    yield put(actions.requestUser())
  })

  yield takeLatest(actionTypes.UserRequested, function* userRequested() {
    // @ts-ignore
    const getToken = (state) => state.auth.accessToken;
    // @ts-ignore
    let token = yield select(getToken)
    const user = getUserByToken(token)
    yield put(actions.fulfillUser(user))
  })
}
