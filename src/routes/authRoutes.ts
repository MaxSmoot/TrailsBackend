import express from "express";
import {
  registerUser,
  loginUser,
  getToken,
  destroyRefreshToken,
  getUserInfo,
} from "../controllers/authController";

import { verifyRefreshToken, verifyAccessToken } from "../utils/tokenAuth";
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

/**
 * route to get details about logged in user
 */
router.get("/userinfo", verifyAccessToken, getUserInfo);
export default router;
