
const authenticate = (req, res, next) => {
    const passkey = req.headers['x-passkey'];
    const expectedPasskey = process.env.PASSKEY;
    if (!passkey || passkey !== expectedPasskey) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

export default authenticate;