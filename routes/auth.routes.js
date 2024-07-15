const express = require('express');
const router = express.Router();
const { register, resetPassword } = require('../middlewares/validator.middleware');

// Controller d'authentification
const authController = require('../controllers/auth.controller');

// Enregistrer un user
router.post('/register', register, authController.register);

// Enregistrer un modérateur
router.post('/register-admin', authController.registerAdmin);

// Connecter un user
router.post('/login', authController.login);

// Gestion du mot de passe oublié
router.post('/forgot-password', authController.forgotPassword);

// Réinitialisation du mot de passe user
router.post('/reset-password', resetPassword, authController.resetPassword);

// Déconnecter un user
router.post('/logout', authController.logout);

module.exports = router;