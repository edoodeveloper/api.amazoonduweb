const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
    createSocialLink: async (socialLink) => {
        return await prisma.socialLink.create({
            data: socialLink,
        });
    },
    // Récupérer par son ID
    getSocialLinkById: async (socialLinkId) => {
        return await prisma.socialLink.findUnique({
            where: { id: socialLinkId },
            select: {
                id: true,
                facebook: true,
                linkedin: true,
                twitter: true,
                instagram: true,
                createdAt: true,
            },
        });
    },
    // Récupérer tous
    getSocialLinks: async (page, per_page, whereClause) => {
        // const postCount = await prisma.post.count();
        const filteredCount = await prisma.socialLink.count({
            where: whereClause
        });

        const socialLinks = await prisma.socialLink.findMany({
            skip: (page - 1) * per_page,
            take: per_page,
            where: whereClause,
            orderBy: {
                createdAt: 'asc',
            },
            select: {
                id: true,
                facebook: true,
                linkedin: true,
                twitter: true,
                instagram: true,
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
            socialLinks: socialLinks,
        };
    },
    // Mettre à jour
    updateSocialLink: async (socialLinkId, socialLinkData) => {
        return await prisma.socialLink.update({
            where: { id: socialLinkId },
            data: socialLinkData,
        });
    },
    // Supprimer
    deleteSocialLink: async (socialLinkId) => {
        return await prisma.socialLink.delete({
            where: { id: socialLinkId },
        });
    },
};