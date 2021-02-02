import CreateError from "../utils/createError";
import { getConnection, getPool } from "./database";

export async function createPostDB(userID: string, body: string) {
  const connection = await getConnection().catch((e) => {
    throw new CreateError(e, 500, false);
  });
  try {
    await connection.execute(
      `INSERT INTO Posts (UserID, body) VALUES (UUID_TO_BIN(?), ?)`,
      [userID, body]
    );

    connection.release();
  } catch (e) {
    console.log("down here");
    throw new CreateError(e, 401, true);
  }
}

export async function getPostsDB(userID: string) {
  const connection = await getConnection().catch((e) => {
    throw new CreateError(e, 500, false);
  });
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
