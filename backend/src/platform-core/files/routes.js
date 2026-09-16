const express = require('express');
const router = express.Router();
const fileController = require('./controller');
const { authenticate } = require('../auth/middleware');

router.use(authenticate);

router.get('/', fileController.getFiles);
router.get('/:id', fileController.getFile);
router.post('/upload', fileController.uploadFile);
router.delete('/:id', fileController.deleteFile);

module.exports = router;
