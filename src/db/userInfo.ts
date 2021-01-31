import CreateError from "../utils/createError";
import { getPool } from "./database";

export async function getUserInfoDB(userID: string) {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const [
      results,
      fields,
    ] = await connection.execute(
      `SELECT Username, Phone, FName, LName, Email FROM User where UserID = UUID_TO_BIN(?)`,
      [userID]
    );
    connection.release();
    return (results as any)[0];
  } catch (e) {
    throw new CreateError(e, 401, true);
  }
}
