import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { v4 } from "uuid";
import { RefreshTokensObject } from "../models/authModels";
import CreateError from "./createError";
import {
  getRedisClient,
  getRefreshTokens,
  storeRefreshTokens,
} from "./redisConnection";

/**
 *Creates an access token for the User identified by UserID
 * @param userID Unique ID for User
 * @return access token (jwt)
 */
export function createAccessToken(userID: string) {
  const signOptions: jwt.SignOptions = {
    expiresIn: "300000",
    algorithm: "RS256",
  };
  return jwt.sign({ userID }, process.env.PRIVATE_KEY as string, signOptions);
}
/**
 * Expresss middleware to verify validity of the access token
 *
 * @param req
 * @param res
 * @param next
 */
export function verifyAccessToken(
  req: Request,
  __res: Response,
  next: NextFunction
) {
  const header = req.headers["authorization"];
  if (!header) {
    next(new CreateError("No Access Token Provided", 401, true));
  } else {
    const token = (header as string).split(" ")[1];
    try {
      const userID = jwt.verify(
        token as string,
        process.env.PUBLIC_KEY as string
      );
      req.token = (userID as any).userID;
      next();
    } catch (err) {
      next(new CreateError("Invalid Access Token", 401, true));
    }
  }
}
/**
 * Creates a refresh token for the user identified by userID
 *@param userID Unique ID for user
 * @ptodo implement redis expiration
 */
export async function createRefreshToken(_userID: string) {
  const randomPayload = v4();
  const secondaryRandomPayload = v4();
  const tokenObject: RefreshTokensObject = {
    userID: _userID,
    secondaryRefreshToken: secondaryRandomPayload,
  };
  const signOptions: jwt.SignOptions = {
    algorithm: "RS256",
  };
  await storeRefreshTokens(randomPayload, tokenObject);

  return {
    refreshToken: jwt.sign(
      randomPayload,
      process.env.REFRESH_TOKEN_PRIVATE_KEY as string,
      signOptions
    ),
    secondaryRefreshToken: jwt.sign(
      secondaryRandomPayload,
      process.env.REFRESH_TOKEN_PRIVATE_KEY as string,
      signOptions
    ),
  };
}

/**
 * Express middleware to verify validity of refresh token
 * @param req
 * @param res
 * @param next
 */
export async function verifyRefreshToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const refreshToken = req.cookies["refreshToken"];
  const secondaryRefreshToken = req.cookies["secondaryRefreshToken"];
  if (!refreshToken) {
    next(new CreateError("No refresh token provided", 401, true));
  } else if (!secondaryRefreshToken) {
    res.clearCookie("refreshToken"); //clear refreshToken if no secondary refreshToken is present
    next(new CreateError("No secondary refresh token provided", 401, true));
  } else {
    const refreshTokenID = <string>(
      jwt.verify(refreshToken, `${process.env.REFRESH_TOKEN_PUBLIC_KEY}`)
    );
    const secondaryRefreshTokenID = <string>(
      jwt.verify(
        secondaryRefreshToken,
        `${process.env.REFRESH_TOKEN_PUBLIC_KEY}`
      )
    );
    //userID from httponly refresh token
    const refreshTokensString = await getRefreshTokens(refreshTokenID).catch(() =>
      next(new CreateError("Invalid refresh token", 401, true))
    );
    //parse back into object
    const refreshTokens : RefreshTokensObject = JSON.parse(refreshTokensString as string);
    
    //both userIDs must match from both tokens
    if (secondaryRefreshTokenID === refreshTokens.secondaryRefreshToken) {
      req.token = refreshTokens.userID;
      next();
    } else {
      next(new CreateError("Invalid Refresh Token", 401, true));
    }
  }
}

/**
 * Decode a jwt without verifying
 * @param token
 */
export function decode(token: string) {
  return jwt.decode(token, { complete: true });
}
