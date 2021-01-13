import bcrypt from "bcrypt";
/**
 * Uses Bcyrpt to create Password Hash for DB
 * @return hashed password
 * @param password 
 */
export default async function hashPassword(password: String) {
  let hash: String;
  try {
    hash = await bcrypt.hash(password, 10);
  } catch (err) {
    throw new Error(err);
  }
  return hash;
}
