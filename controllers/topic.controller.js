const topicModel = require('../models/topic.model');

module.exports = {
    // Controller method to create a new Topic
    createTopic: async (req, res) => {
        try {
            const userId = req.user.id;
            const { imageUrl, categoryId, title, content } = req.body;
            // Extract Topic data from the request body
            const formData = {
                imageUrl: imageUrl,
                category: { connect: { id: categoryId } },
                title: title,
                content: content,
                user: { connect: { id: userId } },
            };
            // Call the createTopic method from the model to create the Topic
            await topicModel.createTopic(formData);
            // Send the newly created Topic as a JSON response
            res.status(201).json({
                success: true,
                message: 'crée avec success'
            });
        } catch (error) {
            // If an error occurs during Topic creation, send a 500 response with an error message
            res.status(500).json({
                success: false,
                message: 'Impossible de créer le Topic'
            });
        }
    },

    // Controller method to get a Topic by its ID
    getTopicById: async (req, res) => {
        try {
            // Extract the Topic ID from the request parameters
            const topicId = req.params.id;
            // Call the getTopicById method from the model to fetch the Topic
            const topic = await topicModel.getTopicById(topicId);
            // If the Topic is not found, send a 404 response with an error message
            if (!topic) {
                return res.status(404).json({ error: 'Topic non trouvé' });
            }
            // Send the fetched Topic as a JSON response
            res.json(topic);
        } catch (error) {
            // If an error occurs during Topic retrieval, send a 500 response with an error message
            res.status(500).json({ error: 'Impossible de récupérer le Topic' });
        }
    },

    // Controller method to get all Topics
    getAllTopics: async (req, res) => {
        try {
            // Results
            let allTopics = {};
            let whereClause = {};

            // Pagination
            const page = parseInt(req.query.page) || 1;
            const per_page = parseInt(req.query.per_page) || 15;

            if (req.query.category) {
                const countryFilter = Array.isArray(req.query.category)
                    ? { name: { in: req.query.category } }
                    : { name: { contains: req.query.category } };

                whereClause = {
                    ...whereClause,
                    category: countryFilter
                };
            }

            if (req.query.q) {
                if (!whereClause.OR) {
                    whereClause.OR = [];
                }

                // Ajoutez les conditions OR pour la recherche
                whereClause.OR.push({
                    title: {
                        contains: req.query.q,
                    },
                });

                whereClause.OR.push({
                    content: {
                        contains: req.query.q,
                    },
                });

                whereClause.OR.push({
                    category: {
                        nom: { contains: req.query.q }
                    },
                });
            }

            allTopics = await topicModel.getAllTopics(page, per_page, whereClause);
            res.status(200).json({
                success: true,
                data: allTopics
            });
        } catch (error) {
            res.json({
                success: false,
                message: 'Erreur lors de la récupération des topics'
            });
        }
    },

    // Controller method to update a Topic
    updateTopicById: async (req, res) => {
        const { id } = req.params;
        try {

            const fieldsToUpdate = {};

            const response = await topicModel.getTopicById(id);

            if (!response) {
                return res.json({
                    success: false,
                    message: 'Topic non trouvée. Veuillez créer un Topic !'
                });
            }

            if (req.body.imageUrl) {
                fieldsToUpdate.imageUrl = req.body.imageUrl;
            }

            if (req.body.categoryId) {
                fieldsToUpdate.categoryId = req.body.categoryId;
            }

            if (req.body.title) {
                fieldsToUpdate.title = req.body.title;
            }

            if (req.body.content) {
                fieldsToUpdate.content = req.body.content;
            }

            // Enregistre les modifications dans la base de données
            await topicModel.updateTopic(response.id, fieldsToUpdate);
            res.status(200).json({
                success: true,
                message: "Modifié avec success !"
            });
        } catch (error) {
            res.json({
                success: false,
                message: 'Erreur lors de la mise à jour du topic'
            });
        }
    },

    // Controller method to delete a Topic
    deleteTopicById: async (req, res) => {
        const { id } = req.params;

        try {
            const response = await topicModel.getTopicById(id);

            if (!response) {
                return res.json({
                    success: false,
                    message: 'Topic non trouvée !'
                });
            }

            const deleted = await topicModel.deleteTopic(id);

            if (!deleted) {
                return res.json({
                    success: false,
                    message: 'Topic non trouvé'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Topic supprimé avec success'
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

    // Controller method to increment Topic views
    incrementTopicViews: async (req, res) => {
        try {
            const TopicId = req.params.id;
            await topicModel.incrementTopicViews(TopicId);
            res.status(204).end();
        } catch (error) {
            res.status(500).json({ error: 'Unable to increment Topic views' });
        }
    },

    // Controller method to like or dislike a Topic
    likeOrDislikeTopic: async (req, res) => {
        try {
            const userId = req.user.id;
            const { topicId, type } = req.body;
            await topicModel.likeOrDislikeTopic(userId, topicId, type);
            res.status(200).json({
                success: true,
                message: 'Topic liked/disliked successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Unable to like/dislike Topic'
            });
        }
    },
};