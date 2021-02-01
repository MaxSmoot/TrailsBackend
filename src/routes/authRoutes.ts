import express, { NextFunction, Request, Response } from "express";
import {
  registerUser,
  loginUser,
  getToken,
  destroyRefreshToken,
  getUserInfo,
} from "../controllers/authController";

import { verifyRefreshToken, verifyAccessToken } from "../utils/tokenAuth";
import { check, validationResult } from "express-validator";
import CreateError from "../utils/createError";
const router = express.Router();
/**
 * Route to register a new user
 */
router.post(
  "/register",
  [
    check("email", "Invalid Email").isEmail().normalizeEmail(),
    check("password", "Must include a password").not().isEmpty(),
    check("username", "Must include a username")
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check("phone")
      .not()
      .isEmpty()
      .withMessage("Must include a phone number")
      .trim()
      .escape()
      .isMobilePhone("any")
      .withMessage("Invalid Phone Number"),
    check("firstName", "Must include a first name")
      .not()
      .isEmpty()
      .trim()
      .escape(),
    check("lastName", "Must include a last name")
      .not()
      .isEmpty()
      .trim()
      .escape(),
  ],
  (req: Request, __res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let errorString = "";
      errors.array().forEach((error) => {
        errorString += `${error.msg}\n`;
      });
      next(new CreateError(errorString, 422, true));
    } else {
      next();
    }
  },
  registerUser
);
/**
 * Route to Login a User
 */
router.post("/login", loginUser);
/**
 * Route to get a new access token using a valid refresh token
 */
router.get("/token", verifyRefreshToken, getToken);
/**
 * route to logout (remove refresh token from Redis)
 */
router.get("/logout", verifyRefreshToken, destroyRefreshToken);

/**
 * route to get details about logged in user
 */
router.get("/userinfo", verifyAccessToken, getUserInfo);
export default router;
