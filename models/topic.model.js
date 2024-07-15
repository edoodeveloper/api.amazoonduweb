const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
    // Créer un Topic
    createTopic: async (topicData) => {
        return await prisma.topic.create({
            data: topicData,
        });
    },
    // Récupérer un Topic par son ID
    getTopicById: async (topicId) => {
        return await prisma.topic.findUnique({
            where: { id: topicId },
            include: {
                user: true,
                category: true,
                commentsF: true,
                responsesF: true,
                likeTopics: true,
            },
        });
    },
    // Récupérer tous les Topics
    getAllTopics: async (page, per_page, whereClause) => {
        const topicCount = await prisma.topic.count();
        const filteredCount = await prisma.topic.count({
            where: whereClause // Compte uniquement les éléments correspondant à la clause
        });

        const topics = await prisma.topic.findMany({
            skip: (page - 1) * per_page,
            take: per_page,
            where: whereClause,
            include: {
                user: true,
                category: true,
                commentsF: true,
                responsesF: true,
                likeTopics: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const totalPages = Math.ceil(filteredCount / per_page);

        return {
            topicCount,
            page,
            per_page,
            totalCount: filteredCount,
            totalPages,
            topics: topics,
        };
    },
    // Mettre à jour un Topic
    updateTopic: async (topicId, topicData) => {
        return await prisma.topic.update({
            where: { id: topicId },
            data: topicData,
        });
    },
    // Supprimer un Topic
    deleteTopic: async (topicId) => {
        return await prisma.topic.delete({
            where: { id: topicId },
        });
    },
    // Incrémenter le compteur de vues d'un Topic
    incrementTopicViews: async (topicId) => {
        return await prisma.topic.update({
            where: { id: topicId },
            data: {
                countViews: {
                    increment: 1,
                },
            },
        });
    },
    // Incrémenter le compteur de likes d'un Topic
    incrementTopicLikes: async (topicId) => {
        return await prisma.topic.update({
            where: { id: topicId },
            data: { countLikes: { increment: 1 } },
        });
    },
    // Incrémenter le compteur de dislikes d'un Topic
    incrementTopicDislikes: async (topicId) => {
        return await prisma.topic.update({
            where: { id: topicId },
            data: { countDislikes: { increment: 1 } },
        });
    },
    // Incrémenter le compteur de partages d'un Topic
    incrementTopicShares: async (topicId) => {
        return await prisma.topic.update({
            where: { id: topicId },
            data: { countShares: { increment: 1 } },
        });
    },
    // Incrémenter le compteur de commentaires d'un Topic
    incrementTopicComments: async (topicId) => {
        await prisma.topic.update({
            where: { id: topicId },
            data: { countComments: { increment: 1 } },
        });
    },

    likeOrDislikeTopic: async (userId, topicId, type) => {
        // Type can be 'like' or 'dislike'
        const like = await prisma.likeTopic.findUnique({
            where: {
                userId_topicId: {
                    userId: userId,
                    topicId: topicId,
                },
            },
        });

        if (like) {
            if (like.type === type) {
                // If user already liked/disliked the Topic with the same type, remove the like/dislike
                await prisma.likeTopic.delete({
                    where: {
                        userId_topicId: {
                            userId: userId,
                            topicId: topicId,
                        },
                    },
                });
                // Update the Topic counters
                if (type === 'like') {
                    await prisma.topic.update({
                        where: { id: topicId },
                        data: { countLikes: { decrement: 1 } },
                    });
                } else {
                    await prisma.topic.update({
                        where: { id: topicId },
                        data: { countDislikes: { decrement: 1 } },
                    });
                }
            } else {
                // If user liked/disliked with a different type, update the like/dislike
                await prisma.likeTopic.update({
                    where: {
                        userId_topicId: {
                            userId: userId,
                            topicId: topicId,
                        },
                    },
                    data: {
                        type: type,
                    },
                });
                // Update the Topic counters
                if (type === 'like') {
                    await prisma.topic.update({
                        where: { id: topicId },
                        data: {
                            countLikes: { increment: 1 },
                            countDislikes: { decrement: 1 },
                        },
                    });
                } else {
                    await prisma.topic.update({
                        where: { id: topicId },
                        data: {
                            countLikes: { decrement: 1 },
                            countDislikes: { increment: 1 },
                        },
                    });
                }
            }
        } else {
            // If there's no existing like/dislike, create a new one
            await prisma.likeTopic.create({
                data: {
                    userId: userId,
                    topicId: topicId,
                    type: type,
                },
            });
            // Update the Topic counters
            if (type === 'like') {
                await prisma.topic.update({
                    where: { id: topicId },
                    data: { countLikes: { increment: 1 } },
                });
            } else {
                await prisma.topic.update({
                    where: { id: topicId },
                    data: { countDislikes: { increment: 1 } },
                });
            }
        }
    },
};