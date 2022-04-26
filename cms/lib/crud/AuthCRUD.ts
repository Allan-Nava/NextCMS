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
