const userModel = require('../models/user.model');
const bcrypt = require("bcryptjs");
const { uploadToCloudinary } = require('../helpers/cloudinary.helper');
const formidable = require('formidable');

module.exports = {
    // Le profile utilisateur
    getProfile: async (req, res) => {
        try {
            const userId = req.user ? req.user.id : null;
            if (!userId) {
                res.json({
                    success: false,
                    message: 'Utilisateur non trouvé ou Veuillez vous connectez !'
                });
            }
            const user = await userModel.getUserProfile(userId);
            if (user) {
                // Si les données sont récupérées avec succès, les renvoyer en réponse
                res.status(200).json({
                    success: true,
                    data: user
                });
            } else {
                res.json({
                    success: false,
                    message: 'Utilisateur non trouvé.'
                });
            }
        } catch (error) {
            res.json({
                success: false,
                message: 'Une erreur est survenue lors de la récupération de l\'utilisateur.'
            });
        }
    },

    updateProfile: async (req, res) => {
        const userId = req.user.id;
        try {
            const form = new formidable.IncomingForm();

            const anyUser = await userModel.getUserById(userId);

            if (!anyUser) {
                return res.json({
                    success: false,
                    message: 'Utilisateur non trouvé !'
                });
            }

            const fieldsToUpdate = {};

            const formData = await new Promise((resolve, reject) => {
                form.parse(req, (err, fields, files) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ fields, files });
                    }
                });
            });

            if (formData.files.avatar && formData.files.avatar[0]) {
                // Mettre à jour la avatar si elle est fournie dans les nouveaux fichiers
                const result = await uploadToCloudinary(formData.files.avatar[0]);
                fieldsToUpdate.avatar = result.secure_url;
            }

            if (formData.fields.firstName && formData.fields.firstName[0]) {
                fieldsToUpdate.firstName = formData.fields.firstName[0];
            }

            if (formData.fields.lastName && formData.fields.lastName[0]) {
                fieldsToUpdate.lastName = formData.fields.lastName[0];
            }

            if (formData.fields.email && formData.fields.email[0]) {
                fieldsToUpdate.email = formData.fields.email[0];
            }

            if (formData.fields.phone && formData.fields.phone[0]) {
                fieldsToUpdate.phone = formData.fields.phone[0];
            }

            const updated = await userModel.updateProfile(userId, fieldsToUpdate);
            res.status(200).json({
                success: true,
                message: 'Modifié avec succes !',
                data: updated
            });
        } catch (error) {
            res.json({
                success: false,
                message: error.message,
            });
        }
    },

    // Récupération de tous les users
    getAllUsers: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const per_page = parseInt(req.query.per_page) || 15;

            let whereClause = {};

            if (req.query.role === "user") {
                whereClause.isAdmin = false;
            } else {
                whereClause.isAdmin = true;
            }

            if (req.query.status) {
                whereClause.status = req.query.status === "true";
            }

            const users = await userModel.getUsers(page, per_page, whereClause);

            res.status(200).json({
                success: true,
                data: users
            });
        } catch (error) {
            res.json({
                success: false,
                message: 'Échec de la récupération des utilisateurs'
            });
        }
    },

    getUserById: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await userModel.getUserById(id);
            if (user) {
                res.status(200).json({
                    success: true,
                    data: user
                });
            } else {
                res.json({
                    success: false,
                    message: 'Utilisateur non trouvé.'
                });
            }
        } catch (error) {
            res.json({
                success: false,
                message: 'Une erreur est survenue lors de la récupération de l\'utilisateur.'
            });
        }
    },

    updateAnyUserStatus: async (req, res) => {
        try {
            const { id, status } = req.body; // true pour activer, false pour désactiver

            await userModel.updateAnyUserStatus(id, status);

            res.status(200).json({
                success: true,
                message: `Statut mis à jour avec succès !`
            });
        } catch (error) {
            res.json({
                success: false,
                message: 'Erreur lors de la mise à jour du statut'
            });
        }
    },

    updateAnyUserPassword: async (req, res) => {
        const userId = req.user.id;
        const { oldPassword, newPassword, repeatPassword } = req.body;

        try {
            const utilisateur = await userModel.getUserById(userId);

            if (!utilisateur) {
                return res.json({
                    success: false,
                    message: "Utilisateur non trouvé."
                });
            }

            if (!oldPassword || !newPassword || !repeatPassword) {
                return res.json({
                    success: false,
                    message: "Veuillez remplir tous les champs !"
                });
            }

            // Vérifie si la longueur du mot de passe est au moins 6 caractères
            if (oldPassword.length < 6 || newPassword.length < 6 || repeatPassword.length < 6) {
                return res.json({
                    success: false,
                    message: "Le mot de passe doit contenir au moins 6 caractères !"
                });
            }

            // Vérifier le mot de passe hashé avec bcrypt
            const passwordMatch = await bcrypt.compare(oldPassword, utilisateur.password);

            // Hasher le mot de passe avant de l'enregistrer
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            if (!passwordMatch) {
                return res.json({
                    success: false,
                    message: "Oups, le mot de passe actuel ne correspond pas à celui enregistré !"
                });
            }

            if (newPassword !== repeatPassword) {
                return res.json({
                    success: false,
                    message: "Les nouveaux mots de passe ne correspondent pas."
                });
            }

            await userModel.updateUserPassword(userId, hashedPassword);

            res.status(200).json({
                success: true,
                message: "Mot de passe modifié avec succès."
            });
        } catch (error) {
            res.json({
                success: false,
                message: error.message
            });
        }
    },

    updateAnyAdmin: async (req, res) => {
        const userId = req.user.id;
        const { password, repeatPassword } = req.body;

        try {
            const admin = await userModel.getUserById(userId);

            if (!admin) {
                return res.json({
                    success: false,
                    message: "Moderateur non trouvé."
                });
            }

            if (!password || !repeatPassword) {
                return res.json({
                    success: false,
                    message: "Veuillez remplir tous les champs !"
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
                    message: "Les deux mots de passe ne correspondent pas !"
                });
            }

            // Hasher le mot de passe avant de l'enregistrer
            const hashedPassword = await bcrypt.hash(password, 10);

            await userModel.updateProfile(userId, { password: hashedPassword });

            res.status(200).json({
                success: true,
                message: "Modifié avec succès."
            });
        } catch (error) {
            res.json({
                success: false,
                message: error.message
            });
        }
    },

    deleteUserById: async (req, res) => {
        try {
            const { id } = req.params;
            const existingRecord = await userModel.getUserById(id);
            if (existingRecord) {
                await userModel.deleteUserById(id);
                res.status(200).json({
                    success: true,
                    message: 'Supprimée avec succès'
                });
            } else {
                res.json({
                    success: false,
                    message: 'Utilisateur non trouvé !'
                });
            }
        } catch (error) {
            if (error.code === 'P2003') {
                // Gérer l'erreur de suppression de clé étrangère
                res.json({
                    success: false,
                    message: 'Impossible de supprimer cette entrée car elle est référencée ailleurs !'
                });
            }
            else {
                res.json({
                    success: false,
                    message: 'Une erreur est survenue lors de la suppression.'
                });
            }
        }
    },
};