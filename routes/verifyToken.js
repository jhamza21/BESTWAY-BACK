const jwt = require('jsonwebtoken');
//VERIFY TOKEN VALIDITY
module.exports = function (req, res, next) {
    const token = req.header('token');
    if (!token) return res.status(401).json({ error: 'No authentification token, authorization denied' });

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        if (!verified) return res.status(401).json({ error: 'Token verification failed, authorization denied' });
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token' });
    }
}