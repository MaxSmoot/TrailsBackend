import { registerDB } from "../db/register";
import { loginDB } from "../db/login";
import { createAccessToken, createRefreshToken } from "../utils/tokenAuth";
import { LoginParams, RegisterParams } from "../models/authModels";
import { CookieOptions, NextFunction, Request, Response } from "express";
import { decode } from "../utils/tokenAuth";
import { getRedisClient } from "../utils/redisConnection";

/**
 * Registers User to DB
 * Creates Access Token and Refresh Token
 * @param params SignupParams
 * @return refresh token and access token
 */
export async function registerUser(
  req: Request<{}, {}, RegisterParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const userInfo = await registerDB(req.body);
    const accessToken = createAccessToken(userInfo.UserID);
    const refreshToken = await createRefreshToken(userInfo.UserID);
    res.cookie("refreshToken", refreshToken, {
      secure: process.env.NODE_ENV == "production" ? true : false,
      httpOnly: true,
      sameSite: process.env.NODE_ENV == "production" ? true : false,
    });
    res.status(200);
    res.send({ auth: true, token: accessToken });
  } catch (err) {
    next(err);
  }
}

/**
 * Checks provided params against User table of DB
 * Creates Aceess token for that user
 * Createse Refresh Token that user
 * @param params Login Params
 * @return refresh token and access token
 */
export async function loginUser(
  req: Request<{}, {}, LoginParams>,
  res: Response,
  next: NextFunction
) {
  try {
    const userID = await loginDB(req.body);
    const refreshToken = await createRefreshToken(userID);
    const accessToken = createAccessToken(userID);
    const cookieOptions: CookieOptions = {
      secure: process.env.NODE_ENV == "production" ? true : false,
      httpOnly: true,
      sameSite: process.env.NODE_ENV == "production" ? true : false,
    };
    if (req.body.rememberMe) {
      cookieOptions.maxAge = 1.577e10;
    }

    res.cookie("refreshToken", refreshToken, cookieOptions);
    res.status(200);
    res.send({ auth: true, token: accessToken });
  } catch (err) {
    next(err);
  }
}

/**
 * creates and sends a new access token
 * @param req
 * @param res
 */
export function getToken(req: Request, res: Response) {
  const accessToken = createAccessToken(req.token as string);
  res.send({ auth: true, token: accessToken });
}

/**
 * Invalidates refresh token by removing from Redis DB
 * @param req
 * @param res
 */
export function destroyRefreshToken(req: Request, res: Response) {
  const refreshToken = req.cookies["refreshToken"];
  const refreshTokenDecoded = decode(refreshToken);
  const refreshTokenID = (refreshTokenDecoded as any).payload;
  const client = getRedisClient();
  client.del(refreshTokenID as string);
  res.clearCookie("refreshToken");
  res.status(200);
  res.send({ auth: false, message: "refresh token destroyed" });
}
