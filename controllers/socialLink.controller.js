const formidable = require('formidable');
const fs = require('fs');
const socialLinkModel = require('../models/socialLink.model');

module.exports = {
    // Controller method to create
    createSocialLink: async (req, res) => {
        try {
            // const userId = req.user.id;
            const { facebook, linkedin, twitter, instagram } = req.body;

            if (!facebook) {
                return res.json({
                    success: false,
                    message: 'Lien facebook obligatoire !',
                });
            }

            if (!linkedin) {
                return res.json({
                    success: false,
                    message: 'Lien linkedin obligatoire !',
                });
            }

            if (!twitter) {
                return res.json({
                    success: false,
                    message: 'Lien twitter obligatoire !',
                });
            }

            if (!instagram) {
                return res.json({
                    success: false,
                    message: 'Lien instagram obligatoire !',
                });
            }

            const formData = { facebook, linkedin, twitter, instagram };

            // Call method from the model to create the post
            const newSocialLink = await socialLinkModel.createSocialLink(formData);

            // Send the newly created post as a JSON response
            res.status(201).json({
                success: true,
                data: newSocialLink
            });
        } catch (error) {
            // If an error occurs during post creation, send a 500 response with an error message
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },

    // Controller method to by its ID
    getSocialLinkById: async (req, res) => {
        try {
            // Extract the post ID from the request parameters
            const actionId = req.params.id;
            // Call the getPostById method from the model to fetch the action
            const action = await socialLinkModel.getSocialLinkById(actionId);
            // If the action is not found, send a 404 response with an error message
            if (!action) {
                return res.status(404).json({ error: 'Post non trouvé' });
            }
            // Send the fetched action as a JSON response
            res.json(action);
        } catch (error) {
            // If an error occurs during action retrieval, send a 500 response with an error message
            res.status(500).json({ error: 'Impossible de récupérer le action' });
        }
    },

    // Controller method to get all
    getSocialLinks: async (req, res) => {
        try {
            // Results
            let all = {};
            let whereClause = {};

            // Pagination
            const page = parseInt(req.query.page) || 1;
            const per_page = parseInt(req.query.per_page) || 15;

            all = await socialLinkModel.getSocialLinks(page, per_page, whereClause);
            res.status(200).json(all);
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message,
            });
        }
    },

    // Controller method to update
    updateSocialLinkById: async (req, res) => {
        try {
            const form = new formidable.IncomingForm();
            const { id } = req.params;
            let fieldsToUpdate = {};
            const response = await socialLinkModel.getSocialLinkById(id);

            if (!response) {
                return res.json({
                    success: false,
                    message: 'Non trouvée !'
                });
            }

            form.parse(req, async (err, fields, files) => {
                if (err) {
                    // Supprimez le fichier temporaire après l'upload sur Cloudinary
                    fs.unlinkSync(files.imageUrl[0].filepath);
                    return res.json({
                        success: false,
                        message: err.message
                    });
                }

                if (fields['facebook'] && fields['facebook'][0]) {
                    fieldsToUpdate.facebook = fields['facebook'][0];
                }

                if (fields['linkedin'] && fields['linkedin'][0]) {
                    fieldsToUpdate.linkedin = fields['linkedin'][0];
                }

                if (fields['twitter'] && fields['twitter'][0]) {
                    fieldsToUpdate.twitter = fields['twitter'][0];
                }

                if (fields['instagram'] && fields['instagram'][0]) {
                    fieldsToUpdate.instagram = fields['instagram'][0];
                }

                // Vérifier si des données ont été ajoutées à dataToUpdate
                if (Object.keys(fieldsToUpdate).length === 0) {
                    return res.json({
                        status: false,
                        message: "Aucune donnée envoyée pour la mise à jour !"
                    });
                }

                // Enregistre les modifications dans la base de données
                const updated = await socialLinkModel.updateSocialLink(id, fieldsToUpdate);
                res.status(200).json({
                    success: true,
                    message: "Modifié avec succès !",
                    data: {
                        id: updated.id,
                        facebook: updated.facebook,
                        linkedin: updated.linkedin,
                        twitter: updated.twitter,
                        instagram: updated.instagram,
                    }
                });
            });
        }
        catch (error) {
            // If an error occurs during post creation, send a 500 response with an error message
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },

    // Controller method to delete
    deleteSocialLinkById: async (req, res) => {
        const { id } = req.params;

        try {
            const response = await socialLinkModel.getSocialLinkById(id);

            if (!response) {
                return res.json({
                    success: false,
                    message: 'non trouvée !'
                });
            }

            const deleted = await socialLinkModel.deleteSocialLink(id);

            if (!deleted) {
                return res.json({
                    success: false,
                    message: 'non trouvé'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Supprimé avec success'
            });
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