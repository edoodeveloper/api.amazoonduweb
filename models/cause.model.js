const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
    createCause: async (cause) => {
        return await prisma.cause.create({
            data: cause,
        });
    },
    // Récupérer par son ID
    getCauseById: async (causeId) => {
        return await prisma.cause.findUnique({
            where: { id: causeId },
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
    getCauses: async (page, per_page, whereClause) => {
        // const postCount = await prisma.post.count();
        const filteredCount = await prisma.cause.count({
            where: whereClause
        });

        const causes = await prisma.cause.findMany({
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
            causes: causes,
        };
    },
    // Mettre à jour
    updateCause: async (causeId, causeData) => {
        return await prisma.cause.update({
            where: { id: causeId },
            data: causeData,
        });
    },
    // Supprimer
    deleteCause: async (causeId) => {
        return await prisma.cause.delete({
            where: { id: causeId },
        });
    },
};