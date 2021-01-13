import { registerDB } from "../db/register";
import { loginDB } from "../db/login";
import {
  createAccessToken,
  createRefreshToken,
} from "../utils/tokenAuth";
import { LoginParams, RegisterParams } from "../models/authModels";
/**
 * Registers User to DB
 * Creates Access Token and Refresh Token
 * @param params SignupParams
 * @return refresh token and access token
 */
export async function registerUser(params: RegisterParams) {
  const userInfo = await registerDB(params);

  const accessToken = createAccessToken(userInfo.UserID);

  const refreshToken = await createRefreshToken(userInfo.UserID);

  return { accessToken, refreshToken };
}
/**
 * Checks provided params against User table of DB
 * Creates Aceess token for that user
 * Createse Refresh Token that user
 * @param params Login Params
 * @return refresh token and access token
 */
export async function loginUser(params: LoginParams) {
  const userID = await loginDB(params);
  const refreshToken = await createRefreshToken(userID);
  const accessToken = createAccessToken(userID);
  return { refreshToken, accessToken };
}
