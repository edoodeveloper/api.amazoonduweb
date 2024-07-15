const express = require('express');
const router = express.Router();
const helpController = require('../controllers/help.controller');


// ################################################ //
// ################ HELP ROUTES ################# //
// ############################################## //

router.get('/', helpController.getHelps);;

// #################################################### //
// #################### HELP ROUTES ################# //
// ################################################## //

module.exports = router;