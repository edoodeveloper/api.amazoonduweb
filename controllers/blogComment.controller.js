const blogCommentModel = require("../models/blogComment.model");

module.exports = {
    getAllComments: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const per_page = parseInt(req.query.per_page) || 15;

            let whereClause = {};

            if (req.query.postId) {
                whereClause = {
                    ...whereClause,
                    postId: req.query.postId
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
            }

            const comments = await blogCommentModel.getAllComments(page, per_page, whereClause);

            res.status(200).json(comments);
        } catch (error) {
            res.json({
                success: false,
                message: 'Impossible de récupérer les commentaires.'
            });
        }
    },

    createComment: async (req, res) => {
        const userId = req.user.id;
        const { postId, content } = req.body;

        try {
            if (userId === undefined || userId.length === 0 || userId === 'undefined' || !userId) {
                return res.json({
                    success: false,
                    message: "L'identifiant de l'utilisateur est manquant !"
                });
            }

            if (postId === undefined || postId.length === 0 || postId === 'undefined' || !postId) {
                return res.json({
                    success: false,
                    message: "L'identifiant du post est manquante !"
                });
            }

            if (content === undefined || content.length === 0 || content === 'undefined' || !content) {
                return res.json({
                    success: false,
                    message: "Veuillez saisir le commentaire du post !"
                });
            }

            const anyComment = await blogCommentModel.createComment(userId, postId, content);
            return res.status(201).json({
                success: true,
                message: 'Enregistré avec success !',
                data: anyComment
            });
        } catch (error) {
            res.json({
                success: false,
                message: 'Impossible de créer le commentaire.'
            });
        }
    },

    getCommentById: async (req, res) => {
        const { id } = req.params;

        try {
            const comment = await blogCommentModel.getCommentById(id);
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
            const comment = await blogCommentModel.getCommentById(id);

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

            await blogCommentModel.updateComment(id, formData);
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
            const response = await blogCommentModel.getCommentById(id);

            if (!response) {
                return res.json({
                    success: false,
                    message: 'Commentaire non trouvée !'
                });
            }

            const deleted = await blogCommentModel.deleteComment(id);

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
            const result = await blogCommentModel.likeOrDislikeComment(userId, commentId, type);
            res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Unable to like/dislike comment'
            });
        }
    },
};