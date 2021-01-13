import { getPool } from "./database";
import { RegisterParams } from "../models/authModels";
import { v4 } from "uuid";
import hashPassword from "../utils/hashPassword";
import createError from "../utils/createError";
/**
 * Inserts new User into MySQL DB
 * @param params 
 */
export async function registerDB(params: RegisterParams) {
  const pool = getPool();
  try {
    const connection = await pool.getConnection();
    const { username, password, phone, email, firstName, lastName } = params;
    const uuid = v4();
    const hashedPassword = await hashPassword(password);
    await connection.execute(
      `INSERT INTO User (UserID, Username, Password, Email, Phone, Fname, Lname) VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?)`,
      [uuid, username, hashedPassword, email, phone, firstName, lastName]
    );
    connection.release();
    return { UserID: uuid };
  } catch (err) {
    let errMsg = "Error";
    if ((err.errno = 1062)) {
      if (err.sqlMessage.includes("User.Unique_Username")) {
        errMsg = "A user with that username already exists.";
      } else if (err.sqlMessage.includes("User.Unique_Phone")) {
        errMsg = "That phone number is associated with an existing account.";
      } else if (err.sqlMessage.includes("User.Unique_Email")) {
        errMsg = "That email is associated with an existing account.";
      }
    }else {
      throw new createError(errMsg, 400, true)
    }
    throw new createError(err, 400, true);
  }
}
