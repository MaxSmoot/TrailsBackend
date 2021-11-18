import { registerDB } from "../db/register";
import { loginDB } from "../db/login";
import { createAccessToken, createRefreshToken } from "../utils/tokenAuth";
import { LoginParams, RegisterParams } from "../models/authModels";
import { CookieOptions, NextFunction, Request, Response } from "express";
import { decode } from "../utils/tokenAuth";
import { delValue } from "../utils/redisConnection";
import { getUserInfoDB } from "../db/userInfo";
import { User } from "../models/user";
import { Password } from "../common/password";
import { Email } from "../common/email";
import CreateError from "../utils/createError";

//cookie options for registering and logging in
const cookieOptions: CookieOptions = {
  secure: process.env.NODE_ENV == "production" ? true : false,
  httpOnly: true,
  sameSite: process.env.NODE_ENV == "production" ? "strict" : "lax",
};
const secondaryCookieOptions: CookieOptions = {

};

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
    const body = req.body;
    const password = await Password.of(body.password);
    const email = new Email(body.email);
    const userID = await registerDB(
      new User(
        body.username,
        email,
        password,
        body.phone,
        body.firstName,
        body.lastName
      )
    );
    const accessToken = createAccessToken(userID);
    const refreshTokenObject = await createRefreshToken(userID);
    res.cookie("refreshToken", refreshTokenObject.refreshToken, cookieOptions);
    res.cookie(
      "secondaryRefreshToken",
      refreshTokenObject.secondaryRefreshToken,
      secondaryCookieOptions
    );
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
    const refreshTokenObject = await createRefreshToken(userID); //httponly secure refresh token
    const accessToken = createAccessToken(userID);

    if (req.body.rememberMe) {
      cookieOptions.maxAge = 1.577e10;
      secondaryCookieOptions.maxAge = 1.577e10;
    }

    res.cookie("refreshToken", refreshTokenObject.refreshToken, cookieOptions);
    res.cookie(
      "secondaryRefreshToken",
      refreshTokenObject.secondaryRefreshToken,
      secondaryCookieOptions
    );
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
export function getToken(req: Request, res: Response, next: NextFunction) {
  req.token
    ? res.send({ auth: true, token: createAccessToken(req.token) })
    : next(new CreateError("Missing Access Token", 401, true));
}

/**
 * Invalidates refresh token by removing from Redis DB
 * @param req
 * @param res
 */
export async function destroyRefreshToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const refreshToken = req.cookies["refreshToken"];
  const refreshTokenDecoded = <{ payload: string }>decode(refreshToken);
  const refreshTokenID = refreshTokenDecoded.payload;
  await delValue(refreshTokenID).catch((e) => next(e));
  res.clearCookie("refreshToken");
  res.clearCookie("secondaryRefreshToken");
  res.status(200);
  res.send({ auth: false, message: "refresh token destroyed" });
}

export async function getUserInfo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.token
    ? res.status(200).send(await getUserInfoDB(req.token as string))
    : next(new CreateError("Missing Access Token", 401, true));
}
