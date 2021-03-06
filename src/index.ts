import express, { NextFunction, Request, Response } from "express";
import bodyparser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import { createPool } from "./db/database";
import { verifyAccessToken } from "./utils/tokenAuth";
import auth from "./routes/authRoutes";
import postRoutes from "./routes/postRoutes"
import CreateError from "./utils/createError";
import cookieParser from "cookie-parser";
const app = express();
const PORT = 3000;
//initialize mySQL connection
createPool();

app.use(bodyparser.json());
app.use(helmet());
app.use(
  cors({
    origin: process.env.NODE_ENV == "production" ? process.env.PROD_REQUEST_URL: process.env.DEV_REQUEST_URL,
    optionsSuccessStatus: 200,
    credentials: true,
  })
);
app.use(cookieParser());
app.use("/api/auth", auth);
app.use("/api/authenticated/post", verifyAccessToken, postRoutes);
/**
 * Handling invalid routes 404
 */
app.all("*", (req, res, next) => {
  next(
    new CreateError(`Can't find ${req.originalUrl} on this server!`, 404, true)
  );
});

/**
 * Express Error Handler
 */
app.use(
  (error: CreateError, req: Request, res: Response, next: NextFunction) => {
    if (error.isOperational) {
      res.status(error.statusCode);
      res.send({ error: error.message });
    } else {
      res.status(500);
      res.send({ error: "Server Error" });
    }
  }
);

/**
 * Node Error Handler
 */
process.on("uncaughtException", (error: Error | CreateError) => {
  console.error(error);
});

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
