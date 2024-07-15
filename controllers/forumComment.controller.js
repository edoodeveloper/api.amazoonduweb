const forumCommentModel = require('../models/forumComment.model');

module.exports = {
    getAllComments: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const per_page = parseInt(req.query.per_page) || 15;

            let whereClause = {};

            if (req.query.topicId) {
                whereClause = {
                    ...whereClause,
                    topicId: req.query.topicId
                };
            }

            if (req.query.q) {
                if (!whereClause.OR) {
                    whereClause.OR = [];
                }

                // Ajoutez les conditions OR pour la recherche
                whereClause.OR.push({
                    content: {
                        contains: req.query.q,
                    },
                });

                whereClause.OR.push({
                    user: {
                        firstName: { contains: req.query.q }
                    }
                });

                whereClause.OR.push({
                    user: {
                        lastName: { contains: req.query.q }
                    }
                });

                whereClause.OR.push({
                    topic: {
                        title: { contains: req.query.q }
                    }
                });

                whereClause.OR.push({
                    topic: {
                        content: { contains: req.query.q }
                    }
                });
            }

            const comments = await forumCommentModel.getAllComments(page, per_page, whereClause);

            res.status(200).json({
                success: true,
                data: comments
            });
        } catch (error) {
            res.json({
                success: false,
                message: 'Impossible de récupérer les commentaires.'
            });
        }
    },

    createComment: async (req, res) => {
        const userId = req.user.id;
        const { topicId, content } = req.body;

        try {
            if (userId === undefined || userId.length === 0 || userId === 'undefined' || !userId) {
                return res.json({
                    success: false,
                    message: "L'identifiant de l'utilisateur est manquant !"
                });
            }

            if (topicId === undefined || topicId.length === 0 || topicId === 'undefined' || !topicId) {
                return res.json({
                    success: false,
                    message: "L'identifiant du topic est manquante !"
                });
            }

            if (content === undefined || content.length === 0 || content === 'undefined' || !content) {
                return res.json({
                    success: false,
                    message: "Veuillez saisir le commentaire du post !"
                });
            }

            await forumCommentModel.createComment(userId, topicId, content);
            return res.status(201).json({
                success: true,
                message: 'Enregistré avec success !'
            });
        } catch (error) {
            res.json({
                success: false,
                message: 'Impossible de créer le commentaire.',
                details: error.message
            });
        }
    },

    getCommentById: async (req, res) => {
        const { id } = req.params;

        try {
            const comment = await forumCommentModel.getCommentById(id);
            if (!comment) {
                res.json({
                    success: false,
                    message: 'Commentaire non trouvé.'
                });
            } else {
                res.status(200).json({
                    success: true,
                    data: comment
                });
            }
        } catch (error) {
            res.json({
                success: false,
                message: 'Impossible de récupérer le commentaire.'
            });
        }
    },

    updateComment: async (req, res) => {
        const { id } = req.params;
        const { content } = req.body;
        try {
            const comment = await forumCommentModel.getCommentById(id);

            if (!comment) {
                return res.json({
                    success: false,
                    message: "Commentaire non trouvé."
                });
            }

            // Créer un objet formData
            let formData = {};

            if (content !== undefined && content !== 'undefined' && content !== null && content !== 'null' && content !== '') {
                formData.content = content;
            }

            await forumCommentModel.updateComment(id, formData);
            res.status(200).json({
                success: true,
                message: "Modifié avec succès !",
            });
        } catch (error) {
            res.json({
                success: false,
                message: 'Impossible de mettre à jour le commentaire.'
            });
        }
    },

    deleteComment: async (req, res) => {
        const { id } = req.params;

        try {
            const response = await forumCommentModel.getCommentById(id);

            if (!response) {
                return res.json({
                    success: false,
                    message: 'Commentaire non trouvée !'
                });
            }

            const deleted = await forumCommentModel.deleteComment(id);

            if (!deleted) {
                return res.json({
                    success: false,
                    message: 'Commentaire non trouvé'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Commentaire supprimé avec success'
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

    // Controller method to like or dislike a post
    likeOrDislikeComment: async (req, res) => {
        try {
            const userId = req.user.id;
            const { commentId, type } = req.body;
            await forumCommentModel.likeOrDislikeComment(userId, commentId, type);
            res.status(200).json({
                success: true,
                message: 'Comment liked/disliked successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Unable to like/dislike comment', details: error.message
            });
        }
    },
};