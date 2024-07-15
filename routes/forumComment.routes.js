const express = require('express');
const router = express.Router();
const forumCommentController = require('../controllers/forumComment.controller');


// ############################################################## //
// ################ FORUM COMMENT ROUTES ################# //
// ############################################################ //

router.get('/', forumCommentController.getAllComments);

router.get('/:id', forumCommentController.getCommentById);

// ################################################################## //
// #################### FORUM COMMENT ROUTES ################# //
// ################################################################ //

module.exports = router;