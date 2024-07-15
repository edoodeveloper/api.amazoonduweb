const carouselModel = require('../models/carousel.model');
const formidable = require('formidable');
const { uploadToCloudinary } = require('../helpers/cloudinary.helper');
const fs = require('fs');

module.exports = {
    getCarouselById: async (req, res) => {
        const { id } = req.params;
        try {
            const carousel = await carouselModel.getCarouselById(id);
            if (carousel) {
                res.status(200).json({
                    success: true,
                    data: carousel
                });
            } else {
                res.json({
                    success: false,
                    message: 'Carousel non trouvée.'
                });
            }
        } catch (error) {
            res.json({
                success: false,
                message: 'Une erreur est survenue lors de la récupération de la carousel.'
            });
        }
    },

    getCarouselByName: async (req, res) => {
        const { name } = req.params;
        try {
            const carousel = await carouselModel.getCarouselByName(name);
            if (carousel) {
                res.status(200).json({
                    success: true,
                    data: carousel
                });
            } else {
                res.json({
                    success: false,
                    message: 'Carousel non trouvée.'
                });
            }
        } catch (error) {
            res.json({
                success: false,
                message: 'Une erreur est survenue lors de la récupération !'
            });
        }
    },

    updateCarouselById: async (req, res) => {
        const { id } = req.params;
        const { name } = req.body;
        try {
            const updatedCarousel = await carouselModel.updateCarouselById(id, name);
            if (updatedCarousel) {
                res.status(200).json({
                    success: true,
                    message: 'Modifié avec succes',
                    data: updatedCarousel
                });
            } else {
                res.json({
                    success: false,
                    message: 'Carousel non trouvée.'
                });
            }
        } catch (error) {
            res.json({
                success: false,
                message: 'Une erreur est survenue lors de la mise à jour de la carousel.'
            });
        }
    },

    getAllCaoursel: async (req, res) => {
        try {
            const all = await carouselModel.getAllCaoursel();
            res.status(200).json(all);
        } catch (error) {
            res.status(404).json({
                success: false,
                message: 'Erreur lors de la récupération des données !',
            });
        }
    },

    createCarousel: async (req, res) => {
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

                if (!files['url'] || !files['url'][0]) {
                    return res.json({
                        success: false,
                        message: `L'image du carousel est obligatoire !`,
                    });
                }

                const fileName = files['url'][0].originalFilename;

                const allCarousels = await carouselModel.getAllCaoursel();

                if (allCarousels.length === 4) {
                    return res.json({
                        success: false,
                        message: `Le nombre d'image autorisée est 4`
                    });
                }

                const carousel = await carouselModel.getCarouselByName(fileName);

                if (carousel) {
                    return res.json({
                        success: false,
                        message: 'Cette image existe déja. Veuillez insérer une nouvelle image !'
                    });
                }

                const result = await uploadToCloudinary(files.url[0]);
                const anyImageUrl = result.secure_url;

                const formData = {
                    name: fileName,
                    url: anyImageUrl,
                };

                await carouselModel.createCarousel(formData);

                res.status(201).json({
                    success: true,
                    message: "Ajouté avec succes !"
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

    deleteCarouselByName: async (req, res) => {
        const { name } = req.params;
        try {
            const response = await carouselModel.getCarouselByName(name);
            if (!response) {
                return res.json({
                    success: false,
                    message: 'Carousel non trouvée !'
                });
            }

            const deletedCarousel = await carouselModel.deleteCarouselByName(name);
            if (deletedCarousel) {
                res.status(200).json({
                    success: true,
                    message: 'Image Carousel supprimée avec succès !'
                });
            } else {
                res.json({
                    success: false,
                    message: 'Carousel non trouvée.'
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