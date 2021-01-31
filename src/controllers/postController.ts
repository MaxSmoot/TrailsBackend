import { Request, Response } from "express";
import { Post } from "../models/postModels";
import { createPostDB, getPostsDB } from "../db/postDB";
import CreateError from "../utils/createError";
export async function createPost(req: Request<{}, {}, Post>, res: Response) {
  const body = req.body.postBody;
  if (body.length > 255 || body.length < 1) {
    throw new CreateError("Invalid Post Body Length", 401, true);
  } else {
    await createPostDB(req.token as string, body);
    res.status(201);
    res.end();
  }
}

export async function getPosts(req: Request, res: Response) {
  const posts = await getPostsDB(req.token as string);
  res.status(200);
  res.send(posts);
}
