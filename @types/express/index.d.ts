import { LoginParams } from "../../src/models/authModels";

declare global {
  namespace Express {
    export interface Request {
      token?: string;
    }
  }
}
