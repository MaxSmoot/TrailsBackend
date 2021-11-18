import { NextFunction, Request, Response } from "express";
import { CreatePost, DeletePost } from "../models/postModels";
import { createPostDB, deletePostDB, getPostsDB } from "../db/postDB";
import CreateError from "../utils/createError";
export async function createPost(
  req: Request<{}, {}, CreatePost>,
  res: Response,
  next: NextFunction
) {
  const body = req.body.postBody;
  if (body.length > 255 || body.length < 1) {
    next(new CreateError("Invalid Post Body Length", 401, true));
  } else {
    await createPostDB(req.token as string, body).catch((e) => {
      next(e);
    });
    res.status(201);
    res.end();
  }
}

export async function getPosts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const posts = await getPostsDB(req.token as string);
    res.status(200);
    res.send(posts);
  } catch (e) {
    next(e);
  }
}

export async function deletePost(req: Request<{}, {}, DeletePost>, res: Response, next: NextFunction){
  if(req.body.userID != req.token) {
    next(new CreateError("unauthorized delete request", 403, true));
  }
  else {
    try {
      await deletePostDB(req.body.userID, req.body.timestamp);
    } catch (e) {
      next(e);
    }
  }
}