import { json } from "body-parser";
import express, { response } from "express";
import asyncHandler from "express-async-handler";
import { registerUser, loginUser } from "../controllers/authController";
import CreateError from "../utils/createError";
import {
  createAccessToken,
  destroyRefreshToken,
  verifyRefreshToken,
} from "../utils/tokenAuth";
const router = express.Router();
/**
 * Route to register a new user
 */
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const tokens = await registerUser(req.body);
    res.status(200);
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: 1.577e10,
      secure: process.env.NODE_ENV == "production" ? true : false,
    });
    res.send({ auth: true, token: tokens.accessToken });
  })
);
/**
 * Route to Login a User
 */
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    /**
     * @todo implement proper input validation 
     */
    if (!req.body.email || !req.body.password) {
      throw new CreateError("Must include an email and password", 400, true);
    }
    const tokens = await loginUser(req.body);
    res.cookie("refreshToken", tokens.refreshToken, {
      secure: process.env.NODE_ENV == "production" ? true : false,
      httpOnly: true,
      maxAge: 1.577e10,
    });
    res.send({ auth: true, token: tokens.accessToken });
  })
);
/**
 * Route to get a new access token using a valid refresh token
 */
router.get(
  "/token",
  verifyRefreshToken,
  asyncHandler(async (req, res) => {
    const accessToken = createAccessToken(req.token as string);
    res.send({ auth: true, token: accessToken });
  })
);
/**
 * route to logout (remove refresh token from Redis)
 */
router.get(
  "/logout",
  verifyRefreshToken,
  destroyRefreshToken,
  asyncHandler(async (req, res) => {
    res.send({ auth: false, message: "refresh token destroyed" });
  })
);

export default router;
