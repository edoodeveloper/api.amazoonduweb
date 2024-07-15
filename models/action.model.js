const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
    createAction: async (action) => {
        return await prisma.action.create({
            data: action,
        });
    },
    // Récupérer par son ID
    getActionById: async (actionId) => {
        return await prisma.action.findUnique({
            where: { id: actionId },
            select: {
                id: true,
                title: true,
                content: true,
                createdAt: true,
            },
        });
    },
    // Récupérer tous
    getActions: async (page, per_page, whereClause) => {
        // const postCount = await prisma.post.count();
        const filteredCount = await prisma.action.count({
            where: whereClause
        });

        const actions = await prisma.action.findMany({
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
            actions: actions,
        };
    },
    // Mettre à jour
    updateAction: async (actionId, actionData) => {
        return await prisma.action.update({
            where: { id: actionId },
            data: actionData,
        });
    },
    // Supprimer
    deleteAction: async (actionId) => {
        return await prisma.action.delete({
            where: { id: actionId },
        });
    },
};