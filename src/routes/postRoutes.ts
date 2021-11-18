import express, { NextFunction, Request, Response } from "express";
import { createPost, getPosts, deletePost } from "../controllers/postController";
import { check, validationResult } from "express-validator";
import CreateError from "../utils/createError";

const router = express.Router();
/**
 * Route to create a post
 */
router.post(
  "/",
  [check("postBody").isLength({ min: 1, max: 255 })],
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
  createPost
);
router.get("/", getPosts);

router.delete("/", deletePost);

export default router;
