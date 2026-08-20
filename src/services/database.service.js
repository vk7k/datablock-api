const prisma = require('../config/prisma');
const env = require('../config/env');
const mysql = require('mysql2/promise');

class DatabaseService {
  /**
   * Helper to parse and mask DATABASE_URL
   */
  parseConnectionUrl(rawUrl = env.DATABASE_URL) {
    try {
      // Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE?ssl...
      const url = new URL(rawUrl);
      const isSsl = url.searchParams.has('sslaccept') || url.searchParams.has('ssl') || url.searchParams.has('ssl-mode');
      
      return {
        protocol: url.protocol.replace(':', ''),
        host: url.hostname || 'localhost',
        port: parseInt(url.port, 10) || 3306,
        user: url.username || 'root',
        database: url.pathname ? url.pathname.replace(/^\//, '') : 'block_system',
        ssl: isSsl,
        sslParams: url.search,
        maskedUrl: `${url.protocol}//${url.username || 'user'}:******@${url.hostname || 'localhost'}:${url.port || 3306}${url.pathname || ''}${url.search || ''}`
      };
    } catch {
      return {
        host: 'localhost',
        port: 3306,
        user: 'root',
        database: 'block_system',
        ssl: false,
        maskedUrl: 'mysql://root:******@localhost:3306/block_system'
      };
    }
  }

  /**
   * Get general database status, version and metrics
   */
  async getStatus() {
    const config = this.parseConnectionUrl();

    // Query MySQL global variables and status
    const versionRes = await prisma.$queryRawUnsafe('SELECT VERSION() as version, DATABASE() as current_db');
    const uptimeRes = await prisma.$queryRawUnsafe("SHOW GLOBAL STATUS LIKE 'Uptime'");
    const threadsRes = await prisma.$queryRawUnsafe("SHOW GLOBAL STATUS LIKE 'Threads_connected'");
    const queriesRes = await prisma.$queryRawUnsafe("SHOW GLOBAL STATUS LIKE 'Questions'");

    const version = versionRes[0]?.version || 'Unknown';
    const currentDb = versionRes[0]?.current_db || config.database;
    const uptimeSeconds = parseInt(uptimeRes[0]?.Value || '0', 10);
    const threadsConnected = parseInt(threadsRes[0]?.Value || '1', 10);
    const totalQueries = parseInt(queriesRes[0]?.Value || '0', 10);

    // Get summary of tables
    const tableSummary = await prisma.$queryRawUnsafe(`
      SELECT 
        COUNT(*) as total_tables,
        COALESCE(SUM(TABLE_ROWS), 0) as total_rows,
        COALESCE(SUM(DATA_LENGTH + INDEX_LENGTH), 0) as total_size_bytes
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ?
    `, currentDb);

    const totalTables = Number(tableSummary[0]?.total_tables || 0);
    const totalRows = Number(tableSummary[0]?.total_rows || 0);
    const totalSizeBytes = Number(tableSummary[0]?.total_size_bytes || 0);

    return {
      connected: true,
      database: currentDb,
      version,
      uptimeSeconds,
      uptimeFormatted: this.formatUptime(uptimeSeconds),
      threadsConnected,
      totalQueries,
      totalTables,
      totalRows,
      totalSizeBytes,
      totalSizeMB: (totalSizeBytes / (1024 * 1024)).toFixed(2),
      config
    };
  }

  /**
   * List all tables in current database with metadata
   */
  async getTables() {
    const config = this.parseConnectionUrl();
    const currentDb = config.database;

    const tables = await prisma.$queryRawUnsafe(`
      SELECT 
        TABLE_NAME as name,
        ENGINE as engine,
        TABLE_COLLATION as collation,
        TABLE_ROWS as row_count,
        DATA_LENGTH as data_length_bytes,
        INDEX_LENGTH as index_length_bytes,
        (DATA_LENGTH + INDEX_LENGTH) as total_length_bytes,
        CREATE_TIME as created_at,
        UPDATE_TIME as updated_at,
        TABLE_COMMENT as comment
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE() OR TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME ASC
    `, currentDb);

    return tables.map(t => ({
      name: t.name,
      engine: t.engine || 'InnoDB',
      collation: t.collation || 'utf8mb4_unicode_ci',
      rowCount: Number(t.row_count || 0),
      dataSizeKB: (Number(t.data_length_bytes || 0) / 1024).toFixed(1),
      indexSizeKB: (Number(t.index_length_bytes || 0) / 1024).toFixed(1),
      totalSizeKB: (Number(t.total_length_bytes || 0) / 1024).toFixed(1),
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      comment: t.comment || ''
    }));
  }

  /**
   * Get Table structure (columns, indexes, foreign keys)
   */
  async getTableSchema(tableName) {
    // Validate table name to avoid injection
    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
      throw new Error('Invalid table name format');
    }

    const config = this.parseConnectionUrl();
    const currentDb = config.database;

    // 1. Columns
    const columns = await prisma.$queryRawUnsafe(`DESCRIBE \`${tableName}\``);

    // 2. Indexes
    const indexesRaw = await prisma.$queryRawUnsafe(`SHOW INDEX FROM \`${tableName}\``);
    const indexesMap = {};

    indexesRaw.forEach(idx => {
      const keyName = idx.Key_name;
      if (!indexesMap[keyName]) {
        indexesMap[keyName] = {
          name: keyName,
          unique: idx.Non_unique === 0,
          type: idx.Index_type,
          columns: [],
          cardinality: idx.Cardinality
        };
      }
      indexesMap[keyName].columns.push(idx.Column_name);
    });

    // 3. Foreign Keys
    const foreignKeys = await prisma.$queryRawUnsafe(`
      SELECT 
        CONSTRAINT_NAME as constraint_name,
        COLUMN_NAME as column_name,
        REFERENCED_TABLE_NAME as referenced_table,
        REFERENCED_COLUMN_NAME as referenced_column
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = ? 
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `, tableName);

    return {
      tableName,
      columns: columns.map(c => ({
        field: c.Field,
        type: c.Type,
        nullable: c.Null === 'YES',
        key: c.Key,
        defaultValue: c.Default,
        extra: c.Extra
      })),
      indexes: Object.values(indexesMap),
      foreignKeys: foreignKeys.map(fk => ({
        constraintName: fk.constraint_name,
        column: fk.column_name,
        referencedTable: fk.referenced_table,
        referencedColumn: fk.referenced_column
      }))
    };
  }

  /**
   * Get live rows from a table with pagination and sorting
   */
  async getTableData(tableName, { page = 1, limit = 50, orderBy, orderDir = 'DESC', search } = {}) {
    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
      throw new Error('Invalid table name format');
    }

    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 500);
    const safePage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (safePage - 1) * safeLimit;
    const safeOrderDir = orderDir && orderDir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Total Count
    const countRes = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as total FROM \`${tableName}\``);
    const totalRows = Number(countRes[0]?.total || 0);

    // Build SELECT Query
    let query = `SELECT * FROM \`${tableName}\``;
    
    // Check if table has columns to order by
    if (orderBy && /^[a-zA-Z0-9_]+$/.test(orderBy)) {
      query += ` ORDER BY \`${orderBy}\` ${safeOrderDir}`;
    } else {
      // Default order: try created_at or id
      query += ` ORDER BY 1 ${safeOrderDir}`;
    }

    query += ` LIMIT ${safeLimit} OFFSET ${offset}`;

    const startTime = Date.now();
    const rows = await prisma.$queryRawUnsafe(query);
    const executionTimeMs = Date.now() - startTime;

    return {
      tableName,
      pagination: {
        page: safePage,
        limit: safeLimit,
        totalRows,
        totalPages: Math.ceil(totalRows / safeLimit)
      },
      executionTimeMs,
      rowsCount: rows.length,
      rows
    };
  }

  /**
   * Execute an arbitrary SQL Query (Console)
   */
  async executeQuery(sqlQuery) {
    if (!sqlQuery || typeof sqlQuery !== 'string' || !sqlQuery.trim()) {
      throw new Error('SQL Query cannot be empty');
    }

    const trimmed = sqlQuery.trim();
    const startTime = Date.now();

    const result = await prisma.$queryRawUnsafe(trimmed);
    const executionTimeMs = Date.now() - startTime;

    let rows = [];
    let affectedRows = null;

    if (Array.isArray(result)) {
      rows = result;
    } else if (typeof result === 'object' && result !== null) {
      affectedRows = result.count !== undefined ? result.count : result;
    }

    // Extract column headers if rows exist
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

    return {
      query: trimmed,
      executionTimeMs,
      rowCount: rows.length,
      affectedRows,
      columns,
      rows
    };
  }

  /**
   * Standalone connection tester using mysql2
   */
  async testConnection(connectionUrl) {
    if (!connectionUrl || typeof connectionUrl !== 'string') {
      throw new Error('Connection URL is required');
    }

    const startTime = Date.now();
    let connection;

    try {
      // Try connecting with mysql2
      connection = await mysql.createConnection(connectionUrl);
      const pingTimeMs = Date.now() - startTime;

      const [rows] = await connection.execute('SELECT VERSION() as version, DATABASE() as db_name, CURRENT_USER() as user_name');
      const [tableCountRows] = await connection.execute('SELECT COUNT(*) as cnt FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()');

      await connection.end();

      return {
        success: true,
        pingTimeMs,
        version: rows[0]?.version,
        database: rows[0]?.db_name,
        authenticatedUser: rows[0]?.user_name,
        tablesCount: tableCountRows[0]?.cnt || 0,
        message: '¡Conexión exitosa a MySQL!'
      };
    } catch (err) {
      if (connection) {
        try { await connection.end(); } catch {}
      }
      return {
        success: false,
        pingTimeMs: Date.now() - startTime,
        error: err.message,
        code: err.code || 'CONNECTION_ERROR',
        suggestion: err.message.includes('SSL') || err.message.includes('handshake')
          ? 'Verifica agregar ?sslaccept=strict o certificados TLS a tu cadena de conexión.'
          : err.message.includes('Access denied')
          ? 'Credenciales (usuario o contraseña) inválidas.'
          : 'Verifica que el host y puerto de MySQL sean accesibles desde este servidor.'
      };
    }
  }

  formatUptime(seconds) {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const sec = seconds % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${sec}s`);

    return parts.join(' ');
  }
}

const databaseService = new DatabaseService();
module.exports = databaseService;
