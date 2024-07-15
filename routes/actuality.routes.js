const express = require('express');
const router = express.Router();
const actualityController = require('../controllers/actuality.controller');


// ################################################ //
// ################ ACTUALITY ROUTES ################# //
// ############################################## //

router.get('/', actualityController.getActualities);;

// #################################################### //
// #################### ACTUALITY ROUTES ################# //
// ################################################## //

module.exports = router;