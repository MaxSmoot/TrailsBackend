import mysql2 from "mysql2/promise";
import dotenv from "dotenv";
import CreateError from "../utils/createError";
let pool: mysql2.Pool;
/**
 * Creates the MySQL Pool to be used by rest of backend
 */
export async function createPool() {
  dotenv.config();
  pool = mysql2.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });
}

export function getPool() {
  return pool;
}
export async function getConnection() {
  return await pool.getConnection();
}
