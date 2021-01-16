import { json } from "body-parser";
import express, { Request, response } from "express";
import asyncHandler from "express-async-handler";
import {
  registerUser,
  loginUser,
  getToken,
  destroyRefreshToken,
} from "../controllers/authController";

import { verifyRefreshToken } from "../utils/tokenAuth";
const router = express.Router();
/**
 * Route to register a new user
 */
router.post("/register", registerUser);
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

export default router;
