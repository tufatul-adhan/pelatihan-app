import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || undefined,
  database: process.env.DB_NAME || 'db_pelatihan',
  max: 10,
});

export const query = async <T = any>(sql: string, values: any[] = []): Promise<T> => {
  // Keep model SQL readable while translating the existing positional placeholders.
  let parameterIndex = 0;
  const postgresSql = sql.replace(/\?/g, () => `$${++parameterIndex}`);
  const isInsert = /^\s*INSERT\s/i.test(postgresSql);
  const statement = isInsert && !/\bRETURNING\b/i.test(postgresSql)
    ? `${postgresSql} RETURNING id`
    : postgresSql;
  const result: QueryResult = await pool.query(statement, values);

  if (/^\s*SELECT\s/i.test(statement)) {
    return result.rows as T;
  }

  if (isInsert) {
    return {
      insertId: result.rows[0]?.id === undefined ? undefined : Number(result.rows[0].id),
      affectedRows: result.rowCount || 0,
    } as T;
  }

  return { affectedRows: result.rowCount || 0 } as T;
};

export default pool;
