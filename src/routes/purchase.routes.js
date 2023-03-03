const express = require('express');
const router = express.Router();
const path = require('path');
const purchaseController = require(path.join(__dirname, '..', 'controllers', 'purchase.controller'));

router.get('/buyer/:id', purchaseController.getPurchasesOfBuyer);
router.get('/:id', purchaseController.getPurchase);

// Create a new Purchase
router.post('/', purchaseController.create);

router.put('/confirm/:id', purchaseController.confirmPurchase);
router.put('/pay-amount/:idPurchase/:idUser', purchaseController.payAmount);

module.exports = router;