const { getUserById, getAllUsers, deleteUser } = require('../models/userModel');

exports.getProfile = (req, res) => {
    const userId = req.params.id;
    getUserById(userId, (err, results) => {
        if (err) return res.status(500).json({ success: false, error: 'Error retrieving profile' });
        if (results.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, data: results[0] });
    });
};

exports.getAll = (req, res) => {
    getAllUsers((err, results) => {
        if (err) return res.status(500).json({ success: false, error: 'Error retrieving users' });
        res.status(200).json({ success: true, data: results });
    });
};

exports.remove = (req, res) => {
    const userId = req.params.id;
    deleteUser(userId, (err, result) => {
        if (err) return res.status(500).json({ success: false, error: 'Error deleting user' });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    });
};