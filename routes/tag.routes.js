const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tag.controller');


// ############################################### //
// ################ TAG ROUTES ################# //
// ############################################# //

router.get('/', tagController.getAllTags);

router.get('/:id', tagController.getTagById);

// ################################################### //
// #################### TAG ROUTES ################# //
// ################################################# //

module.exports = router;