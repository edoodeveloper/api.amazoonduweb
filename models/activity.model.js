const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
    createActivity: async (activity) => {
        return await prisma.activity.create({
            data: activity,
        });
    },
    // Récupérer par son ID
    getActivityById: async (activityId) => {
        return await prisma.activity.findUnique({
            where: { id: activityId },
            select: {
                id: true,
                imageUrl: true,
                title: true,
                content: true,
                createdAt: true,
            },
        });
    },
    // Récupérer tous
    getActivities: async (page, per_page, whereClause) => {
        // const postCount = await prisma.post.count();
        const filteredCount = await prisma.activity.count({
            where: whereClause
        });

        const activities = await prisma.activity.findMany({
            skip: (page - 1) * per_page,
            take: per_page,
            where: whereClause,
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                imageUrl: true,
                title: true,
                content: true,
                createdAt: true,
            }
        });

        const totalPages = Math.ceil(filteredCount / per_page);

        return {
            // postCount,
            page,
            per_page,
            totalCount: filteredCount,
            totalPages,
            activities: activities,
        };
    },
    // Mettre à jour
    updateActivity: async (activityId, activityData) => {
        return await prisma.activity.update({
            where: { id: activityId },
            data: activityData,
        });
    },
    // Supprimer
    deleteActivity: async (activityId) => {
        return await prisma.activity.delete({
            where: { id: activityId },
        });
    },
};