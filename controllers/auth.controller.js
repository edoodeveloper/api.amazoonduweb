const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const emailHelper = require('../helpers/email.helper');
const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const userModel = require('../models/user.model');
const statModel = require('../models/stat.model');

const AuthController = {
    // Code pour gérer l'inscription des utilisateurs en utilisant User
    async register(req, res) {
        try {
            // Vérification des erreurs de validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                // Validation des données et récupération de la première erreur
                return res.json({
                    success: false,
                    message: errors.array()[0].msg
                });
            }

            // Accéder aux données valides à partir de req.body
            const { firstName, lastName, email, phone, password } = req.body;

            // Hasher le mot de passe avant de l'enregistrer
            const hashedPassword = await bcrypt.hash(password, 10);

            // Enregistrer le nouvel utilisateur
            await userModel.createUser({
                firstName,
                lastName,
                email,
                phone,
                password: hashedPassword,
            });

            // count user register
            await statModel.incrementCounter('countUsers');

            return res.status(200).json({
                success: true,
                message: 'Inscription réussie. Connectez-vous !',
            });

        } catch (error) {
            return res.json({
                success: false,
                message: 'Une erreur est survenue lors de l\'enregistrement.', details: error.message
            });
        }
    },

    async registerAdmin(req, res) {
        try {
            // Accéder aux données valides à partir de req.body
            const { email, password, repeatPassword } = req.body;

            if (!email || !password || !repeatPassword) {
                return res.json({
                    success: false,
                    message: 'Veuillez remplir tous les champs !'
                });
            }

            const existingUserByEmail = await userModel.findUserByEmail(email);

            if (existingUserByEmail) {
                return res.json({
                    success: false,
                    message: "Un utilisateur existe déjà avec cet email !"
                });
            }

            // Vérifie si la longueur du mot de passe est au moins 6 caractères
            if (password.length < 6 || repeatPassword.length < 6) {
                return res.json({
                    success: false,
                    message: "Le mot de passe doit contenir au moins 6 caractères !"
                });
            }

            if (password !== repeatPassword) {
                return res.json({
                    success: false,
                    message: "Les deux(2) mots de passe ne correspondent pas !"
                });
            }

            // Hasher le mot de passe avant de l'enregistrer
            const hashedPassword = await bcrypt.hash(password, 10);

            // Enregistrer le nouvel utilisateur
            await userModel.createUser({
                firstName: 'Amazoon',
                lastName: 'Amazoon',
                email,
                isAdmin: true,
                level: 1,
                phone: '0101010101',
                password: hashedPassword,
            });

            return res.status(200).json({
                success: true,
                message: 'Modérateur crée avec succès !',
            });

        } catch (error) {
            return res.json({
                success: false,
                message: 'Une erreur est survenue lors de l\'enregistrement.', details: error.message
            });
        }
    },

    // Code pour l'authentification des utilisateurs
    async login(req, res) {
        const { email, password } = req.body;

        try {
            if (!email || !password) {
                return res.json({
                    success: false,
                    message: 'Veuillez fournir un nom d\'utilisateur et un mot de passe.'
                });
            }

            // Rechercher l'utilisateur par son nom d'utilisateur
            const user = await userModel.findUserByEmail(email);

            if (!user) {
                return res.json({
                    success: false,
                    message: 'Votre nom utilisateur n\'est pas rattaché a un compte !'
                });
            }

            // Vérifier le mot de passe hashé avec bcrypt
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                const secretKey = process.env.SECRET_KEY;

                // Générer un token JWT après une authentification réussie
                // '7d' => apres le test
                const expiresInDuration = '7d'; // Durée d'expiration du token en minutes

                // Création du token avec expiration en minutes
                const token = jwt.sign({ id: user.id, }, secretKey, {
                    expiresIn: expiresInDuration
                }); // Conversion en secondes

                res.status(200).json({
                    success: true,
                    message: 'Connecté avec succès !',
                    user: user,
                    token: token,
                });
            } else {
                res.json({
                    success: false,
                    message: 'Identification invalides'
                });
            }
        } catch (error) {
            res.json({
                success: false,
                message: 'La connexion a échoué'
            });
        }
    },

    // Code pour la réinitialisation de mot de passe
    async forgotPassword(req, res) {
        const { email } = req.body;
        try {
            const user = await userModel.findUserByEmail(email);

            if (!user) {
                return res.json({
                    success: false,
                    message: "Cet e-mail n'est pas enregistré."
                });
            }

            // Générer un token unique pour la réinitialisation de mot de passe
            const resetToken = crypto.randomBytes(20).toString('hex');

            // 1 heure de validité
            const resetPasswordExpires = new Date(Date.now() + 3600000);

            // Enregistrer le token de réinitialisation pour l'utilisateur dans la base de données
            await userModel.updateUserResetToken(user.id, resetToken, resetPasswordExpires);

            // Envoyer un email contenant le lien de réinitialisation avec le token
            const resetLink = `${process.env.WEBSITE_URL}/reset-password?token=${resetToken}`;

            // Utiliser EmailHelper pour envoyer l'e-mail de réinitialisation
            emailHelper.sendResetPasswordEmail(email, resetLink);

            res.status(200).json({
                success: true,
                message: 'E-mail de réinitialisation du mot de passe envoyé avec succès'
            });
        } catch (error) {
            res.json({
                success: false,
                message: error.message
            });
        }
    },

    // Code pour le changement de mot de passe
    async resetPassword(req, res) {
        try {
            // Vérification des erreurs de validation
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                // Validation des données et récupération de la première erreur
                return res.json({
                    success: false,
                    message: errors.array()[0].msg
                });
            }

            const { password, userId } = req.body;

            // Hasher le nouveau mot de passe
            const hashedPassword = await bcrypt.hash(password, 10);

            // Mettre à jour le mot de passe dans la base de données et effacer le token de réinitialisation
            await userModel.updateUserPassword(userId, hashedPassword);

            res.status(200).json({
                success: true,
                message: 'Réinitialisation du mot de passe réussie'
            });
        } catch (error) {
            res.json({
                success: false,
                message: 'Échec de la réinitialisation du mot de passe'
            });
        }
    },

    // Code pour gérer la déconnexion des utilisateurs en utilisant clearCookie
    async logout(req, res) {
        try {
            res.status(200).json({
                success: true,
                message: 'Déconnecté avec succès'
            });
        } catch (error) {
            res.json({
                success: false,
                message: 'Erreur lors de la déconnexion'
            });
        }
    },
};

module.exports = AuthController;