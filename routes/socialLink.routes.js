const express = require('express');
const router = express.Router();
const socialLinkController = require('../controllers/socialLink.controller');


// ################################################ //
// ############## SOCIALLINK ROUTES ############## //
// ############################################## //

router.get('/', socialLinkController.getSocialLinks);

// #################################################### //
// ################# SOCIALLINK ROUTES ############### //
// ################################################## //

module.exports = router;