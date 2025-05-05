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

    getUserByEmail: (email, cb) => {
        const query = 'SELECT id, username, password, isAdmin FROM user WHERE email = ?';
        db.query(query, [email], cb);
    },

    getUserById: (id, cb) => {
        const query = `
            SELECT u.id, u.username, u.email, u.first_name, u.last_name, 
            u.personal_image AS profile_image, u.telephone AS phone, 
            u.location, u.bio, u.occupation, u.birthday,
            u.social_links, u.created_at, u.isAdmin 
            FROM user u 
            WHERE u.id = ?
        `;
        db.query(query, [id], (err, results) => {
            if (err) return cb(err);

            // Parse social_links JSON to object if it exists
            if (results.length > 0 && results[0].social_links) {
                try {
                    results[0].social_links = JSON.parse(results[0].social_links);
                } catch (e) {
                    console.error('Error parsing social links:', e);
                    results[0].social_links = {};
                }
            }

            cb(null, results);
        });
    },

    updateUser: (id, userData, cb) => {
        const query = `
            UPDATE user 
            SET first_name = ?, 
                last_name = ?,
                email = ?, 
                telephone = ?,
                location = ?,
                bio = ?,
                occupation = ?,
                birthday = ?
            WHERE id = ?
        `;
        db.query(query, [
            userData.first_name,
            userData.last_name,
            userData.email,
            userData.telephone,
            userData.location || null,
            userData.bio || null,
            userData.occupation || null,
            userData.birthday || null,
            id
        ], cb);
    },

    updateUserSocialLinks: (id, socialLinksJson, cb) => {
        const query = 'UPDATE user SET social_links = ? WHERE id = ?';
        db.query(query, [socialLinksJson, id], cb);
    },

    updateUserProfileImage: (id, imageUrl, cb) => {
        const query = 'UPDATE user SET personal_image = ? WHERE id = ?';
        db.query(query, [imageUrl, id], cb);
    },

    updateUserAdminStatus: (id, isAdmin, cb) => {
        // Ensure isAdmin is treated as a number (0 or 1)
        const adminValue = isAdmin ? 1 : 0;
        console.log('Setting isAdmin to:', adminValue, 'for user ID:', id);
        const query = 'UPDATE user SET isAdmin = ? WHERE id = ?';
        db.query(query, [adminValue, id], cb);
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