import db from '../db.js';

export const createUser = async (username) => {
  try {
    const result = await db.run(
      'INSERT INTO users (username) VALUES (?)',
      [username]
    );
    return { id: result.id, username };
  } catch (error) {
    throw error;
  }
};

export const getUserByUsername = async (username) => {
  return db.get('SELECT * FROM users WHERE username = ?', [username]);
};

export const getUserById = async (id) => {
  return db.get('SELECT * FROM users WHERE id = ?', [id]);
};
