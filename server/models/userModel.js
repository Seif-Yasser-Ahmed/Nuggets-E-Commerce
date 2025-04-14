const db = require('../db');

module.exports = {


    createUser: (user, callback) => {
        const { firstName, lastName, email, username, password } = user;
        const query = `
        INSERT INTO user (first_name, last_name, email, username, password)
        VALUES (?, ?, ?, ?, ?)
    `;
        db.query(query, [firstName, lastName, email, username, password], callback);
    },


    getUserByUsername: (username, cb) => {
        const query = 'SELECT id, username, password, isAdmin FROM user WHERE username = ?';
        db.query(query, [username], cb);
    },

    getUserById: (id, cb) => {
        const query = 'SELECT id, username FROM user WHERE id = ?';
        db.query(query, [id], cb);
    },

    getAllUsers: (cb) => {
        const query = 'SELECT id, username,email,first_name,last_name,telephone,isAdmin,created_at FROM user';
        // console.log('Executing query:', query); // Log the query for debugging
        db.query(query, cb);
    },

    deleteUser: (id, cb) => {
        const query = 'DELETE FROM user WHERE id = ?';
        db.query(query, [id], cb);
    }
};