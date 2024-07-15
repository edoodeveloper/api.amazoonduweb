const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    getCarouselById: async (id) => {
        return await prisma.carousel.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                url: true
            }
        });
    },

    getCarouselByName: async (name) => {
        return await prisma.carousel.findUnique({
            where: { name },
            select: {
                id: true,
                name: true
            }
        });
    },

    getAllCaoursel: async () => {
        return await prisma.carousel.findMany({
            select: {
                name: true,
                url: true
            }
        });
    },

    getCarouselByName: async (name) => {
        return await prisma.carousel.findUnique({
            where: { name },
            select: {
                id: true,
                name: true,
                url: true
            }
        });
    },

    createCarousel: async (name) => {
        return await prisma.carousel.create({
            data: { name },
        });
    },

    createCarousel: async (form) => {
        return await prisma.carousel.create({
            data: form,
        });
    },

    getByName: async (name) => {
        try {
            const anyName = await prisma.carousel.findFirst({
                where: {
                    name
                }
            });

            if (!anyName) {
                // Gérer le cas où aucune categorie n'est trouvée avec ce nom
                return { success: false, message: "Carousel introuvable" };
            }

            // Si un categorie est trouvée, renvoyer les détails de la categorie
            return { success: true, carousel: anyName };
        } catch (error) {
            return { success: false, message: "Erreur lors de la recherche" };
        }
    },

    updateCarouselById: async (id, name) => {
        return await prisma.carousel.update({
            where: { id },
            data: { name },
        });
    },

    deleteCarouselById: async (id) => {
        return await prisma.carousel.delete({
            where: { id },
        });
    },

    deleteCarouselByName: async (name) => {
        return await prisma.carousel.delete({
            where: { name },
        });
    },
};