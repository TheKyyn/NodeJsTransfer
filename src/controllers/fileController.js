const pool = require('../../config/database');
const fs = require('fs');
const path = require('path');

const uploadFile = async (req, res) => {
    const { userId } = req.user;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'Aucun fichier upload' });

    const [userRows] = await pool.query('SELECT quota_used FROM users WHERE id = ?', [userId]);
    const user = userRows[0];
    const newQuota = user.quota_used + file.size;

    if (newQuota > 2 * 1024 * 1024 * 1024) {
        fs.unlinkSync(file.path);
        return res.status(400).json({ message: 'Vous avez atteint votre quota, désolé' });
    }

    await pool.query(
        'INSERT INTO files (user_id, filename, filepath, filesize) VALUES (?, ?, ?, ?)',
        [userId, file.originalname, file.path, file.size]
    );

    await pool.query('UPDATE users SET quota_used = ? WHERE id = ?', [newQuota, userId]);

    res.status(201).json({ message: 'Le fichier a été uploader avec succès' });
};

module.exports = { uploadFile };
