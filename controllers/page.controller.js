const cloudinary = require('../config/cloudinaryConfig');
const formidable = require('formidable');
const fs = require('fs');
const pageModel = require('../models/page.model');
const { uploadToCloudinary } = require('../helpers/cloudinary.helper');

module.exports = {
    // Controller method to create
    createPage: async (req, res) => {
        try {
            // const userId = req.user.id;
            const form = new formidable.IncomingForm();

            form.parse(req, async (err, fields, files) => {
                if (err) {
                    // Supprimez le fichier temporaire après l'upload sur Cloudinary
                    fs.unlinkSync(files.url[0].filepath);
                    return res.json({
                        success: false,
                        message: err.message
                    });
                }

                if (!fields['name'] || !fields['name'][0]) {
                    return res.json({
                        success: false,
                        message: `Le nom est obligatoire !`,
                    });
                }

                if (!fields['title'] || !fields['title'][0]) {
                    return res.json({
                        success: false,
                        message: `Le titre est obligatoire !`,
                    });
                }

                if (!files['url'] || !files['url'][0]) {
                    return res.json({
                        success: false,
                        message: `L'image est obligatoire !`,
                    });
                }

                const result = await uploadToCloudinary(files.url[0]);
                const anyImageUrl = result.secure_url;

                const formData = {
                    name: fields['name'][0],
                    title: fields['title'][0],
                    url: anyImageUrl
                };
                // Call method from the model to create the post
                const newPage = await pageModel.createPage(formData);
                // Send the newly created post as a JSON response
                res.status(201).json({
                    success: true,
                    data: newPage
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
    getPageById: async (req, res) => {
        try {
            // Extract the post ID from the request parameters
            const pageId = req.params.id;
            // Call the getPostById method from the model to fetch the page
            const page = await pageModel.getPageById(pageId);
            // If the page is not found, send a 404 response with an error message
            if (!page) {
                return res.json({
                    success: false,
                    message: 'Page non trouvé'
                });
            }
            // Send the fetched page as a JSON response
            res.json(page);
        } catch (error) {
            // If an error occurs during page retrieval, send a 500 response with an error message
            res.json({
                success: false,
                message: 'Impossible de récupérer le page'
            });
        }
    },

    getPageByName: async (req, res) => {
        try {
            // Extract the post ID from the request parameters
            const pageName = req.params.name;
            // Call the getPostByName method from the model to fetch the page
            const page = await pageModel.getPageByName(pageName);
            // If the page is not found, send a 404 response with an error message
            if (!page) {
                return res.json({
                    status: false,
                    error: 'Page non trouvé'
                });
            }
            // Send the fetched page as a JSON response
            res.json(page);
        } catch (error) {
            // If an error occurs during page retrieval, send a 500 response with an error message
            res.json({
                status: false,
                message: 'Impossible de récupérer le page'
            });
        }
    },

    // Controller method to get all
    getPages: async (req, res) => {
        try {
            // Results
            let all = {};
            let whereClause = {};

            // Pagination
            const page = parseInt(req.query.page) || 1;
            const per_page = parseInt(req.query.per_page) || 15;

            all = await pageModel.getPages(page, per_page, whereClause);
            res.status(200).json(all);
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message,
            });
        }
    },

    // Controller method to update
    updatePageById: async (req, res) => {
        try {
            const form = new formidable.IncomingForm();
            const { id } = req.params;
            const fieldsToUpdate = {};
            const response = await pageModel.getPageById(id);

            if (!response) {
                return res.json({
                    success: false,
                    message: 'Non trouvée !'
                });
            }

            form.parse(req, async (err, fields, files) => {
                if (err) {
                    // Supprimez le fichier temporaire après l'upload sur Cloudinary
                    fs.unlinkSync(files.url[0].filepath);
                    return res.json({
                        success: false,
                        message: err.message
                    });
                }

                // Supprimer l'image de profil actuelle sur Cloudinary
                if (files.url && files.url[0].filepath) {
                    // Définir un public_id pour l'image
                    const publicId = `page-image/${Date.now()}`;

                    if (response.url) {
                        const oldPublicId = response.url.split('/').pop().split('.')[0];
                        await cloudinary.uploader.destroy(oldPublicId);
                    }
                    const result = await uploadToCloudinary(files.url[0], {
                        folder: 'amazoon',
                        public_id: publicId,
                        resource_type: 'auto'
                    });

                    fieldsToUpdate.url = result.secure_url;
                    // Supprimez le fichier temporaire après l'upload sur Cloudinary
                    fs.unlinkSync(files.url[0].filepath);
                }

                if (fields['title'] && fields['title'][0]) {
                    fieldsToUpdate.title = fields['title'][0];
                }

                // Vérifier si des données ont été ajoutées à dataToUpdate
                if (Object.keys(fieldsToUpdate).length === 0) {
                    return res.json({
                        status: false,
                        message: "Aucune donnée envoyée pour la mise à jour !"
                    });
                }

                // Enregistre les modifications dans la base de données
                await pageModel.updatePageById(id, fieldsToUpdate);
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

    updatePageByName: async (req, res) => {
        try {
            const form = new formidable.IncomingForm();
            const { name } = req.params;
            const fieldsToUpdate = {};
            const response = await pageModel.getPageByName(name);

            if (!response) {
                return res.json({
                    success: false,
                    message: 'Non trouvée !'
                });
            }

            form.parse(req, async (err, fields, files) => {
                if (err) {
                    // Supprimez le fichier temporaire après l'upload sur Cloudinary
                    fs.unlinkSync(files.url[0].filepath);
                    return res.json({
                        success: false,
                        message: err.message
                    });
                }

                // Supprimer l'image de profil actuelle sur Cloudinary
                if (files.url && files.url[0].filepath) {
                    // Définir un public_id pour l'image
                    const publicId = `page-image/${Date.now()}`;

                    if (response.url) {
                        const oldPublicId = response.url.split('/').pop().split('.')[0];
                        await cloudinary.uploader.destroy(oldPublicId);
                    }

                    const result = await uploadToCloudinary(files.url[0], { public_id: publicId });
                    fieldsToUpdate.url = result.secure_url;
                    fs.unlinkSync(files.url[0].filepath);
                }

                if (fields['title'] && fields['title'][0]) {
                    fieldsToUpdate.title = fields['title'][0];
                }

                // Vérifier si des données ont été ajoutées à dataToUpdate
                if (Object.keys(fieldsToUpdate).length === 0) {
                    return res.json({
                        status: false,
                        message: "Aucune donnée envoyée pour la mise à jour !"
                    });
                }

                // Enregistre les modifications dans la base de données
                const anyPage = await pageModel.updatePageByName(name, fieldsToUpdate);
                res.status(200).json({
                    success: true,
                    message: "Modifié avec succès !",
                    data: {
                        id: anyPage.id,
                        name: anyPage.name,
                        title: anyPage.title,
                        url: anyPage.url,
                        createdAt: anyPage.createdAt,
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
    deletePageById: async (req, res) => {
        const { id } = req.params;

        try {
            const response = await pageModel.getPageById(id);

            if (!response) {
                return res.json({
                    success: false,
                    message: 'non trouvée !'
                });
            }

            const deleted = await pageModel.deletePage(id);

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