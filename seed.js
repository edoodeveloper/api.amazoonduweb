const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createStats() {
    try {

        const stat = await prisma.stat.create({
            data: {
                countUsers: 0, // Nombre d'utilisateurs (par défaut à 0)
                // Posts
                countPosts: 0, // Nombre de posts (par défaut à 0)
                countPostComments: 0, // Nombre de commentaires (par défaut à 0)
                countPostLikes: 0, // Nombre de likes (par défaut à 0)
                countPostDislikes: 0, // Nombre de dislikes (par défaut à 0)
                countPostViews: 0, // Nombre de vues (par défaut à 0)
                countPostShares: 0, // Nombre de partages (par défaut à 0)
                // Topics
                countTopics: 0, // Nombre de Topics (par défaut à 0)
                countTopicComments: 0, // Nombre de commentaires (par défaut à 0)
                countTopicLikes: 0, // Nombre de likes (par défaut à 0)
                countTopicDislikes: 0, // Nombre de dislikes (par défaut à 0)
                countTopicViews: 0, // Nombre de vues (par défaut à 0)
                countTopicShares: 0, // Nombre de partages (par défaut à 0)
            },
        })
        console.log('Données de test insérées :', stat,);
    } catch (error) {
        console.error('Erreur lors de l\'insertion :', error);
    }
}

async function seed() {
    const [, , method, arg1, arg2] = process.argv;

    if (method === 'createStats') {
        await createStats();
    }

    await prisma.$disconnect(); // Fermeture de la connexion Prisma
}

seed();