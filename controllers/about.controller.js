const cloudinary = require('../config/cloudinaryConfig');
const formidable = require('formidable');
const fs = require('fs');
const aboutModel = require('../models/about.model');

async function uploadToCloudinary(file, options) {
    try {
        const result = await cloudinary.uploader.upload(file.filepath, options);
        return result;
    } catch (error) {
        throw new Error('Erreur lors de l\'upload vers Cloudinary : ' + error.message);
    }
}

module.exports = {
    // Controller method to create
    createAbout: async (req, res) => {
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

                if (!fields['content'] || !fields['content'][0] || fields['content'][0] === '<p><br></p>') {
                    return res.json({
                        success: false,
                        message: `La description est obligatoire !`,
                    });
                }

                const result = await uploadToCloudinary(files.url[0], { folder: 'amazoon' });
                const anyImageUrl = result.secure_url;

                const formData = {
                    name: fields['name'][0],
                    title: fields['title'][0],
                    url: anyImageUrl,
                    content: fields['content'][0],
                };
                // Call method from the model to create the post
                const newAbout = await aboutModel.createAbout(formData);
                // Send the newly created post as a JSON response
                res.status(201).json({
                    success: true,
                    data: newAbout
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
    getAboutById: async (req, res) => {
        try {
            // Extract the post ID from the request parameters
            const aboutId = req.params.id;
            // Call the getPostById method from the model to fetch the about
            const about = await aboutModel.getAboutById(aboutId);
            // If the about is not found, send a 404 response with an error message
            if (!about) {
                return res.json({
                    success: false,
                    message: 'About non trouvé'
                });
            }
            // Send the fetched about as a JSON response
            res.json(about);
        } catch (error) {
            // If an error occurs during about retrieval, send a 500 response with an error message
            res.json({
                success: false,
                message: 'Impossible de récupérer le about'
            });
        }
    },

    getAboutByName: async (req, res) => {
        try {
            // Extract the post ID from the request parameters
            const aboutName = req.params.name;
            // Call the getPostByName method from the model to fetch the about
            const about = await aboutModel.getAboutByName(aboutName);
            // If the about is not found, send a 404 response with an error message
            if (!about) {
                return res.json({
                    status: false,
                    error: 'About non trouvé'
                });
            }
            // Send the fetched about as a JSON response
            res.json(about);
        } catch (error) {
            // If an error occurs during about retrieval, send a 500 response with an error message
            res.json({
                status: false,
                message: 'Impossible de récupérer le about'
            });
        }
    },

    // Controller method to get all
    getAbouts: async (req, res) => {
        try {
            // Results
            let all = {};
            let whereClause = {};

            // Pagination
            const page = parseInt(req.query.page) || 1;
            const per_page = parseInt(req.query.per_about) || 15;

            all = await aboutModel.getAbouts(page, per_page, whereClause);
            res.status(200).json(all);
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error.message,
            });
        }
    },

    // Controller method to update
    updateAboutById: async (req, res) => {
        try {
            const form = new formidable.IncomingForm();
            const { id } = req.params;
            const fieldsToUpdate = {};
            const response = await aboutModel.getAboutById(id);

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
                    const publicId = `about-image/${Date.now()}`;

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

                if (fields['name'] && fields['name'][0]) {
                    fieldsToUpdate.name = fields['name'][0];
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
                await aboutModel.updateAbout(id, fieldsToUpdate);
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

    // Controller method to update
    updateAboutByName: async (req, res) => {
        try {
            const form = new formidable.IncomingForm();
            const { name } = req.params;
            const fieldsToUpdate = {};
            const response = await aboutModel.getAboutByName(name);

            if (!response) {
                return res.json({
                    success: false,
                    message: 'Non trouvée !'
                });
            }

            form.parse(req, async (err, fields, files) => {
                if (err) {
                    if (files.url && files.url[0].filepath) {
                        try {
                            fs.unlinkSync(files.url[0].filepath);
                        } catch (unlinkErr) {
                            console.error("Error deleting file:", unlinkErr);
                        }
                    }
                    return res.json({
                        success: false,
                        message: err.message
                    });
                }

                try {
                    if (files.url && files.url[0].filepath) {
                        const publicId = `about-image/${Date.now()}`;

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

                        try {
                            fs.unlinkSync(files.url[0].filepath);
                        } catch (unlinkErr) {
                            console.error("Error deleting file:", unlinkErr);
                        }
                    }

                    if (fields['name'] && fields['name'][0]) {
                        fieldsToUpdate.name = fields['name'][0];
                    }

                    if (fields['title'] && fields['title'][0]) {
                        fieldsToUpdate.title = fields['title'][0];
                    }

                    if (fields['content'] && fields['content'][0] && fields['content'][0] !== '<p><br></p>') {
                        fieldsToUpdate.content = fields['content'][0];
                    }

                    if (Object.keys(fieldsToUpdate).length === 0) {
                        return res.json({
                            status: false,
                            message: "Aucune donnée envoyée pour la mise à jour !"
                        });
                    }

                    const anyAbout = await aboutModel.updateAboutByName(name, fieldsToUpdate);
                    res.status(200).json({
                        success: true,
                        message: "Modifié avec succès !",
                        data: {
                            id: anyAbout.id,
                            name: anyAbout.name,
                            title: anyAbout.title,
                            url: anyAbout.url,
                            content: anyAbout.content,
                            createdAt: anyAbout.createdAt,
                        }
                    });
                } catch (innerError) {
                    console.error("Error during file processing:", innerError);
                    res.status(500).json({
                        success: false,
                        message: innerError.message,
                    });
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },


    // Controller method to delete
    deleteAboutById: async (req, res) => {
        const { id } = req.params;

        try {
            const response = await aboutModel.getAboutById(id);

            if (!response) {
                return res.json({
                    success: false,
                    message: 'non trouvée !'
                });
            }

            const deleted = await aboutModel.deleteAbout(id);

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