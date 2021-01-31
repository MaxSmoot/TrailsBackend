
import express from "express";
import { createPost, getPosts } from "../controllers/postController";

const router = express.Router();
/**
 * Route to create a post
 */
router.post("/", createPost);
router.get("/", getPosts)

export default router;
