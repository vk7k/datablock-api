/**
 * DataBlock Studio - Single Page Application Client
 * Fully Generic Polymorphic Block Architecture
 * Live File-Based Schemas (schemas/<domain>/<type>.<version>.json)
 */

// App State
const state = {
  activeTab: 'tree', // 'tree' | 'table' | 'types' | 'database'
  token: localStorage.getItem('datablock_token') || null,
  user: JSON.parse(localStorage.getItem('datablock_user') || 'null'),
  blocksTree: [],
  blocksFlat: [],
  schemasCatalog: { domains: {}, flat: [] },
  collapsedNodeIds: new Set(),
  expandedPayloadIds: new Set(),
  filters: {
    search: '',
    payload_type: ''
  }
};

// MySQL Explorer State
const dbState = {
  activeSubtab: 'tables', // 'tables' | 'sql' | 'config'
  status: null,
  tables: [],
  selectedTable: 'blocks',
  tableSchema: null,
  tableData: null,
  tableActiveView: 'data', // 'data' | 'schema'
  tablePage: 1,
  tableLimit: 50,
  tableSearch: '',
  sqlQuery: 'SELECT * FROM blocks LIMIT 10;',
  sqlResult: null,
  sqlLoading: false,
  testConnUrl: 'mysql://root:@localhost:3306/block_system',
  testConnResult: null,
  testConnLoading: false
};

// ==========================================
// API Helper
// ==========================================
async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }

  try {
    const response = await fetch(endpoint, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 && endpoint !== '/api/auth/login' && endpoint !== '/api/auth/register') {
        logout();
        openAuthModal();
      }
      throw new Error(data.message || (data.errors ? JSON.stringify(data.errors) : 'Error en la petición'));
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

// ==========================================
// Notification System (Toasts)
// ==========================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? '✔' : type === 'error' ? '✖' : 'ℹ';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 200);
  }, 3500);
}

// ==========================================
// Authentication Logic
// ==========================================
function updateAuthUI() {
  const userBadge = document.getElementById('userBadge');
  const authBtn = document.getElementById('authBtn');
  
  if (state.token && state.user) {
    userBadge.style.display = 'flex';
    userBadge.innerHTML = `
      <span>👤 ${state.user.email}</span>
      <span class="user-role">${state.user.role || 'user'}</span>
    `;
    authBtn.innerHTML = '🚪 Salir';
    authBtn.onclick = () => { logout(); showToast('Sesión cerrada'); };
  } else {
    userBadge.style.display = 'none';
    authBtn.innerHTML = '🔑 Ingresar';
    authBtn.onclick = () => openAuthModal();
  }
}

function setAuthSession(user, token) {
  state.token = token;
  state.user = user;
  localStorage.setItem('datablock_token', token);
  localStorage.setItem('datablock_user', JSON.stringify(user));
  updateAuthUI();
}

function logout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem('datablock_token');
  localStorage.removeItem('datablock_user');
  updateAuthUI();
  renderApp();
}

async function tryAutoLogin() {
  if (state.token) {
    try {
      const res = await apiRequest('/api/users/me');
      if (res.success && res.data && res.data.user) {
        setAuthSession(res.data.user, state.token);
        return true;
      }
    } catch {
      logout();
    }
  }

  // Auto-login with default seeded admin credentials if no token
  try {
    const res = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@uxcribe.com', password: 'AdminPass123!' })
    });
    if (res.success && res.data) {
      setAuthSession(res.data.user, res.data.token);
      showToast('Sesión iniciada como Administrador (Seed)', 'success');
      return true;
    }
  } catch (err) {
    console.log('Auto login notice:', err.message);
  }
  return false;
}

// ==========================================
// Schemas Catalog Fetcher (from schemas/ folder)
// ==========================================
async function loadSchemasCatalog() {
  try {
    const res = await apiRequest('/api/schemas');
    if (res.success && res.data) {
      state.schemasCatalog = res.data;
      populateTypeSelects();
    }
  } catch (err) {
    console.error('Error fetching schemas catalog:', err);
  }
}

// ==========================================
// Data Fetching & Sync
// ==========================================
async function loadData() {
  if (!state.token) return;

  if (state.activeTab === 'database') {
    await loadDatabaseView();
    return;
  }

  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) refreshBtn.classList.add('loading');

  try {
    // 1. Fetch Tree
    const treeRes = await apiRequest('/api/blocks/tree');
    state.blocksTree = (treeRes.success && Array.isArray(treeRes.data)) ? treeRes.data : [];

    // 2. Fetch Flat list with filters
    const queryParams = new URLSearchParams();
    if (state.filters.payload_type) queryParams.set('payload_type', state.filters.payload_type);
    if (state.filters.search) queryParams.set('search', state.filters.search);

    const flatRes = await apiRequest(`/api/blocks?${queryParams.toString()}`);
    state.blocksFlat = (flatRes.success && Array.isArray(flatRes.data)) ? flatRes.data : [];

    renderApp();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    if (refreshBtn) refreshBtn.classList.remove('loading');
  }
}

// Helper: Extract human-readable block name from payload
function getBlockDisplayName(block) {
  if (!block) return 'Bloque';
  if (block.payload && typeof block.payload === 'object') {
    if (block.payload.name) return block.payload.name;
    if (block.payload.title) return block.payload.title;
    if (block.payload.tableName) return `table: ${block.payload.tableName}`;
    if (block.payload.schemaName) return `schema: ${block.payload.schemaName}`;
    if (block.payload.sku) return `SKU: ${block.payload.sku}`;
  }
  return `[${block.payload_type || 'GENERIC'}] ${block.id ? block.id.slice(0, 8) : ''}`;
}

// Helper: Extract block status
function getBlockStatus(block) {
  if (block && block.payload && block.payload.status) {
    return block.payload.status;
  }
  return null;
}

// Helper: Extract dates
function getBlockDates(block) {
  if (!block || !block.payload) return null;
  const start = block.payload.start_date || block.payload.startDate;
  const end = block.payload.end_date || block.payload.dueDate || block.payload.endDate || block.payload.due_date;
  if (!start && !end) return null;

  const startStr = start ? new Date(start).toLocaleDateString() : '';
  const endStr = end ? new Date(end).toLocaleDateString() : '';
  
  let daysDiff = '';
  if (start && end) {
    const diff = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));
    daysDiff = ` (${diff}d)`;
  }

  return `📅 ${startStr}${endStr ? ' ➜ ' + endStr : ''}${daysDiff}`;
}

// ==========================================
// Render Views
// ==========================================
function renderApp() {
  const treeView = document.getElementById('treeViewContainer');
  const tableView = document.getElementById('tableViewContainer');
  const typesView = document.getElementById('typesViewContainer');
  const dbView = document.getElementById('databaseViewContainer');
  const blocksActionBar = document.getElementById('blocksActionBar');
  const blocksFiltersCard = document.getElementById('blocksFiltersCard');

  // Update tabs active class
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === state.activeTab);
  });

  // Toggle sections visibility
  if (treeView) treeView.style.display = state.activeTab === 'tree' ? 'block' : 'none';
  if (tableView) tableView.style.display = state.activeTab === 'table' ? 'block' : 'none';
  if (typesView) typesView.style.display = state.activeTab === 'types' ? 'block' : 'none';
  if (dbView) dbView.style.display = state.activeTab === 'database' ? 'block' : 'none';

  // Toggle blocks-specific action bar & filters
  const isBlockView = state.activeTab === 'tree' || state.activeTab === 'table' || state.activeTab === 'types';
  if (blocksActionBar) blocksActionBar.style.display = isBlockView ? 'flex' : 'none';
  if (blocksFiltersCard) blocksFiltersCard.style.display = (state.activeTab === 'tree' || state.activeTab === 'table') ? 'flex' : 'none';

  if (!state.token) {
    renderUnauthenticated();
    return;
  }

  if (state.activeTab === 'tree') renderTreeView();
  if (state.activeTab === 'table') renderTableView();
  if (state.activeTab === 'types') renderTypesView();
  if (state.activeTab === 'database') renderDatabaseView();
}

function renderUnauthenticated() {
  const container = document.getElementById('mainContentArea');
  if (container) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔐</div>
        <h2>Autenticación Requerida</h2>
        <p>Inicia sesión para gestionar y visualizar los bloques polimórficos.</p>
        <div style="margin-top: 1rem;">
          <button class="btn btn-primary" onclick="openAuthModal()">Ingresar al Sistema</button>
        </div>
      </div>
    `;
  }
}

// ==========================================
// Tree View Renderer
// ==========================================
function renderTreeView() {
  const container = document.getElementById('treeViewContainer');
  if (!container) return;

  if (state.blocksTree.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🌳</div>
        <h3>No hay bloques en la base de datos</h3>
        <p>Crea un bloque raíz o carga una de las plantillas temáticas de ejemplo (Juegos, Bases de Datos, etc.).</p>
        <div style="display: flex; gap: 0.75rem; justify-content: center; margin-top: 1.25rem; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="openCreateBlockModal(null)">+ Crear Bloque Raíz</button>
          <button class="btn btn-secondary" onclick="openSampleTemplatesModal()">🌱 Cargar Plantilla de Dominio</button>
        </div>
      </div>
    `;
    return;
  }

  let html = '<div class="tree-container">';
  state.blocksTree.forEach(rootBlock => {
    html += renderTreeNode(rootBlock, 0);
  });
  html += '</div>';

  container.innerHTML = html;
}

function renderTreeNode(block, depth = 0) {
  const hasChildren = block.children && block.children.length > 0;
  const isCollapsed = state.collapsedNodeIds.has(block.id);
  const isPayloadExpanded = state.expandedPayloadIds.has(block.id);

  const displayName = getBlockDisplayName(block);
  const status = getBlockStatus(block);
  const datePill = getBlockDates(block);

  const badgeTypeClass = `badge-type-${block.payload_type}` || 'badge-type-CUSTOM';
  const badgeStatusClass = status ? `badge-status-${status}` : '';

  let html = `
    <div class="tree-node" data-id="${block.id}">
      <div class="tree-node-header ${isCollapsed ? '' : 'expanded'}">
        <div class="tree-node-left" onclick="toggleNode('${block.id}')">
          <button class="tree-toggle-btn ${hasChildren ? (isCollapsed ? '' : 'expanded') : 'leaf'}" type="button">
            ${hasChildren ? '▶' : '•'}
          </button>
          <span class="badge ${badgeTypeClass}">${block.payload_type || 'GENERIC'}</span>
          <span class="tree-node-title" title="${escapeHtml(displayName)}">${escapeHtml(displayName)}</span>
          ${status ? `<span class="badge ${badgeStatusClass}">${escapeHtml(status)}</span>` : ''}
          <span class="badge-version">v${block.payload_type_version || 1}</span>
          ${datePill ? `<span class="date-pill">${datePill}</span>` : ''}
        </div>
        
        <div class="tree-node-actions">
          ${block.payload ? `
            <button class="btn btn-secondary btn-sm" onclick="togglePayload('${block.id}')" title="Ver / Ocultar Payload JSON">
              { } ${isPayloadExpanded ? 'Ocultar' : 'Payload'}
            </button>
          ` : ''}
          <button class="btn btn-secondary btn-sm" onclick="openCreateBlockModal('${block.id}')" title="Agregar bloque hijo a este nodo">
            ➕ Hijo
          </button>
          <button class="btn btn-secondary btn-sm" onclick="openEditBlockModal('${block.id}')" title="Editar bloque">
            ✏️ Editar
          </button>
          <button class="btn btn-danger btn-sm" onclick="openDeleteBlockModal('${block.id}', '${escapeHtml(displayName)}')" title="Eliminar bloque y descendientes">
            🗑️
          </button>
        </div>
      </div>
  `;

  if (block.payload && isPayloadExpanded) {
    html += `
      <div class="payload-preview">
        <pre><code>${escapeHtml(JSON.stringify(block.payload, null, 2))}</code></pre>
      </div>
    `;
  }

  if (hasChildren && !isCollapsed) {
    html += '<div class="tree-children">';
    block.children.forEach(child => {
      html += renderTreeNode(child, depth + 1);
    });
    html += '</div>';
  }

  html += '</div>';
  return html;
}

function toggleNode(nodeId) {
  if (state.collapsedNodeIds.has(nodeId)) {
    state.collapsedNodeIds.delete(nodeId);
  } else {
    state.collapsedNodeIds.add(nodeId);
  }
  renderTreeView();
}

function togglePayload(nodeId) {
  if (state.expandedPayloadIds.has(nodeId)) {
    state.expandedPayloadIds.delete(nodeId);
  } else {
    state.expandedPayloadIds.add(nodeId);
  }
  renderTreeView();
}

function toggleExpandAllTree() {
  if (state.collapsedNodeIds.size > 0) {
    state.collapsedNodeIds.clear();
  } else {
    const collectIds = (nodes) => {
      nodes.forEach(n => {
        if (n.children && n.children.length > 0) {
          state.collapsedNodeIds.add(n.id);
          collectIds(n.children);
        }
      });
    };
    collectIds(state.blocksTree);
  }
  renderTreeView();
}

// ==========================================
// Table / Flat View Renderer
// ==========================================
function renderTableView() {
  const container = document.getElementById('tableViewContainer');
  if (!container) return;

  let html = `
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nombre / Título</th>
            <th>Tipo (payload_type)</th>
            <th>Versión</th>
            <th>Estado</th>
            <th>Padre</th>
            <th>Payload Preview</th>
            <th style="text-align: right;">Acciones</th>
          </tr>
        </thead>
        <tbody>
  `;

  if (state.blocksFlat.length === 0) {
    html += `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">
          No se encontraron bloques con los filtros aplicados.
        </td>
      </tr>
    `;
  } else {
    state.blocksFlat.forEach(block => {
      const displayName = getBlockDisplayName(block);
      const status = getBlockStatus(block);
      const parentName = block.parent_id 
        ? (getBlockDisplayName(state.blocksFlat.find(b => b.id === block.parent_id)) || block.parent_id.slice(0, 8) + '...')
        : '<span style="color: var(--text-muted); font-style: italic;">Raíz (Ninguno)</span>';

      const badgeTypeClass = `badge-type-${block.payload_type}` || 'badge-type-CUSTOM';
      const badgeStatusClass = status ? `badge-status-${status}` : '';

      html += `
        <tr>
          <td><strong>${escapeHtml(displayName)}</strong></td>
          <td><span class="badge ${badgeTypeClass}">${block.payload_type || 'GENERIC'}</span></td>
          <td><span class="badge-version">v${block.payload_type_version || 1}</span></td>
          <td>${status ? `<span class="badge ${badgeStatusClass}">${escapeHtml(status)}</span>` : '-'}</td>
          <td><small>${parentName}</small></td>
          <td>
            ${block.payload ? `<small title="${escapeHtml(JSON.stringify(block.payload))}">${Object.keys(block.payload).length} atributos</small>` : '-'}
          </td>
          <td style="text-align: right;">
            <button class="btn btn-secondary btn-sm" onclick="openCreateBlockModal('${block.id}')" title="Agregar Hijo">➕</button>
            <button class="btn btn-secondary btn-sm" onclick="openEditBlockModal('${block.id}')" title="Editar">✏️</button>
            <button class="btn btn-danger btn-sm" onclick="openDeleteBlockModal('${block.id}', '${escapeHtml(displayName)}')" title="Eliminar">🗑️</button>
          </td>
        </tr>
      `;
    });
  }

  html += '</tbody></table></div>';
  container.innerHTML = html;
}

// ==========================================
// Schemas Catalog View Renderer (Read-Only)
// ==========================================
function renderTypesView() {
  const container = document.getElementById('typesViewContainer');
  if (!container) return;

  const domains = state.schemasCatalog.domains || {};
  const domainKeys = Object.keys(domains);

  let html = `
    <div class="action-bar" style="margin-bottom: 1.5rem;">
      <div>
        <h2>📐 Catálogo Oficial de Esquemas de Payload</h2>
        <p>Formatos de documento estandarizados e inmutables almacenados directamente en el código del proyecto (<code>schemas/</code>).</p>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <button class="btn btn-secondary" onclick="openSampleTemplatesModal()">🌱 Cargar Árbol de Dominio</button>
        <button class="btn btn-secondary" onclick="loadSchemasCatalog().then(() => { renderTypesView(); showToast('Esquemas recargados desde disco'); })">🔄 Recargar Archivos</button>
      </div>
    </div>
  `;

  if (domainKeys.length === 0) {
    html += `
      <div class="empty-state">
        <div class="empty-state-icon">📂</div>
        <p>Cargando esquemas de carpetas del proyecto...</p>
      </div>
    `;
  } else {
    domainKeys.forEach(domKey => {
      const dom = domains[domKey];
      html += `
        <div style="margin-bottom: 2rem;">
          <h3 style="font-size: 1.1rem; margin-bottom: 0.85rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>${escapeHtml(dom.label)}</span>
            <code style="font-size: 0.75rem; color: var(--text-muted);">schemas/${dom.name}/</code>
          </h3>
          
          <div class="types-grid">
      `;

      dom.schemas.forEach(s => {
        const badgeTypeClass = `badge-type-${s.type}` || 'badge-type-CUSTOM';
        html += `
          <div class="type-card">
            <div class="type-card-header">
              <div style="display: flex; align-items: center; gap: 0.35rem;">
                <span class="badge ${badgeTypeClass}">${escapeHtml(s.type)}</span>
                <span class="badge-version">v${s.version}</span>
              </div>
              <span style="font-size: 0.68rem; font-family: var(--font-mono); color: var(--text-muted);">${escapeHtml(s.filename)}</span>
            </div>
            <div class="type-card-template">
              <pre><code>${escapeHtml(JSON.stringify(s.template || {}, null, 2))}</code></pre>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="openCreateBlockWithSchema('${s.key}')">
              ➕ Crear bloque ${s.key}
            </button>
          </div>
        `;
      });

      html += `</div></div>`;
    });
  }

  container.innerHTML = html;
}

// ==========================================
// 1-Click Sample Domain Tree Seeders
// ==========================================
const DOMAIN_SAMPLES = {
  gamedev: {
    name: '🎮 Videojuego: Eldoria (Game Design)',
    description: 'Árbol completo de diseño de videojuego: Título -> Niveles/Biomas -> Jefes/NPCs, Misiones con loot y Modelos 3D PBR.',
    create: async () => {
      const root = await apiRequest('/api/blocks', {
        method: 'POST',
        body: JSON.stringify({
          payload_type: 'GAME',
          payload_type_version: 1,
          payload: {
            name: 'Eldoria: Shadows of Eternity',
            status: 'in_progress',
            genre: 'Action RPG / Open World',
            targetEngine: 'Unreal Engine 5.4',
            targetPlatforms: ['PC (Steam)', 'PlayStation 5', 'Xbox Series X'],
            leadDesigner: 'Sarah Jenkins',
            gantt: { color: '#f472b6', criticalPath: true }
          }
        })
      });

      const gameId = root.data.id;

      const level1 = await apiRequest('/api/blocks', {
        method: 'POST',
        body: JSON.stringify({
          parent_id: gameId,
          payload_type: 'LEVEL',
          payload_type_version: 1,
          payload: {
            name: 'Act I: Whispering Catacombs',
            status: 'in_progress',
            levelIndex: 1,
            biome: 'Underground Catacombs & Crypts',
            targetFPS: 60,
            lightScenario: 'Dynamic Torches + Volumetric Fog'
          }
        })
      });
      const level1Id = level1.data.id;

      await apiRequest('/api/blocks', {
        method: 'POST',
        body: JSON.stringify({
          parent_id: level1Id,
          payload_type: 'CHARACTER',
          payload_type_version: 1,
          payload: {
            name: 'Shadow Necromancer (Dungeon Boss)',
            status: 'active',
            characterClass: 'Boss / Spellcaster',
            maxHealth: 4800,
            manaPool: 2000,
            baseDamage: 140,
            phaseCount: 3,
            voiceActor: 'Elena Vance'
          }
        })
      });

      await apiRequest('/api/blocks', {
        method: 'POST',
        body: JSON.stringify({
          parent_id: level1Id,
          payload_type: 'QUEST',
          payload_type_version: 1,
          payload: {
            name: 'Quest: Purify the Sacred Altar',
            status: 'completed',
            questType: 'MAIN_STORY',
            xpReward: 3000,
            goldReward: 750,
            requiredLevel: 4,
            lootTable: ['Obsidian Relic', 'Elixir of Mana x5']
          }
        })
      });

      await apiRequest('/api/blocks', {
        method: 'POST',
        body: JSON.stringify({
          parent_id: level1Id,
          payload_type: 'ASSET_3D',
          payload_type_version: 1,
          payload: {
            name: 'Gargoyle Boss 3D Mesh & Textures',
            status: 'completed',
            polygonCount: 32500,
            lodLevels: 4,
            textureResolution: '4K PBR',
            fileUrl: 'https://cdn.uxcribe.com/3d/gargoyle_boss.fbx'
          }
        })
      });
    }
  },

  database: {
    name: '🗄️ Arquitectura Cloud: Aurora MySQL Cluster',
    description: 'Modelado de infraestructura y esquema de base de datos: Cluster -> Esquema -> Tablas -> Columnas, Índices y Migraciones.',
    create: async () => {
      const root = await apiRequest('/api/blocks', {
        method: 'POST',
        body: JSON.stringify({
          payload_type: 'DATABASE_CLUSTER',
          payload_type_version: 1,
          payload: {
            name: 'Aurora-Prod-Primary-Cluster',
            status: 'in_progress',
            engine: 'MySQL 8.4 LTS Enterprise',
            topology: 'Multi-AZ Primary with 2 Read Replicas',
            memoryGB: 64,
            storageGB: 1000,
            iops: 20000,
            gantt: { color: '#0ea5e9', criticalPath: true }
          }
        })
      });
      const clusterId = root.data.id;

      const schema = await apiRequest('/api/blocks', {
        method: 'POST',
        body: JSON.stringify({
          parent_id: clusterId,
          payload_type: 'SCHEMA',
          payload_type_version: 1,
          payload: {
            name: 'block_system_production',
            status: 'completed',
            defaultCharset: 'utf8mb4',
            defaultCollation: 'utf8mb4_unicode_ci',
            enforceForeignKeys: true
          }
        })
      });
      const schemaId = schema.data.id;

      const tableBlocks = await apiRequest('/api/blocks', {
        method: 'POST',
        body: JSON.stringify({
          parent_id: schemaId,
          payload_type: 'TABLE',
          payload_type_version: 1,
          payload: {
            name: 'table: blocks (Universal Polymorphic Node)',
            status: 'completed',
            storageEngine: 'InnoDB',
            rowFormat: 'DYNAMIC',
            estimatedRows: 750000,
            cascadeDeletesEnabled: true
          }
        })
      });
      const tableBlocksId = tableBlocks.data.id;

      await apiRequest('/api/blocks', {
        method: 'POST',
        body: JSON.stringify({
          parent_id: tableBlocksId,
          payload_type: 'COLUMN',
          payload_type_version: 1,
          payload: {
            name: 'column: payload (JSON dynamic metadata)',
            status: 'completed',
            dataType: 'JSON',
            isNullable: true,
            maxSizeBytes: 10485760
          }
        })
      });

      await apiRequest('/api/blocks', {
        method: 'POST',
        body: JSON.stringify({
          parent_id: tableBlocksId,
          payload_type: 'INDEX',
          payload_type_version: 1,
          payload: {
            name: 'index: idx_blocks_payload_type',
            status: 'completed',
            indexType: 'BTREE',
            indexedColumns: ['payload_type'],
            isUnique: false,
            cardinality: 120000
          }
        })
      });
    }
  },

  film: {
    name: '🎬 Producción de Cine: Neo-Genesis 2099',
    description: 'Producción audiovisual y VFX: Proyecto de Película -> Escenas -> Tomas de cámara y Pases de renderizado 8K.',
    create: async () => {
      const root = await apiRequest('/api/blocks', {
        method: 'POST',
        body: JSON.stringify({
          payload_type: 'FILM_PROJECT',
          payload_type_version: 1,
          payload: {
            name: 'Neo-Genesis 2099 (Feature Film)',
            status: 'in_progress',
            director: 'Denis Vance',
            aspectRatio: '2.39:1 Anamorphic',
            frameRate: 24,
            captureResolution: '8K RED RAW',
            soundFormat: 'Dolby Atmos 7.1.4'
          }
        })
      });
      const filmId = root.data.id;

      const scene = await apiRequest('/api/blocks', {
        method: 'POST',
        body: JSON.stringify({
          parent_id: filmId,
          payload_type: 'SCENE',
          payload_type_version: 1,
          payload: {
            name: 'Scene 12: The Cyber-Alley Ambush',
            status: 'in_progress',
            location: 'Sector 7 Neon Slums',
            timeOfDay: 'Night (Heavy Rain)',
            lightingSetup: 'Dual Cyan Key + Backlight Rim'
          }
        })
      });
      const sceneId = scene.data.id;

      await apiRequest('/api/blocks', {
        method: 'POST',
        body: JSON.stringify({
          parent_id: sceneId,
          payload_type: 'SHOT',
          payload_type_version: 1,
          payload: {
            name: 'Shot 12A: Close-Up Cybernetic Eye',
            status: 'completed',
            shotCode: 'SC12_SH01',
            lens: '85mm Anamorphic T1.8',
            cameraRig: 'Technocrane + Freefly Movi',
            approvedTakes: [3, 7]
          }
        })
      });
    }
  }
};

function openSampleTemplatesModal() {
  const dialog = document.getElementById('samplesModal');
  dialog.showModal();
}

async function loadSampleTree(domainKey) {
  const sample = DOMAIN_SAMPLES[domainKey];
  if (!sample) return;

  const dialog = document.getElementById('samplesModal');
  dialog.close();
  showToast(`Generando jerarquía polimórfica "${sample.name}"...`, 'info');

  try {
    await sample.create();
    showToast(`¡Jerarquía "${sample.name}" creada con éxito!`, 'success');
    await loadData();
  } catch (err) {
    showToast('Error al generar plantilla: ' + err.message, 'error');
  }
}

// ==========================================
// MySQL Database Viewer & Configurator
// ==========================================
async function loadDatabaseView() {
  if (!state.token) return;

  try {
    const [statusRes, tablesRes] = await Promise.all([
      apiRequest('/api/database/status'),
      apiRequest('/api/database/tables')
    ]);

    dbState.status = statusRes.data;
    dbState.tables = tablesRes.data || [];

    if (dbState.tables.length > 0 && !dbState.selectedTable) {
      dbState.selectedTable = dbState.tables[0].name;
    }

    if (dbState.selectedTable) {
      await loadTableDetails(dbState.selectedTable);
    }

    renderApp();
  } catch (err) {
    showToast('Error al cargar datos de MySQL: ' + err.message, 'error');
  }
}

async function loadTableDetails(tableName, view = null, page = 1) {
  dbState.selectedTable = tableName;
  if (view) dbState.tableActiveView = view;
  dbState.tablePage = page;

  try {
    if (dbState.tableActiveView === 'schema') {
      const schemaRes = await apiRequest(`/api/database/tables/${tableName}/schema`);
      dbState.tableSchema = schemaRes.data;
    } else {
      const dataRes = await apiRequest(`/api/database/tables/${tableName}/data?page=${page}&limit=${dbState.tableLimit}`);
      dbState.tableData = dataRes.data;
    }
    renderDatabaseView();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function setDbSubtab(subtab) {
  dbState.activeSubtab = subtab;
  renderDatabaseView();
}

function renderDatabaseView() {
  const container = document.getElementById('databaseViewContainer');
  if (!container) return;

  const st = dbState.status;
  if (!st) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⏳</div><p>Cargando información de MySQL...</p></div>';
    return;
  }

  let html = `
    <!-- Top Metrics Bar -->
    <div class="db-metrics-grid">
      <div class="db-metric-card">
        <span class="db-metric-label">Base de Datos Activa</span>
        <div class="db-metric-value">🗄️ ${escapeHtml(st.database)}</div>
        <small style="color: var(--text-muted); font-size: 0.72rem;">Motor: MySQL ${escapeHtml(st.version)}</small>
      </div>

      <div class="db-metric-card">
        <span class="db-metric-label">Tablas & Registros</span>
        <div class="db-metric-value">📊 ${st.totalTables} <span style="font-size: 0.9rem; font-weight: normal; color: var(--text-secondary);">tablas</span></div>
        <small style="color: var(--text-muted); font-size: 0.72rem;">${st.totalRows.toLocaleString()} filas totales (${st.totalSizeMB} MB)</small>
      </div>

      <div class="db-metric-card">
        <span class="db-metric-label">Tiempo Activo (Uptime)</span>
        <div class="db-metric-value">⏱️ ${escapeHtml(st.uptimeFormatted || '0s')}</div>
        <small style="color: var(--text-muted); font-size: 0.72rem;">${st.threadsConnected} conexiones activas</small>
      </div>

      <div class="db-metric-card">
        <span class="db-metric-label">Seguridad & SSL</span>
        <div class="db-metric-value">
          ${st.config?.ssl 
            ? '<span style="color: #34d399; font-size: 1rem;">🔒 SSL Activo</span>' 
            : '<span style="color: #fbbf24; font-size: 1rem;">🔓 Estándar (Local)</span>'}
        </div>
        <small style="color: var(--text-muted); font-size: 0.72rem;">Host: ${escapeHtml(st.config?.host || 'localhost')}:${st.config?.port || 3306}</small>
      </div>
    </div>

    <!-- Sub-navigation Tabs -->
    <div class="db-subnav">
      <button class="db-subnav-btn ${dbState.activeSubtab === 'tables' ? 'active' : ''}" onclick="setDbSubtab('tables')">
        <span>🗃️</span> Explorador de Tablas
      </button>
      <button class="db-subnav-btn ${dbState.activeSubtab === 'sql' ? 'active' : ''}" onclick="setDbSubtab('sql')">
        <span>⚡</span> Consola SQL
      </button>
      <button class="db-subnav-btn ${dbState.activeSubtab === 'config' ? 'active' : ''}" onclick="setDbSubtab('config')">
        <span>⚙️</span> Configuración & Test de Conexión
      </button>
    </div>
  `;

  if (dbState.activeSubtab === 'tables') {
    html += renderDbTablesView();
  } else if (dbState.activeSubtab === 'sql') {
    html += renderDbSqlView();
  } else if (dbState.activeSubtab === 'config') {
    html += renderDbConfigView();
  }

  container.innerHTML = html;
}

function renderDbTablesView() {
  const currentTable = dbState.tables.find(t => t.name === dbState.selectedTable) || dbState.tables[0];
  const tableName = currentTable ? currentTable.name : 'blocks';

  let html = `
    <div class="db-layout">
      <!-- Left Sidebar: Tables List -->
      <div class="db-sidebar">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong>Tablas (${dbState.tables.length})</strong>
          <button class="btn btn-secondary btn-sm" onclick="loadDatabaseView()" title="Refrescar">🔄</button>
        </div>
        <input type="text" class="form-control" placeholder="Filtrar tablas..." oninput="filterDbTables(this.value)" style="font-size: 0.8rem; padding: 0.4rem 0.6rem;">
        
        <div class="db-table-list" id="dbTableList">
  `;

  dbState.tables.forEach(t => {
    const isSelected = t.name === dbState.selectedTable;
    html += `
      <div class="db-table-item ${isSelected ? 'active' : ''}" onclick="loadTableDetails('${t.name}')">
        <span>📄 ${escapeHtml(t.name)}</span>
        <span class="badge badge-version" style="font-size: 0.68rem;">${t.rowCount} filas</span>
      </div>
    `;
  });

  html += `
        </div>
      </div>

      <!-- Right Main Panel: Table Details -->
      <div class="db-content">
        <div class="db-content-header">
          <div>
            <h2 style="font-size: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
              <span>📄 Tabla: <strong>${escapeHtml(tableName)}</strong></span>
              <span class="badge badge-type-PROJECT">${currentTable?.engine || 'InnoDB'}</span>
            </h2>
            <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">
              Collation: ${currentTable?.collation || 'utf8mb4'} • Tamaño: ${currentTable?.totalSizeKB || 0} KB • ${currentTable?.rowCount || 0} registros
            </p>
          </div>

          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-sm ${dbState.tableActiveView === 'data' ? 'btn-primary' : 'btn-secondary'}" onclick="loadTableDetails('${tableName}', 'data')">
              📊 Ver Datos (${currentTable?.rowCount || 0})
            </button>
            <button class="btn btn-sm ${dbState.tableActiveView === 'schema' ? 'btn-primary' : 'btn-secondary'}" onclick="loadTableDetails('${tableName}', 'schema')">
              📋 Ver Estructura
            </button>
          </div>
        </div>
  `;

  if (dbState.tableActiveView === 'schema') {
    html += renderTableSchemaView();
  } else {
    html += renderTableDataView();
  }

  html += '</div></div>';
  return html;
}

function filterDbTables(query) {
  const container = document.getElementById('dbTableList');
  if (!container) return;
  const q = query.toLowerCase().trim();
  const items = container.querySelectorAll('.db-table-item');
  items.forEach(el => {
    const text = el.textContent.toLowerCase();
    el.style.display = text.includes(q) ? 'flex' : 'none';
  });
}

function renderTableSchemaView() {
  const schema = dbState.tableSchema;
  if (!schema) return '<p style="color: var(--text-muted);">Cargando estructura...</p>';

  let html = `
    <h3 style="font-size: 0.95rem; margin-bottom: 0.75rem;">Columnas (${schema.columns.length})</h3>
    <div class="table-container" style="margin-bottom: 1.5rem;">
      <table class="data-table">
        <thead>
          <tr>
            <th>Campo (Field)</th>
            <th>Tipo de Dato</th>
            <th>Nullable</th>
            <th>Clave (Key)</th>
            <th>Valor Default</th>
            <th>Extra</th>
          </tr>
        </thead>
        <tbody>
  `;

  schema.columns.forEach(col => {
    html += `
      <tr>
        <td><strong>${escapeHtml(col.field)}</strong></td>
        <td><code>${escapeHtml(col.type)}</code></td>
        <td>${col.nullable ? '<span style="color: #34d399;">YES</span>' : '<span style="color: #f43f5e;">NO</span>'}</td>
        <td>${col.key ? `<span class="badge badge-type-PROJECT">${col.key}</span>` : '-'}</td>
        <td><code>${col.defaultValue !== null ? escapeHtml(col.defaultValue) : 'NULL'}</code></td>
        <td><small style="color: var(--text-muted);">${escapeHtml(col.extra || '')}</small></td>
      </tr>
    `;
  });

  html += `
        </tbody>
      </table>
    </div>

    <h3 style="font-size: 0.95rem; margin-bottom: 0.75rem;">Índices (${schema.indexes.length})</h3>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nombre del Índice</th>
            <th>Columnas Indexadas</th>
            <th>Tipo</th>
            <th>Único</th>
            <th>Cardinalidad</th>
          </tr>
        </thead>
        <tbody>
  `;

  schema.indexes.forEach(idx => {
    html += `
      <tr>
        <td><strong>${escapeHtml(idx.name)}</strong></td>
        <td><code>${idx.columns.join(', ')}</code></td>
        <td><span class="badge badge-version">${idx.type}</span></td>
        <td>${idx.unique ? '<span style="color: #34d399;">SI (UNIQUE)</span>' : '<span style="color: var(--text-muted);">NO</span>'}</td>
        <td>${idx.cardinality || 0}</td>
      </tr>
    `;
  });

  html += '</tbody></table></div>';
  return html;
}

function renderTableDataView() {
  const d = dbState.tableData;
  if (!d) return '<p style="color: var(--text-muted);">Cargando registros...</p>';

  if (!d.rows || d.rows.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <p>La tabla <strong>${escapeHtml(d.tableName)}</strong> no contiene registros.</p>
      </div>
    `;
  }

  const columns = Object.keys(d.rows[0]);

  let html = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; font-size: 0.8rem; color: var(--text-muted);">
      <span>Mostrando ${d.rowsCount} de ${d.pagination.totalRows} registros (Página ${d.pagination.page} de ${d.pagination.totalPages}) • Consulta en ${d.executionTimeMs}ms</span>
      <div style="display: flex; gap: 0.5rem;">
        <button class="btn btn-secondary btn-sm" ${d.pagination.page <= 1 ? 'disabled' : ''} onclick="loadTableDetails('${d.tableName}', 'data', ${d.pagination.page - 1})">
          ◀ Anterior
        </button>
        <button class="btn btn-secondary btn-sm" ${d.pagination.page >= d.pagination.totalPages ? 'disabled' : ''} onclick="loadTableDetails('${d.tableName}', 'data', ${d.pagination.page + 1})">
          Siguiente ▶
        </button>
      </div>
    </div>

    <div class="table-container" style="max-height: 550px;">
      <table class="data-table">
        <thead>
          <tr>
  `;

  columns.forEach(col => {
    html += `<th>${escapeHtml(col)}</th>`;
  });

  html += '</tr></thead><tbody>';

  d.rows.forEach(row => {
    html += '<tr>';
    columns.forEach(col => {
      const val = row[col];
      if (val === null || val === undefined) {
        html += '<td style="color: var(--text-muted); font-style: italic;">NULL</td>';
      } else if (typeof val === 'object') {
        const jsonStr = JSON.stringify(val);
        html += `<td><code style="font-size: 0.72rem; color: #38bdf8; max-width: 200px; display: inline-block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(jsonStr)}">${escapeHtml(jsonStr)}</code></td>`;
      } else {
        html += `<td>${escapeHtml(String(val))}</td>`;
      }
    });
    html += '</tr>';
  });

  html += '</tbody></table></div>';
  return html;
}

// ==========================================
// SQL Interactive Console
// ==========================================
function renderDbSqlView() {
  const res = dbState.sqlResult;

  let html = `
    <div class="db-content">
      <div class="db-content-header">
        <div>
          <h2>⚡ Consola Interactiva SQL</h2>
          <p style="font-size: 0.8rem; color: var(--text-muted);">Ejecuta consultas en tiempo real sobre la base de datos MySQL activa.</p>
        </div>
      </div>

      <div class="sql-editor-container">
        <div class="sql-snippets">
          <span style="font-size: 0.75rem; color: var(--text-muted);">Snippets rápidos:</span>
          <button class="sql-snippet-btn" onclick="setSqlQuery('SELECT * FROM blocks LIMIT 10;')">SELECT blocks</button>
          <button class="sql-snippet-btn" onclick="setSqlQuery('SELECT payload_type, COUNT(*) as total FROM blocks GROUP BY payload_type;')">COUNT by payload_type</button>
          <button class="sql-snippet-btn" onclick="setSqlQuery('SHOW TABLE STATUS;')">SHOW TABLE STATUS</button>
          <button class="sql-snippet-btn" onclick="setSqlQuery('SELECT * FROM users;')">SELECT users</button>
        </div>

        <textarea id="sqlConsoleInput" class="sql-editor" rows="5" placeholder="Escribe tu consulta SQL aquí... ej: SELECT * FROM blocks LIMIT 10;">${escapeHtml(dbState.sqlQuery)}</textarea>

        <div style="display: flex; justify-content: space-between; align-items: center;">
          <small style="color: var(--text-muted); font-size: 0.75rem;">Atajo: Presiona <strong>Ctrl + Enter</strong> para ejecutar.</small>
          <button class="btn btn-primary" onclick="executeSqlQuery()" id="runSqlBtn">
            <span>▶</span> Ejecutar Consulta
          </button>
        </div>
      </div>
  `;

  if (res) {
    html += `
      <div style="margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <span style="font-size: 0.85rem; font-weight: 600;">
            Resultados: <span class="badge badge-version">${res.rowCount} filas</span>
            <span style="color: var(--text-muted); font-size: 0.75rem; margin-left: 0.5rem;">⏱️ ${res.executionTimeMs}ms</span>
          </span>
          <button class="btn btn-secondary btn-sm" onclick="copySqlResults()">📋 Copiar JSON</button>
        </div>
    `;

    if (res.rows && res.rows.length > 0) {
      html += `
        <div class="table-container" style="max-height: 450px;">
          <table class="data-table">
            <thead>
              <tr>
      `;
      res.columns.forEach(col => {
        html += `<th>${escapeHtml(col)}</th>`;
      });
      html += '</tr></thead><tbody>';

      res.rows.forEach(row => {
        html += '<tr>';
        res.columns.forEach(col => {
          const val = row[col];
          if (val === null || val === undefined) {
            html += '<td style="color: var(--text-muted); font-style: italic;">NULL</td>';
          } else if (typeof val === 'object') {
            html += `<td><code>${escapeHtml(JSON.stringify(val))}</code></td>`;
          } else {
            html += `<td>${escapeHtml(String(val))}</td>`;
          }
        });
        html += '</tr>';
      });

      html += '</tbody></table></div>';
    } else {
      html += '<p style="color: var(--text-muted); font-size: 0.85rem;">Consulta ejecutada exitosamente sin filas retornadas.</p>';
    }

    html += '</div>';
  }

  html += '</div>';
  return html;
}

function setSqlQuery(sql) {
  dbState.sqlQuery = sql;
  const input = document.getElementById('sqlConsoleInput');
  if (input) input.value = sql;
}

async function executeSqlQuery() {
  const input = document.getElementById('sqlConsoleInput');
  const sql = input ? input.value.trim() : dbState.sqlQuery;
  if (!sql) return;

  dbState.sqlQuery = sql;
  const btn = document.getElementById('runSqlBtn');
  if (btn) btn.classList.add('loading');

  try {
    const res = await apiRequest('/api/database/query', {
      method: 'POST',
      body: JSON.stringify({ query: sql })
    });
    dbState.sqlResult = res.data;
    renderDatabaseView();
    showToast(`Consulta ejecutada en ${res.data.executionTimeMs}ms`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    if (btn) btn.classList.remove('loading');
  }
}

function copySqlResults() {
  if (dbState.sqlResult?.rows) {
    navigator.clipboard.writeText(JSON.stringify(dbState.sqlResult.rows, null, 2));
    showToast('Resultados copiados al portapapeles en formato JSON', 'success');
  }
}

// ==========================================
// Connection Configuration & Tester View
// ==========================================
function renderDbConfigView() {
  const cfg = dbState.status?.config || {};
  const testRes = dbState.testConnResult;

  return `
    <div class="db-content">
      <div class="db-content-header">
        <div>
          <h2>⚙️ Configuración & Test de Conexión MySQL</h2>
          <p style="font-size: 0.8rem; color: var(--text-muted);">Revisa los parámetros actuales y prueba conexiones hacia bases de datos remotas en Render o la nube.</p>
        </div>
      </div>

      <!-- Current Connection Card -->
      <div style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; margin-bottom: 1.5rem;">
        <h3 style="font-size: 1rem; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>🔌 Conexión Activa en el Servidor</span>
          ${cfg.ssl ? '<span class="badge badge-type-TASK">SSL Activado</span>' : '<span class="badge badge-version">Local / No SSL</span>'}
        </h3>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; font-size: 0.85rem;">
          <div><span style="color: var(--text-muted);">Host:</span> <strong>${escapeHtml(cfg.host || 'localhost')}</strong></div>
          <div><span style="color: var(--text-muted);">Puerto:</span> <strong>${cfg.port || 3306}</strong></div>
          <div><span style="color: var(--text-muted);">Usuario:</span> <strong>${escapeHtml(cfg.user || 'root')}</strong></div>
          <div><span style="color: var(--text-muted);">Base de Datos:</span> <strong>${escapeHtml(cfg.database || 'block_system')}</strong></div>
        </div>

        <div style="margin-top: 1rem;">
          <span style="color: var(--text-muted); font-size: 0.75rem; display: block; margin-bottom: 0.3rem;">Cadena de Conexión Enmascarada (DATABASE_URL):</span>
          <code style="background: var(--bg-secondary); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm); font-size: 0.78rem; display: block; overflow-x: auto; color: var(--accent-blue);">
            ${escapeHtml(cfg.maskedUrl || 'mysql://root:******@localhost:3306/block_system')}
          </code>
        </div>
      </div>

      <!-- Live Connection Tester Tool -->
      <div style="background: var(--bg-primary); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: var(--radius-md); padding: 1.25rem;">
        <h3 style="font-size: 1rem; margin-bottom: 0.5rem; color: #38bdf8;">
          🧪 Probador de Conexión en Vivo
        </h3>
        <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 1rem;">
          Ingresa una cadena de conexión MySQL (local o en la nube) para medir la latencia de red, verificar el apretón de manos SSL y validar credenciales.
        </p>

        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="fillTestConnection('mysql://root:@localhost:3306/block_system')">
            Preset: MySQL Local (Laragon)
          </button>
          <button type="button" class="btn btn-secondary btn-sm" onclick="fillTestConnection('mysql://usuario:password@host.render.com:3306/database?sslaccept=strict')">
            Preset: Render / TiDB Cloud (SSL)
          </button>
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label for="testConnInput">Cadena de Conexión a Probar:</label>
          <input type="text" id="testConnInput" class="form-control" style="font-family: var(--font-mono); font-size: 0.85rem;" value="${escapeHtml(dbState.testConnUrl)}" placeholder="mysql://usuario:clave@servidor.com:3306/nombre_db?sslaccept=strict">
        </div>

        <button class="btn btn-primary" onclick="testDatabaseConnection()" id="testConnBtn">
          🔌 Probar Conectividad
        </button>

        ${testRes ? `
          <div style="margin-top: 1.25rem; background: var(--bg-secondary); border: 1px solid ${testRes.success ? '#10b981' : '#f43f5e'}; border-radius: var(--radius-sm); padding: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <strong>${testRes.success ? '✔ Conexión Exitosa' : '✖ Falló la Conexión'}</strong>
              <span class="badge ${testRes.success ? 'badge-type-TASK' : 'badge-type-CONTRACT'}">
                Ping: ${testRes.pingTimeMs}ms
              </span>
            </div>

            ${testRes.success ? `
              <div style="font-size: 0.82rem; color: var(--text-secondary);">
                <div>• Versión de MySQL: <strong>${escapeHtml(testRes.version || 'Desconocida')}</strong></div>
                <div>• Base de Datos: <strong>${escapeHtml(testRes.database || '-')}</strong></div>
                <div>• Usuario Autenticado: <strong>${escapeHtml(testRes.authenticatedUser || '-')}</strong></div>
                <div>• Tablas encontradas: <strong>${testRes.tablesCount}</strong></div>
              </div>
            ` : `
              <div style="font-size: 0.82rem; color: #fb7185;">
                <div>Error: <strong>${escapeHtml(testRes.error)}</strong> (Código: ${escapeHtml(testRes.code || 'ERR')})</div>
                ${testRes.suggestion ? `<div style="margin-top: 0.5rem; color: var(--text-primary);">💡 Sugerencia: ${escapeHtml(testRes.suggestion)}</div>` : ''}
              </div>
            `}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function fillTestConnection(url) {
  dbState.testConnUrl = url;
  const input = document.getElementById('testConnInput');
  if (input) input.value = url;
}

async function testDatabaseConnection() {
  const input = document.getElementById('testConnInput');
  const url = input ? input.value.trim() : dbState.testConnUrl;
  if (!url) return;

  dbState.testConnUrl = url;
  const btn = document.getElementById('testConnBtn');
  if (btn) btn.classList.add('loading');

  try {
    const res = await apiRequest('/api/database/test-connection', {
      method: 'POST',
      body: JSON.stringify({ connectionUrl: url })
    });
    dbState.testConnResult = res.data;
    renderDatabaseView();
    if (res.data.success) {
      showToast(`¡Conexión exitosa! Ping: ${res.data.pingTimeMs}ms`, 'success');
    } else {
      showToast(`Error de conexión: ${res.data.error}`, 'error');
    }
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    if (btn) btn.classList.remove('loading');
  }
}

// ==========================================
// Modals & Form Dialogs
// ==========================================
function populateParentSelect(selectedParentId = null, currentBlockId = null) {
  const parentSelect = document.getElementById('blockParentId');
  if (!parentSelect) return;

  parentSelect.innerHTML = '<option value="">-- Raíz (Sin Padre) --</option>';

  const addOptions = (nodes, prefix = '') => {
    nodes.forEach(node => {
      if (node.id === currentBlockId) return;

      const opt = document.createElement('option');
      opt.value = node.id;
      opt.textContent = `${prefix}[${node.payload_type || 'GENERIC'}] ${getBlockDisplayName(node)}`;
      if (node.id === selectedParentId) opt.selected = true;
      parentSelect.appendChild(opt);

      if (node.children && node.children.length > 0) {
        addOptions(node.children, prefix + '  ↳ ');
      }
    });
  };

  addOptions(state.blocksTree);
}

function populateTypeSelects() {
  const typeSelect = document.getElementById('blockType');
  const filterTypeSelect = document.getElementById('filterType');
  const domains = state.schemasCatalog.domains || {};
  const flat = state.schemasCatalog.flat || [];

  if (typeSelect) {
    const currentVal = typeSelect.value;
    typeSelect.innerHTML = '';

    Object.keys(domains).forEach(domKey => {
      const dom = domains[domKey];
      if (dom.schemas && dom.schemas.length > 0) {
        const group = document.createElement('optgroup');
        group.label = dom.label || dom.name;

        dom.schemas.forEach(s => {
          const opt = document.createElement('option');
          opt.value = s.key; // e.g. "TASK.v1", "STORE.v1"
          opt.textContent = `${s.type} (v${s.version})`;
          group.appendChild(opt);
        });

        typeSelect.appendChild(group);
      }
    });

    if (currentVal) typeSelect.value = currentVal;
  }

  if (filterTypeSelect) {
    const currentFilter = filterTypeSelect.value;
    filterTypeSelect.innerHTML = '<option value="">Todos los tipos</option>';
    
    // Unique types for filter
    const uniqueTypes = [...new Set(flat.map(s => s.type))];
    uniqueTypes.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      filterTypeSelect.appendChild(opt);
    });

    if (currentFilter) filterTypeSelect.value = currentFilter;
  }
}

// ==========================================
// Payload Table Editor (Schema-Conforming)
// ==========================================
function renderPayloadTable(templateObj = {}, valuesObj = {}) {
  const container = document.getElementById('payloadTableContainer');
  if (!container) return;

  if (!templateObj || typeof templateObj !== 'object' || Object.keys(templateObj).length === 0) {
    container.innerHTML = '<p style="padding: 1rem; color: var(--text-muted); font-size: 0.8rem;">Este esquema no define propiedades fijas.</p>';
    return;
  }

  // Combine keys from templateObj and any extra values in valuesObj
  const allKeys = [...new Set([...Object.keys(templateObj), ...Object.keys(valuesObj || {})])];

  let html = `
    <table class="payload-editor-table">
      <thead>
        <tr>
          <th style="width: 38%;">Propiedad (Esquema)</th>
          <th style="width: 62%;">Valor</th>
        </tr>
      </thead>
      <tbody>
  `;

  allKeys.forEach(key => {
    const defaultVal = templateObj[key];
    const currentVal = (valuesObj && valuesObj[key] !== undefined) ? valuesObj[key] : defaultVal;
    
    // Detect type
    let type = typeof defaultVal;
    if (defaultVal === null && currentVal !== null) type = typeof currentVal;
    if (Array.isArray(defaultVal) || Array.isArray(currentVal)) type = 'array';
    if (type === 'object' && !Array.isArray(defaultVal) && defaultVal !== null) type = 'object';

    html += `
      <tr>
        <td>
          <div class="payload-prop-cell">
            <span class="payload-prop-key">${escapeHtml(key)}</span>
            <span class="payload-prop-type">${type}</span>
          </div>
        </td>
        <td>
    `;

    if (key === 'status') {
      const statusOptions = ['pending', 'in_progress', 'completed', 'cancelled', 'active', 'approved', 'applied'];
      const statusVal = String(currentVal || 'pending');
      html += `
        <select class="select-control payload-field-input payload-field" data-key="${escapeHtml(key)}" data-type="string">
      `;
      const optionsSet = new Set(statusOptions);
      if (statusVal && !optionsSet.has(statusVal)) {
        optionsSet.add(statusVal);
      }
      optionsSet.forEach(opt => {
        html += `<option value="${escapeHtml(opt)}" ${statusVal === opt ? 'selected' : ''}>${escapeHtml(opt)}</option>`;
      });
      html += `</select>`;
    } else if (type === 'boolean') {
      const boolVal = currentVal === true || currentVal === 'true';
      html += `
        <select class="select-control payload-field-input payload-field" data-key="${escapeHtml(key)}" data-type="boolean">
          <option value="true" ${boolVal ? 'selected' : ''}>true (Sí / Verdadero)</option>
          <option value="false" ${!boolVal ? 'selected' : ''}>false (No / Falso)</option>
        </select>
      `;
    } else if (type === 'number') {
      html += `
        <input type="number" step="any" class="payload-field-input payload-field" data-key="${escapeHtml(key)}" data-type="number" value="${currentVal !== undefined && currentVal !== null ? currentVal : 0}">
      `;
    } else if (type === 'array' || type === 'object') {
      const jsonStr = typeof currentVal === 'object' ? JSON.stringify(currentVal) : String(currentVal || '');
      html += `
        <input type="text" class="payload-field-input payload-field" data-key="${escapeHtml(key)}" data-type="${type}" value="${escapeHtml(jsonStr)}" placeholder="${type === 'array' ? '[\"elem1\", \"elem2\"]' : '{\"key\": \"val\"}'}">
      `;
    } else {
      // String / Date
      html += `
        <input type="text" class="payload-field-input payload-field" data-key="${escapeHtml(key)}" data-type="string" value="${escapeHtml(String(currentVal !== undefined && currentVal !== null ? currentVal : ''))}">
      `;
    }

    html += `</td></tr>`;
  });

  html += `</tbody></table>`;
  container.innerHTML = html;
}

function getPayloadFromTable() {
  const container = document.getElementById('payloadTableContainer');
  if (!container) return {};

  const fields = container.querySelectorAll('.payload-field');
  const payload = {};

  fields.forEach(field => {
    const key = field.dataset.key;
    const type = field.dataset.type;
    const rawVal = field.value;

    if (!key) return;

    if (type === 'number') {
      const num = parseFloat(rawVal);
      payload[key] = isNaN(num) ? 0 : num;
    } else if (type === 'boolean') {
      payload[key] = rawVal === 'true';
    } else if (type === 'array' || type === 'object') {
      try {
        payload[key] = JSON.parse(rawVal);
      } catch {
        payload[key] = rawVal;
      }
    } else {
      payload[key] = rawVal;
    }
  });

  return payload;
}

function handleTypeChange(force = true) {
  const typeSelect = document.getElementById('blockType');
  const versionInput = document.getElementById('blockSchemaVersion');
  if (!typeSelect) return;

  const selectedKey = typeSelect.value; // e.g. "TASK.v1", "STORE.v1"
  const flat = state.schemasCatalog.flat || [];
  const match = flat.find(s => s.key === selectedKey) || flat.find(s => s.type === selectedKey);

  const blockId = document.getElementById('blockId')?.value;
  // If editing and not forcing template reload, keep current table values
  if (blockId && !force) {
    return;
  }

  if (match) {
    if (versionInput) versionInput.value = match.version || 1;
    renderPayloadTable(match.template || {}, {});
  } else {
    if (versionInput) versionInput.value = 1;
    renderPayloadTable({
      name: `Nuevo Bloque ${selectedKey}`,
      status: 'active'
    }, {});
  }
}

function openCreateBlockModal(parentId = null) {
  const dialog = document.getElementById('blockModal');
  const form = document.getElementById('blockForm');
  const title = document.getElementById('blockModalTitle');
  const blockIdInput = document.getElementById('blockId');

  form.reset();
  blockIdInput.value = '';
  title.textContent = parentId ? '➕ Crear Bloque Hijo' : '➕ Crear Bloque Raíz';

  populateTypeSelects();
  populateParentSelect(parentId, null);

  // Set default type: TASK.v1 for children, PROJECT.v1 for root
  const typeSelect = document.getElementById('blockType');
  if (typeSelect) {
    const defaultKey = parentId ? 'TASK.v1' : 'PROJECT.v1';
    if (typeSelect.querySelector(`option[value="${defaultKey}"]`)) {
      typeSelect.value = defaultKey;
    }
  }

  // Force load example payload template properties table for the selected schema
  handleTypeChange(true);

  dialog.showModal();
}

function openCreateBlockWithSchema(schemaKey) {
  openCreateBlockModal(null);
  const typeSelect = document.getElementById('blockType');
  if (typeSelect) {
    typeSelect.value = schemaKey;
    handleTypeChange(true);
  }
}

async function openEditBlockModal(blockId) {
  const dialog = document.getElementById('blockModal');
  const form = document.getElementById('blockForm');
  const title = document.getElementById('blockModalTitle');
  const blockIdInput = document.getElementById('blockId');

  form.reset();
  blockIdInput.value = blockId;
  title.textContent = '✏️ Editar Bloque';

  try {
    const res = await apiRequest(`/api/blocks/${blockId}`);
    const block = res.data;

    populateTypeSelects();

    const expectedKey = `${block.payload_type}.v${block.payload_type_version || 1}`;
    const typeSelect = document.getElementById('blockType');
    if (typeSelect.querySelector(`option[value="${expectedKey}"]`)) {
      typeSelect.value = expectedKey;
    }

    document.getElementById('blockSchemaVersion').value = block.payload_type_version || 1;

    populateParentSelect(block.parent_id, block.id);

    // Look up schema template for default keys definition
    const flat = state.schemasCatalog.flat || [];
    const match = flat.find(s => s.key === expectedKey) || flat.find(s => s.type === block.payload_type);

    renderPayloadTable(match?.template || block.payload || {}, block.payload || {});

    dialog.showModal();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleBlockFormSubmit(e) {
  e.preventDefault();

  const blockId = document.getElementById('blockId').value;
  const parentIdVal = document.getElementById('blockParentId').value;
  const rawTypeValue = document.getElementById('blockType').value; // e.g. "TASK.v1"

  // Parse type and version from key (e.g. "TASK.v1" -> type="TASK", version=1)
  let payload_type = rawTypeValue;
  let payload_type_version = 1;

  const match = rawTypeValue.match(/^(.+?)\.v(\d+)$/i);
  if (match) {
    payload_type = match[1].toUpperCase();
    payload_type_version = parseInt(match[2], 10);
  } else {
    payload_type_version = parseInt(document.getElementById('blockSchemaVersion').value, 10) || 1;
  }

  // Extract structured values from table
  const payload = getPayloadFromTable();

  const payloadBody = {
    payload_type,
    payload_type_version,
    parent_id: parentIdVal ? parentIdVal : null,
    payload
  };

  const isEdit = !!blockId;
  const endpoint = isEdit ? `/api/blocks/${blockId}` : '/api/blocks';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    await apiRequest(endpoint, {
      method,
      body: JSON.stringify(payloadBody)
    });

    showToast(isEdit ? 'Bloque actualizado correctamente' : 'Bloque creado correctamente', 'success');
    document.getElementById('blockModal').close();
    await loadData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Delete Modal Logic
let deleteTargetId = null;
function openDeleteBlockModal(blockId, blockName) {
  deleteTargetId = blockId;
  const dialog = document.getElementById('deleteModal');
  const desc = document.getElementById('deleteBlockDesc');
  desc.textContent = `¿Estás seguro de eliminar el bloque "${blockName}"? Se eliminarán en CASCADA todos los bloques hijos que dependan de él.`;
  dialog.showModal();
}

async function confirmDeleteBlock() {
  if (!deleteTargetId) return;

  try {
    await apiRequest(`/api/blocks/${deleteTargetId}`, { method: 'DELETE' });
    showToast('Bloque eliminado correctamente', 'success');
    document.getElementById('deleteModal').close();
    deleteTargetId = null;
    await loadData();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// Format Payload Helper Button
function formatPayloadTextarea() {
  const textarea = document.getElementById('blockPayload');
  try {
    const parsed = JSON.parse(textarea.value);
    textarea.value = JSON.stringify(parsed, null, 2);
  } catch (err) {
    showToast('El JSON no es válido: ' + err.message, 'error');
  }
}

// Auth Modal
function openAuthModal() {
  const dialog = document.getElementById('authModal');
  dialog.showModal();
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const res = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (res.success && res.data) {
      setAuthSession(res.data.user, res.data.token);
      document.getElementById('authModal').close();
      showToast(`¡Bienvenido ${res.data.user.email}!`, 'success');
      await loadSchemasCatalog();
      await loadData();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function fillCredentials(email, password) {
  document.getElementById('loginEmail').value = email;
  document.getElementById('loginPassword').value = password;
}

// Utility: Escape HTML
function escapeHtml(str) {
  if (typeof str !== 'string') return String(str || '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ==========================================
// Initialization & Event Listeners
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  // Navigation Tabs
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeTab = btn.dataset.tab;
      renderApp();
      if (state.activeTab === 'database') {
        loadDatabaseView();
      }
    });
  });

  // Filter Event Listeners
  const searchInput = document.getElementById('filterSearch');
  const filterType = document.getElementById('filterType');

  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.filters.search = e.target.value;
        loadData();
      }, 300);
    });
  }

  if (filterType) {
    filterType.addEventListener('change', (e) => {
      state.filters.payload_type = e.target.value;
      loadData();
    });
  }

  // Type change listener: ALWAYS trigger dynamic template update on user selection
  const blockTypeSelect = document.getElementById('blockType');
  if (blockTypeSelect) {
    blockTypeSelect.addEventListener('change', () => {
      handleTypeChange(true);
    });
  }

  // Form Submissions
  document.getElementById('blockForm')?.addEventListener('submit', handleBlockFormSubmit);
  document.getElementById('loginForm')?.addEventListener('submit', handleLoginSubmit);

  // Keyboard shortcut for SQL Console (Ctrl + Enter)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      const sqlInput = document.getElementById('sqlConsoleInput');
      if (sqlInput && document.activeElement === sqlInput) {
        e.preventDefault();
        executeSqlQuery();
      }
    }
  });

  // Close dialog buttons
  document.querySelectorAll('[data-close-dialog]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dialog = btn.closest('dialog');
      if (dialog) dialog.close();
    });
  });

  updateAuthUI();

  // Try auto-login with session or seed admin
  await tryAutoLogin();
  await loadSchemasCatalog();
  await loadData();
});
