const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
    createActuality: async (actuality) => {
        return await prisma.actuality.create({
            data: actuality,
        });
    },
    // Récupérer par son ID
    getActualityById: async (actualityId) => {
        return await prisma.actuality.findUnique({
            where: { id: actualityId },
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
    getActualities: async (page, per_page, whereClause) => {
        // const postCount = await prisma.post.count();
        const filteredCount = await prisma.actuality.count({
            where: whereClause
        });

        const actualities = await prisma.actuality.findMany({
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
            actualities: actualities,
        };
    },
    // Mettre à jour
    updateActuality: async (actualityId, actualityData) => {
        return await prisma.actuality.update({
            where: { id: actualityId },
            data: actualityData,
        });
    },
    // Supprimer
    deleteActuality: async (actualityId) => {
        return await prisma.actuality.delete({
            where: { id: actualityId },
        });
    },
};