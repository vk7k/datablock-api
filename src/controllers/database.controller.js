const databaseService = require('../services/database.service');
const { successResponse, errorResponse } = require('../utils/response.util');

class DatabaseController {
  async getStatus(req, res, next) {
    try {
      const status = await databaseService.getStatus();
      return successResponse(res, status, 'Database status retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async getTables(req, res, next) {
    try {
      const tables = await databaseService.getTables();
      return successResponse(res, tables, 'Database tables retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  async getTableSchema(req, res, next) {
    try {
      const { tableName } = req.params;
      const schema = await databaseService.getTableSchema(tableName);
      return successResponse(res, schema, `Schema for table '${tableName}' retrieved successfully`);
    } catch (err) {
      next(err);
    }
  }

  async getTableData(req, res, next) {
    try {
      const { tableName } = req.params;
      const { page, limit, orderBy, orderDir, search } = req.query;
      const data = await databaseService.getTableData(tableName, { page, limit, orderBy, orderDir, search });
      return successResponse(res, data, `Data for table '${tableName}' retrieved successfully`);
    } catch (err) {
      next(err);
    }
  }

  async executeQuery(req, res, next) {
    try {
      const { query } = req.body;
      if (!query) {
        return errorResponse(res, 'SQL query is required', 400);
      }
      const result = await databaseService.executeQuery(query);
      return successResponse(res, result, 'SQL query executed successfully');
    } catch (err) {
      return errorResponse(res, `SQL Execution Error: ${err.message}`, 400);
    }
  }

  async testConnection(req, res, next) {
    try {
      const { connectionUrl } = req.body;
      if (!connectionUrl) {
        return errorResponse(res, 'connectionUrl is required', 400);
      }
      const testResult = await databaseService.testConnection(connectionUrl);
      return successResponse(res, testResult, testResult.success ? 'Connection test succeeded' : 'Connection test failed');
    } catch (err) {
      next(err);
    }
  }

  async getConfig(req, res, next) {
    try {
      const config = databaseService.parseConnectionUrl();
      return successResponse(res, config, 'Connection configuration retrieved successfully');
    } catch (err) {
      next(err);
    }
  }
}

const databaseController = new DatabaseController();
module.exports = databaseController;
