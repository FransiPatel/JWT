function restrictTo(role) {
    return (req, res, next) => {
        // console.log('User Role:', req.user?.role); // Debugging
        if (!req.user || req.user.role !== role) {
            return res.status(403).send('Access Denied');
        }
        next();
    };
}
module.exports = { restrictTo };
