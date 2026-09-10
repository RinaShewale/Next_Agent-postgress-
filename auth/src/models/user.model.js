import { pool } from "../config/db.js";

// Convert a Postgres row (snake_case) into the camelCase shape
// your controllers already expect, and attach a .save() method
// so `user.save()` keeps working like it did with Mongoose.
const mapRow = (row) => {
  if (!row) return null;

  const user = {
    id: row.id,
    googleId: row.google_id,
    name: row.name,
    email: row.email,
    avatar: row.avatar,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  Object.defineProperty(user, "save", {
    value: async function () {
      const result = await pool.query(
        `UPDATE users
         SET google_id = $1, name = $2, email = $3, avatar = $4, updated_at = NOW()
         WHERE id = $5
         RETURNING *`,
        [this.googleId, this.name, this.email, this.avatar, this.id]
      );
      const updated = mapRow(result.rows[0]);
      Object.assign(this, updated);
      return this;
    },
    enumerable: false, // so it doesn't show up when you log/spread the object
  });

  return user;
};

const User = {
  findById: async (id) => {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return mapRow(result.rows[0]);
  },

  findOne: async (filter) => {
    const key = Object.keys(filter)[0];
    const value = filter[key];

    const columnMap = { googleId: "google_id", email: "email", _id: "id", id: "id" };
    const column = columnMap[key] || key;

    const result = await pool.query(`SELECT * FROM users WHERE ${column} = $1`, [value]);
    return mapRow(result.rows[0]);
  },

  create: async (data) => {
    const { googleId, name, email, avatar } = data;
    const result = await pool.query(
      `INSERT INTO users (google_id, name, email, avatar)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [googleId, name, email, avatar || null]
    );
    return mapRow(result.rows[0]);
  },

  findByIdAndUpdate: async (id, data) => {
    const fields = [];
    const values = [];
    let i = 1;
    const columnMap = { googleId: "google_id" };

    for (const [key, value] of Object.entries(data)) {
      fields.push(`${columnMap[key] || key} = $${i}`);
      values.push(value);
      i++;
    }
    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = $${i} RETURNING *`,
      values
    );
    return mapRow(result.rows[0]);
  },
};

export default User;