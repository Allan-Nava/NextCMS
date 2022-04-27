/*
 * File: AuthCRUD.ts
 * Project: next-cms
 * File Created: Tuesday, 26th April 2022 10:57:59 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Wednesday, 27th April 2022 7:33:08 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */
//
import axios from 'axios'
import { JWTModelToUserModel, JWTModel } from '../types/user'
import jwt_decode from 'jwt-decode'

export const LOGIN_URL = `/api/auth/login`

// Server should return AuthModel
export function login(email: string, password: string) {
  var fd = new FormData()
  fd.append("username", email)
  fd.append("password", password)
  return axios.post(LOGIN_URL, fd, {"headers": {
    "Content-Type" : 'application/x-www-form-urlencoded'
  }});
}
export function getUserByToken(token:string) {
  
  const decoded = jwt_decode<JWTModel>(token as string)
  const user = JWTModelToUserModel(decoded)
  return user
  // return axios.post<UserModel>(GET_USER_BY_ACCESSTOKEN_URL, {
  //   api_token:token
  // })
}
