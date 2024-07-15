const statModel = require("../models/stat.model");

module.exports = {
    // Récupérer toutes les statistiques
    async getAllStats(req, res) {
        try {
            const stats = await statModel.getAllStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Impossible de récupérer les statistiques.'
            });
        }
    },

    getRegistrationsStatsByYear: async (req, res) => {
        try {
            const year = parseInt(req.params.year);

            // Récupérer les statistiques d'inscription pour l'année spécifiée
            const monthlyStats = await statModel.getRegistrationsByYear(year);

            // Envoyer les statistiques en réponse
            res.json(monthlyStats);
        } catch (error) {
            res.status(500).json({ error: 'Unable to fetch registration stats' });
        }
    },
};
