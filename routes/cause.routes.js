const express = require('express');
const router = express.Router();
const causeController = require('../controllers/cause.controller');


// ################################################ //
// ################ CAUSE ROUTES ################# //
// ############################################## //

router.get('/', causeController.getCauses);;

// #################################################### //
// #################### CAUSE ROUTES ################# //
// ################################################## //

module.exports = router;