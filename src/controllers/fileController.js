const pool = require('../../config/database');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

    res.status(201).json({ message: 'Le fichier a été uploadé avec succès' });
};

const listFiles = async (req, res) => {
    const { userId } = req.user;

    const [files] = await pool.query('SELECT id, filename, filesize, upload_date FROM files WHERE user_id = ?', [userId]);
    res.json(files);
};

const getFile = async (req, res) => {
    const { userId } = req.user;
    const { fileId } = req.params;

    const [rows] = await pool.query('SELECT * FROM files WHERE id = ? AND user_id = ?', [fileId, userId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Le fichier n\'a pas été trouvé' });

    const file = rows[0];
    res.download(file.filepath, file.filename);
};

const deleteFile = async (req, res) => {
    const { userId } = req.user;
    const { fileId } = req.params;

    const [rows] = await pool.query('SELECT * FROM files WHERE id = ? AND user_id = ?', [fileId, userId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Le fichier n\'a pas été trouvé' });

    const file = rows[0];

    fs.unlinkSync(file.filepath);

    await pool.query('DELETE FROM files WHERE id = ?', [fileId]);
    await pool.query('UPDATE users SET quota_used = quota_used - ? WHERE id = ?', [file.filesize, userId]);

    res.json({ message: 'Le fichier a été supprimé avec succès' });
};

const createSharedLink = async (req, res) => {
    const { userId } = req.user;
    const { fileId } = req.params;

    const [rows] = await pool.query('SELECT * FROM files WHERE id = ? AND user_id = ?', [fileId, userId]);
    if (rows.length === 0) return res.status(404).json({ message: 'Le fichier n\'a pas été trouvé' });

    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query('INSERT INTO shared_links (file_id, token, expires_at) VALUES (?, ?, ?)', [fileId, token, expiresAt]);

    res.json({ link: `http://localhost:3000/api/files/shared/${token}` });
};

const accessSharedFile = async (req, res) => {
    const { token } = req.params;

    const [rows] = await pool.query('SELECT f.* FROM files f JOIN shared_links s ON f.id = s.file_id WHERE s.token = ? AND s.expires_at > NOW()', [token]);
    if (rows.length === 0) return res.status(404).json({ message: 'Le lien a expiré ou est invalide' });

    const file = rows[0];
    res.download(file.filepath, file.filename);
};

module.exports = { uploadFile, listFiles, getFile, deleteFile, createSharedLink, accessSharedFile };
