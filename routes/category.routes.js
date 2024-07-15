const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');


// ############################################################## //
// ################ CATEGORIES ROUTES ################# //
// ############################################################ //

// Récupérer toutes les catégories
router.get('/', categoryController.getAllCategories);

// Récupérer une catégorie par son ID
router.get('/:id', categoryController.getCategoryById);

// ################################################################## //
// #################### CATEGORIES ROUTES ################# //
// ################################################################ //

module.exports = router;