const projectsModel = require('./model');

const listProjects = async (organizationId, filters) => {
  return await projectsModel.list(organizationId, filters);
};

const getProjectById = async (organizationId, id) => {
  const project = await projectsModel.getById(organizationId, id);
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }
  return project;
};

const createProject = async (organizationId, data) => {
  if (!data.name || !data.name.trim()) {
    const error = new Error('Project name is required');
    error.statusCode = 400;
    throw error;
  }
  return await projectsModel.create(organizationId, data);
};

const updateProject = async (organizationId, id, data) => {
  const updated = await projectsModel.update(organizationId, id, data);
  if (!updated) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }
  return updated;
};

const deleteProject = async (organizationId, id) => {
  const deleted = await projectsModel.deleteById(organizationId, id);
  if (!deleted) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }
  return { message: 'Project deleted successfully', id };
};

module.exports = {
  listProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};
