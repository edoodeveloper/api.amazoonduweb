const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    // Méthode pour récupérer toutes les statistiques
    async getAllStats() {
        const data = await prisma.stat.findMany({
            select: {
                // Users
                countUsers: true,
                // Posts
                countPosts: true,
                countPostComments: true,
                countPostLikes: true,
                countPostDislikes: true,
                countPostViews: true,
                countPostShares: true,
                // Topics
                countTopics: true,
                countTopicComments: true,
                countTopicLikes: true,
                countTopicDislikes: true,
                countTopicViews: true,
                countTopicShares: true,
            },
        });
        return data[0];
    },

    getRegistrationsByYear: async (year) => {
        try {
            const startOfYear = new Date(year, 0, 1); // Début de l'année
            const endOfYear = new Date(year, 11, 31); // Fin de l'année

            const registrations = await prisma.user.findMany({
                where: {
                    AND: [
                        { createdAt: { gte: startOfYear } }, // Date de création supérieure ou égale au début de l'année
                        { createdAt: { lte: endOfYear } }, // Date de création inférieure ou égale à la fin de l'année
                    ],
                },
                select: {
                    createdAt: true, // Sélectionner le champ createdAt
                },
            });

            // Tableau pour stocker le nombre d'inscriptions pour chaque mois (initialisé à zéro)
            const monthlyStats = Array(12).fill(0);

            // Compter le nombre d'inscriptions pour chaque mois
            registrations.forEach((user) => {
                const month = user.createdAt.getMonth(); // Récupérer le mois de la date de création de l'utilisateur
                monthlyStats[month]++; // Incrémenter le compteur pour le mois correspondant
            });

            return monthlyStats;
        } catch (error) {
            throw new Error('Unable to fetch registrations');
        }
    },

    // Méthode générique pour incrémenter un compteur
    async incrementCounter(counterName) {
        const stat = await prisma.stat.findFirst();
        if (!stat) {
            throw new Error('Document Stat non trouvé');
        }

        await prisma.stat.update({
            where: { id: stat.id },
            data: { [counterName]: { increment: 1 } },
        });
    },

    // Méthode générique pour décrémenter un compteur
    async decrementCounter(counterName) {
        await prisma.stat.update({
            // where: { id: 'unique_id' },
            data: { [counterName]: { decrement: 1 } },
        });
    },
};