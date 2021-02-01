import { getPool } from "./database";
import { v4 } from "uuid";
import createError from "../utils/createError";
import { User } from "../models/user";
/**
 * Inserts new User into MySQL DB
 * @param params
 */
export async function registerDB(user: User) {
  const pool = getPool();
  try {
    const connection = await pool.getConnection();
    const uuid = v4();
    await connection.execute(
      `INSERT INTO User (UserID, Username, Password, Email, Phone, Fname, Lname) VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?)`,
      [
        uuid,
        user.username,
        user.password.getHash(),
        user.email.value,
        user.phone,
        user.firstName,
        user.lastName,
      ]
    );
    connection.release();
    return uuid;
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
    } else {
      throw new createError(errMsg, 400, true);
    }
    throw new createError(errMsg, 400, true);
  }
}
