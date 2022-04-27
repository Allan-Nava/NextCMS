/*
 * File: user.ts
 * Project: next-cms
 * File Created: Tuesday, 26th April 2022 10:57:59 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Wednesday, 27th April 2022 7:34:32 am
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

export interface UserModel {
  id: number
}

export interface JWTModel {
  id: number
}

export const JWTModelToUserModel = (decoded: JWTModel) => {

  return {
    id: decoded.id,
  } as UserModel
  
}