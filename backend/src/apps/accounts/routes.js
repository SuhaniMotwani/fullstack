const express = require('express');
const router = express.Router();
const accountsController = require('./controller');

// Invoices CRUD endpoints
router.get('/', accountsController.getInvoices);
router.get('/invoices', accountsController.getInvoices);

router.post('/', accountsController.createInvoice);
router.post('/invoices', accountsController.createInvoice);

router.get('/:id', accountsController.getInvoice);
router.get('/invoices/:id', accountsController.getInvoice);

router.put('/:id', accountsController.updateInvoice);
router.put('/invoices/:id', accountsController.updateInvoice);

router.delete('/:id', accountsController.deleteInvoice);
router.delete('/invoices/:id', accountsController.deleteInvoice);

module.exports = router;
