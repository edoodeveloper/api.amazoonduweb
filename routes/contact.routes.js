const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact.controller');


// ############################################################## //
// ################ CONTACT ROUTES ################# //
// ############################################################ //

router.post('/', contactController.createContact);

// ################################################################## //
// #################### CONTACT ROUTES ################# //
// ################################################################ //

module.exports = router;