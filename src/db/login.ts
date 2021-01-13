import { getPool } from "./database";
import { LoginParams } from "../models/authModels";
import bcrypt from "bcrypt";
import createError from "../utils/createError";
import CreateError from "../utils/createError";
/**
 * Checks given login parameters against MySQL DB
 * @param params 
 */
export async function loginDB(params: LoginParams) {
  const pool = getPool();
  let connection;
  connection = await pool.getConnection();
  const { email, password } = params;
  const [
    results,
    fields,
  ] = await connection.execute(
    `SELECT Password, BIN_TO_UUID(UserID) as UserID from User WHERE Email = ?`,
    [email]
  );
  if ((results as Array<any>).length == 0) {
    throw new createError("Incorrect Email or Password", 401, true);
  }
  const returnedData = await JSON.parse(JSON.stringify(results))[0];
  const match = await bcrypt.compare(password, returnedData.Password);
  connection.release();
  if (!match) {
    throw new createError("Incorrect Email or Password", 401, true);
  } else {
    return returnedData.UserID;
  }
}
