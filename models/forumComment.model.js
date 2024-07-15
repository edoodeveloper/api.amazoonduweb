const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const topicModel = require('./topic.model');

module.exports = {
    getAllComments: async (page, per_page, whereClause) => {
        const filteredCount = await prisma.forumComment.count({
            where: whereClause // Compte uniquement les éléments correspondant à la clause
        });

        const comments = await prisma.forumComment.findMany({
            skip: (page - 1) * per_page,
            take: per_page,
            where: whereClause,
            include: {
                user: true, // Inclure les détails de l'utilisateur qui a fait le commentaire
                topic: true // Inclure les détails du topic associée au commentaire
            },
            orderBy: {
                createdAt: 'desc', // Tri par ordre décroissant
            }
        });

        const totalPages = Math.ceil(filteredCount / per_page);

        return {
            page,
            per_page,
            totalCount: filteredCount,
            totalPages,
            comments: comments,
        };
    },

    createComment: async (userId, topicId, content) => {
        const comment = await prisma.forumComment.create({
            data: {
                userId: userId,
                topicId: topicId,
                content: content
            }
        });

        if (comment) {
            await topicModel.incrementTopicComments(comment.topicId);
        }

        return comment;
    },

    getCommentById: async (id) => {
        return await prisma.forumComment.findUnique({
            where: {
                id: id
            }
        });
    },

    updateComment: async (id, content) => {
        return await prisma.forumComment.update({
            where: {
                id: id
            },
            data: content
        });
    },

    deleteComment: async (id) => {
        return await prisma.forumComment.delete({
            where: {
                id: id
            }
        });
    },

    likeOrDislikeComment: async (userId, commentId, type) => {
        // Type can be 'like' or 'dislike'
        const like = await prisma.forumCommentLike.findUnique({
            where: {
                userId_forumCommentId: {
                    userId: userId,
                    forumCommentId: commentId,
                },
            },
        });

        if (like) {
            if (like.type === type) {
                // If user already liked/disliked the post with the same type, remove the like/dislike
                await prisma.forumCommentLike.delete({
                    where: {
                        userId_forumCommentId: {
                            userId: userId,
                            forumCommentId: commentId,
                        },
                    },
                });
                // Update the post counters
                if (type === 'like') {
                    await prisma.forumComment.update({
                        where: { id: commentId },
                        data: { countLikes: { decrement: 1 } },
                    });
                } else {
                    await prisma.forumComment.update({
                        where: { id: commentId },
                        data: { countDislikes: { decrement: 1 } },
                    });
                }
            } else {
                // If user liked/disliked with a different type, update the like/dislike
                await prisma.forumCommentLike.update({
                    where: {
                        userId_forumCommentId: {
                            userId: userId,
                            forumCommentId: commentId,
                        },
                    },
                    data: {
                        type: type,
                    },
                });
                // Update the post counters
                if (type === 'like') {
                    await prisma.forumComment.update({
                        where: { id: commentId },
                        data: {
                            countLikes: { increment: 1 },
                            countDislikes: { decrement: 1 },
                        },
                    });
                } else {
                    await prisma.forumComment.update({
                        where: { id: commentId },
                        data: {
                            countLikes: { decrement: 1 },
                            countDislikes: { increment: 1 },
                        },
                    });
                }
            }
        } else {
            // If there's no existing like/dislike, create a new one
            await prisma.forumCommentLike.create({
                data: {
                    user: {
                        connect: { id: userId }
                    },
                    forumComment: {
                        connect: { id: commentId }
                    },
                    type: type,
                },
            });
            // Update the post counters
            if (type === 'like') {
                await prisma.forumComment.update({
                    where: { id: commentId },
                    data: { countLikes: { increment: 1 } },
                });
            } else {
                await prisma.forumComment.update({
                    where: { id: commentId },
                    data: { countDislikes: { increment: 1 } },
                });
            }
        }
    },
};