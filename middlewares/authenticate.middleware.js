const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

function authenticateToken(req, res, next) {
    let token;
    const tokenWithBearer = req.header('Authorization');
    if (tokenWithBearer) {
        token = tokenWithBearer.split(' ')[1];
    } else {
        return res.json({ success: false, message: 'En-tête Authorization manquant' });
    }

    if (!token) {
        return res.json({
            success: false,
            message: 'not_logged'
        });
    }

    const secretKey = process.env.SECRET_KEY;

    jwt.verify(token, secretKey, async (err, user) => {
        if (err) {
            return res.json({
                success: false,
                message: 'not_logged'
            });
        }
        // Je stocke les infos users pour une utilisation ultérieure
        let refreshData;
        const refresh = await userModel.getRefreshData(user.id);
        if (refresh) {
            refreshData = {
                id: refresh.id,
                firstName: refresh.firstName,
                phone: refresh.phone,
                admin: refresh.admin,
                level: refresh.level,
            };
        } else {
            return res.json({
                success: false,
                message: "Compte supprimer ou banni. Veuillez-vous réinscrire !"
            });
        }
        req.user = refreshData;
        next();
    });
}

module.exports = authenticateToken;