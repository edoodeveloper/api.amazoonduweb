const contactModel = require('../models/contact.model');

module.exports = {
    getAllContacts: async (req, res) => {
        try {
            // Results
            let whereClause = {};

            // Pagination
            const page = parseInt(req.query.page) || 1;
            const per_page = parseInt(req.query.per_page) || 15;

            const contacts = await contactModel.getContacts(page, per_page, whereClause);
            res.status(200).json(contacts);
        } catch (error) {
            res.json({
                success: false,
                message: 'Une erreur est survenue lors de la récupération des catégories.'
            });
        }
    },

    getContactById: async (req, res) => {
        const { id } = req.params;
        try {
            const contact = await contactModel.getContactById(id);
            if (contact) {
                res.status(200).json({
                    success: true,
                    data: contact
                });
            } else {
                res.json({
                    success: false,
                    message: 'Contact non trouvée.'
                });
            }
        } catch (error) {
            res.json({
                success: false,
                message: 'Une erreur est survenue lors de la récupération de la catégorie.'
            });
        }
    },

    createContact: async (req, res) => {
        try {
            const { phone, subject, message } = req.body;

            if (!phone || !subject || !message) {
                return res.json({
                    success: false,
                    message: 'Veuillez remplir tout les champs !'
                });
            }

            await contactModel.createContact({ phone, subject, message });
            return res.status(201).json({
                success: true,
                message: 'Créé avec succès !',
            });
        } catch (error) {
            res.json({
                success: false,
                message: 'Une erreur est survenue lors de la création de la catégorie.',
            });
        }
    },

    decrementCountMessage: async (req, res) => {
        try {
            const { id } = req.params;

            const response = await contactModel.getContactById(id);

            if (!response) {
                return res.json({
                    success: false,
                    message: 'Massage inexistant !'
                });
            }

            await contactModel.decrementCountMessage(id);
            return res.status(201).json({
                success: true,
                message: 'Super !',
            });
        } catch (error) {
            res.json({
                success: false,
                message: 'Une erreur est survenue lors de la création de la catégorie.'
            });
        }
    },

    updateContactById: async (req, res) => {
        try {
            const { id } = req.params;
            const { phone, subject, message } = req.body;
            const fieldsToUpdate = {};
            const response = await contactModel.getContactById(id);

            if (!response) {
                return res.json({
                    success: false,
                    message: 'Massage inexistant !'
                });
            }

            if (phone) {
                fieldsToUpdate.phone = phone;
            }

            if (subject) {
                fieldsToUpdate.subject = subject;
            }

            if (message) {
                fieldsToUpdate.message = message;
            }

            await contactModel.updateContact(id, fieldsToUpdate);

            res.status(200).json({
                success: true,
                message: 'Modifié avec succès !'
            });
        } catch (error) {
            res.json({
                success: false,
                message: 'Une erreur est survenue lors de la mise à jour de la catégorie.'
            });
        }
    },

    deleteContactById: async (req, res) => {
        const { id } = req.params;
        try {
            const response = await contactModel.getContactById(id);

            if (!response) {
                return res.json({
                    success: false,
                    message: 'Categorie non trouvée. Veuillez insérer une catégorie !'
                });
            }

            const deletedContact = await contactModel.deleteContact(id);
            if (deletedContact) {
                res.status(200).json({
                    success: true,
                    message: 'Contact supprimé avec succès.'
                });
            } else {
                res.json({
                    success: false,
                    message: 'Contact non trouvée.'
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