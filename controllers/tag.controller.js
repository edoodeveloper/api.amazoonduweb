const tagModel = require('../models/tag.model');
const slugify = require('slugify');

module.exports = {
    getAllTags: async (req, res) => {
        try {
            // Results
            let whereClause = {};

            // Pagination
            const page = parseInt(req.query.page) || 1;
            const per_page = parseInt(req.query.per_page) || 15;

            const tags = await tagModel.getAllTags(page, per_page, whereClause);
            res.status(200).json(tags);
        } catch (error) {
            res.json({
                success: false,
                message: 'Une erreur est survenue lors de la récupération des tags.', details: error.message
            });
        }
    },

    getTagById: async (req, res) => {
        const { id } = req.params;
        try {
            const tag = await tagModel.getTagById(id);
            if (tag) {
                res.status(200).json({
                    success: true,
                    data: tag
                });
            } else {
                res.json({
                    success: false,
                    message: 'Tag non trouvée.'
                });
            }
        } catch (error) {
            res.json({
                success: false,
                message: 'Une erreur est survenue lors de la récupération du tag.'
            });
        }
    },

    createTag: async (req, res) => {
        try {
            const { name } = req.body;

            if (!name || name === 'undefined' || name.length === 0) {
                return res.json({
                    success: false,
                    message: 'Veuillez saisir un tag valide !'
                });
            }

            // Générer un slug unique
            let slug = slugify(name, { lower: true });
            let existingTag = await tagModel.getTagBySlug(slug);

            // Si le slug existe déjà, ajouter un suffixe pour le rendre unique
            let suffix = 1;
            while (existingTag) {
                slug = `${slugify(name, { lower: true })}-${suffix}`;
                existingTag = await tagModel.getTagBySlug(slug);
                suffix++;
            }

            const result = await tagModel.getByName(name);

            if (!result.success) {
                const tag = await tagModel.createTag(name, slug);
                return res.status(201).json({
                    success: true,
                    message: 'Crée avec succès !',
                    data: tag
                });
            } else {
                return res.json({
                    success: false,
                    message: 'Ce tag existe déja !'
                });
            }
        } catch (error) {
            res.json({
                success: false,
                message: 'Une erreur est survenue lors de la création du tag.'
            });
        }
    },

    updateTagById: async (req, res) => {
        const { id } = req.params;
        const { name } = req.body;
        try {
            let fieldsToUpdate = {};
            if (name) {
                fieldsToUpdate.name = name;
                // Générer un slug unique
                let slug = slugify(name, { lower: true });
                let existingTag = await tagModel.getTagBySlug(slug);

                // Si le slug existe déjà, ajouter un suffixe pour le rendre unique
                let suffix = 1;
                while (existingTag) {
                    slug = `${slugify(name, { lower: true })}-${suffix}`;
                    existingTag = await tagModel.getTagBySlug(slug);
                    suffix++;
                }
                fieldsToUpdate.slug = slug;
            }

            const updatedTag = await tagModel.updateTagById(id, fieldsToUpdate);
            if (updatedTag) {
                res.status(200).json({
                    success: true,
                    message: 'Modifié avec succes',
                    data: updatedTag
                });
            } else {
                res.json({
                    success: false,
                    message: 'Tag non trouvée.'
                });
            }
        } catch (error) {
            res.json({
                success: false,
                message: 'Une erreur est survenue lors de la mise à jour du tag.'
            });
        }
    },

    deleteTagById: async (req, res) => {
        const { id } = req.params;
        try {
            const response = await tagModel.getTagById(id);

            if (!response) {
                return res.json({
                    success: false,
                    message: 'Tag non trouvée. Veuillez insérer un tag !'
                });
            }

            const deletedTag = await tagModel.deleteTagById(id);
            if (deletedTag) {
                res.status(200).json({
                    success: true,
                    message: 'Tag supprimée avec succès.'
                });
            } else {
                res.json({
                    success: false,
                    message: 'Tag non trouvée.'
                });
            }
        } catch (error) {
            if (error.code === 'P2003') {
                // Gérer l'erreur de suppression de clé étrangère
                res.json({
                    success: false,
                    message: 'Impossible de supprimer cette entrée car elle est référencée ailleurs !'
                });
            }
            else {
                res.json({
                    success: false,
                    message: 'Une erreur est survenue lors de la suppression.'
                });
            }
        }
    },
};