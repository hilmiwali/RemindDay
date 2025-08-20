// database/birthdayDB.js
// This file handles all database operations for storing birthdays locally

import * as SQLite from 'expo-sqlite';

// Open/create the database file called 'birthdays.db'
const db = SQLite.openDatabaseSync('birthdays.db');

// Create the birthdays table if it doesn't exist
export const createTable = () => {
  return new Promise((resolve, reject) => {
    try {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS birthdays (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          birthDate TEXT NOT NULL,
          note TEXT,
          notificationTime TEXT DEFAULT '09:00'
        );
      `);
      console.log('Table created successfully');
      resolve();
    } catch (error) {
      console.log('Error creating table:', error);
      reject(error);
    }
  });
};

// Insert a new birthday into the database
export const insertBirthday = (name, birthDate, note, notificationTime = '09:00') => {
  return new Promise((resolve, reject) => {
    try {
      const result = db.runSync(
        'INSERT INTO birthdays (name, birthDate, note, notificationTime) VALUES (?, ?, ?, ?)',
        [name, birthDate, note, notificationTime]
      );
      console.log('Birthday inserted with ID:', result.lastInsertRowId);
      resolve(result.lastInsertRowId);
    } catch (error) {
      console.log('Error inserting birthday:', error);
      reject(error);
    }
  });
};

// Get all birthdays from the database
export const getAllBirthdays = () => {
  return new Promise((resolve, reject) => {
    try {
      const result = db.getAllSync('SELECT * FROM birthdays ORDER BY birthDate ASC');
      console.log('Retrieved birthdays:', result.length);
      resolve(result);
    } catch (error) {
      console.log('Error getting birthdays:', error);
      reject(error);
    }
  });
};

// Update an existing birthday
export const updateBirthday = (id, name, birthDate, note, notificationTime) => {
  return new Promise((resolve, reject) => {
    try {
      const result = db.runSync(
        'UPDATE birthdays SET name = ?, birthDate = ?, note = ?, notificationTime = ? WHERE id = ?',
        [name, birthDate, note, notificationTime, id]
      );
      console.log('Birthday updated, rows affected:', result.changes);
      resolve(result.changes);
    } catch (error) {
      console.log('Error updating birthday:', error);
      reject(error);
    }
  });
};

// Delete a birthday from the database
export const deleteBirthday = (id) => {
  return new Promise((resolve, reject) => {
    try {
      const result = db.runSync('DELETE FROM birthdays WHERE id = ?', [id]);
      console.log('Birthday deleted, rows affected:', result.changes);
      resolve(result.changes);
    } catch (error) {
      console.log('Error deleting birthday:', error);
      reject(error);
    }
  });
};

// Get birthdays for today (MM-DD format)
export const getTodaysBirthdays = () => {
  return new Promise((resolve, reject) => {
    try {
      const today = new Date();
      const todayString = String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                         String(today.getDate()).padStart(2, '0');
      
      const result = db.getAllSync('SELECT * FROM birthdays WHERE birthDate = ?', [todayString]);
      console.log("Today's birthdays:", result.length);
      resolve(result);
    } catch (error) {
      console.log("Error getting today's birthdays:", error);
      reject(error);
    }
  });
};