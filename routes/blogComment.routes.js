const express = require('express');
const router = express.Router();
const blogCommentController = require('../controllers/blogComment.controller');


// ############################################################## //
// ################ BLOG COMMENT ROUTES ################# //
// ############################################################ //

router.get('/', blogCommentController.getAllComments);

router.get('/:id', blogCommentController.getCommentById);

// ################################################################## //
// #################### BLOG COMMENT ROUTES ################# //
// ################################################################ //

module.exports = router;