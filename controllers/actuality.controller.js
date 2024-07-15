const cloudinary = require('../config/cloudinaryConfig');
const formidable = require('formidable');
const fs = require('fs');
const actualityModel = require('../models/actuality.model');
const { uploadToCloudinary } = require('../helpers/cloudinary.helper');

module.exports = {
    // Controller method to create
    createActuality: async (req, res) => {
        try {
            // const userId = req.user.id;
            const form = new formidable.IncomingForm();

            form.parse(req, async (err, fields, files) => {
                if (err) {
                    // Supprimez le fichier temporaire après l'upload sur Cloudinary
                    fs.unlinkSync(files.imageUrl[0].filepath);
                    return res.json({
                        success: false,
                        message: err.message
                    });
                }

                if (!files['imageUrl'] || !files['imageUrl'][0]) {
                    return res.json({
                        success: false,
                        message: `L'image est obligatoire !`,
                    });
                }

                if (!fields['title'] || !fields['title'][0]) {
                    return res.json({
                        success: false,
                        message: `Le titre est obligatoire !`,
                    });
                }

                if (!fields['content'] || !fields['content'][0] || fields['content'][0] === '<p><br></p>') {
                    return res.json({
                        success: false,
                        message: `La description est obligatoire !`,
                    });
                }

                const result = await uploadToCloudinary(files.imageUrl[0]);
                const anyImageUrl = result.secure_url;

                const formData = {
                    imageUrl: anyImageUrl,
                    title: fields['title'][0],
                    content: fields['content'][0],
                };
                // Call method from the model to create the post
                const newActuality = await actualityModel.createActuality(formData);
                // Send the newly created post as a JSON response
                res.status(201).json({
                    success: true,
                    data: newActuality
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

    // Controller method to by its ID
    getActualityById: async (req, res) => {
        try {
            // Extract the post ID from the request parameters
            const actionId = req.params.id;
            // Call the getPostById method from the model to fetch the action
            const action = await actualityModel.getActualityById(actionId);
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
    getActualities: async (req, res) => {
        try {
            // Results
            let all = {};
            let whereClause = {};

            // Pagination
            const page = parseInt(req.query.page) || 1;
            const per_page = parseInt(req.query.per_page) || 15;

            all = await actualityModel.getActualities(page, per_page, whereClause);
            res.status(200).json(all);
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message,
            });
        }
    },

    // Controller method to update
    updateActualityById: async (req, res) => {
        try {
            const form = new formidable.IncomingForm();
            const { id } = req.params;
            const fieldsToUpdate = {};
            const response = await actualityModel.getActualityById(id);

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

                // Supprimer l'image de profil actuelle sur Cloudinary
                if (files.imageUrl && files.imageUrl[0].filepath) {
                    // Définir un public_id pour l'image
                    const publicId = `actuality-image/${Date.now()}`;

                    if (response.imageUrl) {
                        const oldPublicId = response.imageUrl.split('/').pop().split('.')[0];
                        await cloudinary.uploader.destroy(oldPublicId);
                    }
                    const result = await uploadToCloudinary(files.imageUrl[0], { public_id: publicId });

                    fieldsToUpdate.imageUrl = result.secure_url;
                    // Supprimez le fichier temporaire après l'upload sur Cloudinary
                    fs.unlinkSync(files.imageUrl[0].filepath);
                }

                if (fields['title'] && fields['title'][0]) {
                    fieldsToUpdate.title = fields['title'][0];
                }

                if (fields['content'] && fields['content'][0] && fields['content'][0] !== '<p><br></p>') {
                    fieldsToUpdate.content = fields['content'][0];
                }

                // Vérifier si des données ont été ajoutées à dataToUpdate
                if (Object.keys(fieldsToUpdate).length === 0) {
                    return res.json({
                        status: false,
                        message: "Aucune donnée envoyée pour la mise à jour !"
                    });
                }

                // Enregistre les modifications dans la base de données
                await actualityModel.updateActuality(id, fieldsToUpdate);
                res.status(200).json({
                    success: true,
                    message: "Modifié avec succès !"
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
    deleteActualityById: async (req, res) => {
        const { id } = req.params;

        try {
            const response = await actualityModel.getActualityById(id);

            if (!response) {
                return res.json({
                    success: false,
                    message: 'non trouvée !'
                });
            }

            const deleted = await actualityModel.deleteActuality(id);

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