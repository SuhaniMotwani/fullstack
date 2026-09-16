const express = require('express');
const router = express.Router();
const crmController = require('./controller');

// Leads CRUD endpoints
router.get('/', crmController.getLeads);
router.get('/leads', crmController.getLeads);

router.post('/', crmController.createLead);
router.post('/leads', crmController.createLead);

router.get('/:id', crmController.getLead);
router.get('/leads/:id', crmController.getLead);

router.put('/:id', crmController.updateLead);
router.put('/leads/:id', crmController.updateLead);

router.delete('/:id', crmController.deleteLead);
router.delete('/leads/:id', crmController.deleteLead);

// Mark opportunity/lead as won
router.post('/:id/won', crmController.markWon);
router.post('/leads/:id/won', crmController.markWon);
router.patch('/:id/won', crmController.markWon);
router.patch('/leads/:id/won', crmController.markWon);

module.exports = router;
