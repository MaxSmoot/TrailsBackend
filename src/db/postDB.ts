import CreateError from "../utils/createError";
import { getPool } from "./database";

export async function createPostDB(userID: string, body: string) {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.execute(
      `INSERT INTO Posts (UserID, body) VALUES (UUID_TO_BIN(?), ?)`,
      [userID, body]
    );
    connection.release();
  } catch (e) {
    throw new CreateError(e, 401, true);
  }
}

export async function getPostsDB(userID: string) {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const [
      results,
      fields,
    ] = await connection.execute(
      `SELECT Posts.body, Posts.timestamp, User.Username FROM Posts JOIN User USING(UserID) WHERE (Posts.UserID = UUID_TO_BIN(?) OR Posts.UserID = (SELECT FollowingUser FROM Following WHERE Following.UserID = UUID_TO_BIN(?))) ORDER BY timestamp DESC`,
      [userID, userID]
    );
    connection.release();
    return results;
  } catch (e) {
    throw new CreateError(e, 401, true);
  }
}
