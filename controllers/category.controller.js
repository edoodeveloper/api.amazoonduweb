const categoryModel = require('../models/category.model');
const slugify = require('slugify');

module.exports = {
    getAllCategories: async (req, res) => {
        try {
            // Results
            let whereClause = {};

            // Pagination
            const page = parseInt(req.query.page) || 1;
            const per_page = parseInt(req.query.per_page) || 15;

            const categories = await categoryModel.getAllCategories(page, per_page, whereClause);
            res.status(200).json(categories);
        } catch (error) {
            res.json({
                success: false,
                message: 'Une erreur est survenue lors de la récupération des catégories.', details: error.message
            });
        }
    },

    getCategoryById: async (req, res) => {
        const { id } = req.params;
        try {
            const category = await categoryModel.getCategoryById(id);
            if (category) {
                res.status(200).json({
                    success: true,
                    data: category
                });
            } else {
                res.json({
                    success: false,
                    message: 'Catégorie non trouvée.'
                });
            }
        } catch (error) {
            res.json({
                success: false,
                message: 'Une erreur est survenue lors de la récupération de la catégorie.'
            });
        }
    },

    createCategory: async (req, res) => {
        try {
            const { name } = req.body;

            if (!name || name === 'undefined' || name.length === 0) {
                return res.json({
                    success: false,
                    message: 'Veuillez saisir une catégorie valide !'
                });
            }

            // Générer un slug unique
            let slug = slugify(name, { lower: true });
            let existingCategory = await categoryModel.getCategoryBySlug(slug);

            // Si le slug existe déjà, ajouter un suffixe pour le rendre unique
            let suffix = 1;
            while (existingCategory) {
                slug = `${slugify(name, { lower: true })}-${suffix}`;
                existingCategory = await categoryModel.getCategoryBySlug(slug);
                suffix++;
            }

            const result = await categoryModel.getByName(name);

            if (!result.success) {
                const cat = await categoryModel.createCategory(name, slug);
                return res.status(201).json({
                    success: true,
                    message: 'Créé avec succès !',
                    data: cat
                });
            } else {
                return res.json({
                    success: false,
                    message: 'Cette catégorie existe déja !'
                });
            }
        } catch (error) {
            res.json({
                success: false,
                message: 'Une erreur est survenue lors de la création de la catégorie !',
            });
        }
    },

    updateCategoryById: async (req, res) => {
        const { id } = req.params;
        const { name } = req.body;
        try {
            let fieldsToUpdate = {};
            if (name) {
                fieldsToUpdate.name = name;
                // Générer un slug unique
                let slug = slugify(name, { lower: true });
                let existingCategory = await categoryModel.getCategoryBySlug(slug);

                // Si le slug existe déjà, ajouter un suffixe pour le rendre unique
                let suffix = 1;
                while (existingCategory) {
                    slug = `${slugify(name, { lower: true })}-${suffix}`;
                    existingCategory = await categoryModel.getCategoryBySlug(slug);
                    suffix++;
                }
                fieldsToUpdate.slug = slug;
            }
            const updatedCategory = await categoryModel.updateCategoryById(id, fieldsToUpdate);
            if (updatedCategory) {
                res.status(200).json({
                    success: true,
                    message: 'Modifié avec succes',
                    data: updatedCategory
                });
            } else {
                res.json({
                    success: false,
                    message: 'Catégorie non trouvée.'
                });
            }
        } catch (error) {
            res.json({
                success: false,
                message: 'Une erreur est survenue lors de la mise à jour de la catégorie.'
            });
        }
    },

    deleteCategoryById: async (req, res) => {
        const { id } = req.params;
        try {
            const response = await categoryModel.getCategoryById(id);

            if (!response) {
                return res.json({
                    success: false,
                    message: 'Categorie non trouvée. Veuillez insérer une catégorie !'
                });
            }

            const deletedCategory = await categoryModel.deleteCategoryById(id);
            if (deletedCategory) {
                res.status(200).json({
                    success: true,
                    message: 'Catégorie supprimée avec succès.'
                });
            } else {
                res.json({
                    success: false,
                    message: 'Catégorie non trouvée.'
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