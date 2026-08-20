const fs = require('fs');
const path = require('path');

const SCHEMAS_DIR = path.resolve(__dirname, '../../schemas');

// Domain human-readable labels
const DOMAIN_LABELS = {
  project: '📁 Gestión de Proyectos',
  gamedev: '🎮 Desarrollo de Videojuegos',
  database: '🗄️ Arquitectura Cloud & DB',
  film: '🎬 Cine & Producción VFX',
  edtech: '📚 Educación & E-Learning',
  ecommerce: '🛒 Comercio & Facturación',
  generic: '✨ Genéricos & Documentos',
};

class SchemaService {
  /**
   * Scan schemas/ directory and return all available payload schemas grouped by domain
   */
  getSchemasCatalog() {
    if (!fs.existsSync(SCHEMAS_DIR)) {
      return { domains: {}, flat: [] };
    }

    const domainDirs = fs.readdirSync(SCHEMAS_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const domains = {};
    const flat = [];

    for (const domain of domainDirs) {
      const domainPath = path.join(SCHEMAS_DIR, domain);
      const files = fs.readdirSync(domainPath)
        .filter(f => f.endsWith('.json'));

      const schemasList = [];

      for (const filename of files) {
        const filePath = path.join(domainPath, filename);
        try {
          const rawContent = fs.readFileSync(filePath, 'utf-8');
          const template = JSON.parse(rawContent);

          // Parse filename: e.g. "task.v1.json" -> type="TASK", version=1
          const match = filename.match(/^(.+?)\.v(\d+)\.json$/i);
          let type = filename.replace(/\.json$/i, '').toUpperCase();
          let version = 1;

          if (match) {
            type = match[1].toUpperCase();
            version = parseInt(match[2], 10);
          }

          const key = `${type}.v${version}`;
          const label = `${type} (v${version})`;

          const schemaItem = {
            key,
            type,
            version,
            domain,
            filename,
            label,
            template,
          };

          schemasList.push(schemaItem);
          flat.push(schemaItem);
        } catch (err) {
          console.error(`[SchemaService] Failed to read schema file ${filePath}:`, err.message);
        }
      }

      domains[domain] = {
        name: domain,
        label: DOMAIN_LABELS[domain] || domain.toUpperCase(),
        schemas: schemasList,
      };
    }

    return { domains, flat };
  }

  /**
   * Get a specific schema template by domain and filename or by type and version
   */
  getSchema(type, version = 1) {
    const { flat } = this.getSchemasCatalog();
    const targetType = String(type).toUpperCase();
    const targetVer = parseInt(version, 10) || 1;

    const found = flat.find(s => s.type === targetType && s.version === targetVer);
    if (!found) {
      const error = new Error(`Schema template for type '${targetType}' v${targetVer} not found in schemas/ folder.`);
      error.statusCode = 404;
      throw error;
    }

    return found;
  }
}

const schemaService = new SchemaService();
module.exports = schemaService;
