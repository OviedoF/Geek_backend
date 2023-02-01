const express = require("express");
const path = require("path");
const router = express.Router();
const PaymentsController = require(path.join(__dirname, '..', 'controllers', 'payments.controller'));

router.post('/', PaymentsController.getPaymentLink);

router.post('/success', PaymentsController.paymentSuccess);

router.get('/invoice/:id', PaymentsController.getPaymentInvoice);

module.exports = router;