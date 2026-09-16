const projectsService = require('./service');

const getProjects = async (req, res, next) => {
  try {
    const { contactId, status, limit, offset } = req.query;
    const projects = await projectsService.listProjects(req.user.organizationId, {
      contactId,
      status,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
    });
    return res.status(200).json(projects);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const getProject = async (req, res, next) => {
  try {
    const project = await projectsService.getProjectById(req.user.organizationId, req.params.id);
    return res.status(200).json(project);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const createProject = async (req, res, next) => {
  try {
    const project = await projectsService.createProject(req.user.organizationId, req.body);
    return res.status(201).json(project);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await projectsService.updateProject(req.user.organizationId, req.params.id, req.body);
    return res.status(200).json(project);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const result = await projectsService.deleteProject(req.user.organizationId, req.params.id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
