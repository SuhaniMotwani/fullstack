const express = require('express');
const router = express.Router();
const projectsController = require('./controller');

// Projects CRUD endpoints
router.get('/', projectsController.getProjects);
router.get('/projects', projectsController.getProjects);

router.post('/', projectsController.createProject);
router.post('/projects', projectsController.createProject);

router.get('/:id', projectsController.getProject);
router.get('/projects/:id', projectsController.getProject);

router.put('/:id', projectsController.updateProject);
router.put('/projects/:id', projectsController.updateProject);

router.delete('/:id', projectsController.deleteProject);
router.delete('/projects/:id', projectsController.deleteProject);

module.exports = router;
