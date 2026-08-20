const schemaService = require('../services/schema.service');
const { successResponse } = require('../utils/response.util');

class SchemaController {
  /**
   * Get all payload schemas grouped by domain
   */
  async getSchemas(req, res, next) {
    try {
      const catalog = schemaService.getSchemasCatalog();
      return successResponse(res, catalog, 'Official payload schemas catalog retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get specific schema template by type and version
   */
  async getSchemaByTypeAndVersion(req, res, next) {
    try {
      const { type, version } = req.params;
      const schema = schemaService.getSchema(type, version || 1);
      return successResponse(res, schema, `Schema for ${type} v${version || 1} retrieved successfully`);
    } catch (error) {
      next(error);
    }
  }
}

const schemaController = new SchemaController();
module.exports = schemaController;
