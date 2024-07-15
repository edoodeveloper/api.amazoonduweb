const express = require('express');
const router = express.Router();
const carouselController = require('../controllers/carousel.controller');


// ################################################ //
// ################ CAROUSELS ROUTES ################# //
// ############################################## //

router.post('/', carouselController.createCarousel);

router.get('/', carouselController.getAllCaoursel);

router.delete('/:name', carouselController.deleteCarouselByName);

router.post('/', carouselController.createCarousel);

// #################################################### //
// #################### CAROUSELS ROUTES ################# //
// ################################################## //

module.exports = router;