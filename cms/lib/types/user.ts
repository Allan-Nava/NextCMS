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