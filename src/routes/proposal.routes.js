const express = require('express');
const router = express.Router();
const path = require('path');
const proposalController = require(path.join(__dirname, '..', 'controllers', 'proposal.controller'));

router.get('/', proposalController.getProposals);
router.get('/:id', proposalController.getProposal);
router.post('/', proposalController.createProposal);
router.put('/:id', proposalController.updateProposal);
router.delete('/:id', proposalController.deleteProposal);
router.delete('/image/:id', proposalController.deleteImageProposal);
router.get('/user/:id', proposalController.getProposalsByUser);
router.get('/product/:id', proposalController.getProposalsByProduct);
router.get('/product/:id/:status', proposalController.getProposalsByProductAndStatus);
router.get('/user/:id/:status', proposalController.getProposalsByUserAndStatus);
router.get('/user/:id/product/:product', proposalController.getProposalsByUserAndProduct);
router.get('/status/:status', proposalController.getProposalsByStatus);


module.exports = router;