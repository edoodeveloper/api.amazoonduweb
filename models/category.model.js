const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    getAllCategories: async (page, per_page, whereClause) => {
        const filteredCount = await prisma.category.count({
            where: whereClause
        });

        const categories = await prisma.category.findMany({
            skip: (page - 1) * per_page,
            take: per_page,
            where: whereClause,
            orderBy: {
                createdAt: 'desc',
            },
            select: {
                id: true,
                name: true,
                slug: true
            }
        });

        const totalPages = Math.ceil(filteredCount / per_page);

        return {
            page,
            per_page,
            totalCount: filteredCount,
            totalPages,
            categories: categories,
        };
    },

    getCategoryById: async (id) => {
        return await prisma.category.findUnique({
            where: { id },
            select: {
                id: true,
                name: true
            }
        });
    },

    getCategoryBySlug: async (slug) => {
        return await prisma.category.findUnique({
            where: { slug },
        });
    },

    createCategory: async (name, slug) => {
        return await prisma.category.create({
            data: { name, slug },
        });
    },

    getByName: async (name) => {
        try {
            const anyName = await prisma.category.findFirst({
                where: {
                    name
                }
            });

            if (!anyName) {
                // Gérer le cas où aucune categorie n'est trouvée avec ce nom
                return { success: false, message: "Categorie introuvable" };
            }

            // Si un categorie est trouvée, renvoyer les détails de la categorie
            return { success: true, categorie: anyName };
        } catch (error) {
            return { success: false, message: "Erreur lors de la recherche" };
        }
    },

    updateCategoryById: async (id, fieldsToUpdate) => {
        return await prisma.category.update({
            where: { id },
            data: fieldsToUpdate,
        });
    },

    deleteCategoryById: async (id) => {
        return await prisma.category.delete({
            where: { id },
        });
    },
};