const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Access Denied' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Invalid Token' });

        req.user = { userId: decoded.userId };
        next();
    });
};

module.exports = authenticateToken;
