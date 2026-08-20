/**
 * DataBlock Studio - Single Page Application Client
 * Full CRUD, Hierarchical Tree, Relational Parent Editor, Polymorphic Domain Types,
 * and Comprehensive MySQL Database Viewer & Connection Configurator
 */

// Polymorphic Block Types grouped by Domain with Realistic JSON Payload Templates
const DEFAULT_TYPES = [
  // 🏢 1. Software Engineering & Agile
  {
    domain: 'software',
    type: 'PROJECT',
    label: 'Proyecto Software (Root)',
    color: 'badge-type-PROJECT',
    template: {
      budget: 180000,
      client: 'Acme Cloud Corp',
      manager: 'Sarah Jenkins',
      methodology: 'SCRUM',
      repoUrl: 'https://github.com/acme/cloud-engine',
      gantt: { color: '#38bdf8', criticalPath: true }
    }
  },
  {
    domain: 'software',
    type: 'EPIC',
    label: 'Épica de Negocio',
    color: 'badge-type-EPIC',
    template: {
      epicKey: 'EPIC-102',
      businessValue: 'CRITICAL',
      targetQuarter: 'Q4 2026',
      leadArchitect: 'David Kim'
    }
  },
  {
    domain: 'software',
    type: 'SPRINT',
    label: 'Sprint Ágil',
    color: 'badge-type-SPRINT',
    template: {
      sprintNumber: 14,
      velocityTarget: 45,
      goal: 'Completar autenticación JWT y sincronización de árbol'
    }
  },
  {
    domain: 'software',
    type: 'STORY',
    label: 'Historia de Usuario',
    color: 'badge-type-STORY',
    template: {
      storyPoints: 5,
      assignee: 'Elena Vance',
      acceptanceCriteria: ['Validación de esquema', 'Test unitario superado'],
      priority: 'HIGH'
    }
  },
  {
    domain: 'software',
    type: 'TASK',
    label: 'Tarea Técnica',
    color: 'badge-type-TASK',
    template: {
      assignee: 'Dev Team',
      storyPoints: 3,
      progress: 50,
      tags: ['Backend', 'Node.js', 'Prisma']
    }
  },
  {
    domain: 'software',
    type: 'BUG',
    label: 'Error / Bug Report',
    color: 'badge-type-BUG',
    template: {
      severity: 'CRITICAL',
      environment: 'Production',
      stepsToReproduce: '1. Login con token expirado\n2. Clic en guardar',
      patchVersion: '1.0.2'
    }
  },
  {
    domain: 'software',
    type: 'RELEASE',
    label: 'Versión / Release',
    color: 'badge-type-RELEASE',
    template: {
      version: 'v2.0.0',
      changeLogUrl: 'https://cdn.uxcribe.com/releases/v2.0.0.md',
      dockerImage: 'uxcribe/datablock-api:2.0.0'
    }
  },

  // 🎮 2. Game Development & Design
  {
    domain: 'gamedev',
    type: 'GAME',
    label: 'Videojuego (Root)',
    color: 'badge-type-GAME',
    template: {
      title: 'Eldoria: Shadows of Eternity',
      genre: 'Action RPG / Open World',
      targetEngine: 'Unreal Engine 5.4',
      targetPlatforms: ['PC (Steam)', 'PlayStation 5', 'Xbox Series X'],
      gantt: { color: '#f472b6', criticalPath: true }
    }
  },
  {
    domain: 'gamedev',
    type: 'LEVEL',
    label: 'Nivel / Mundo / Bioma',
    color: 'badge-type-LEVEL',
    template: {
      levelIndex: 1,
      biome: 'Whispering Catacombs (Dungeon)',
      targetFPS: 60,
      lightScenario: 'Dynamic Volumetric Fog + Torches',
      worldBoundsMeters: { x: 500, y: 500, z: 80 }
    }
  },
  {
    domain: 'gamedev',
    type: 'CHARACTER',
    label: 'Personaje / NPC / Jefe',
    color: 'badge-type-CHARACTER',
    template: {
      characterClass: 'Shadow Necromancer (Boss)',
      maxHealth: 3500,
      manaPool: 1200,
      baseDamage: 110,
      hitboxScale: 1.25,
      voiceActor: 'Marcus Vance'
    }
  },
  {
    domain: 'gamedev',
    type: 'QUEST',
    label: 'Misión / Objetivo',
    color: 'badge-type-QUEST',
    template: {
      questType: 'MAIN_STORY',
      xpReward: 2500,
      goldReward: 600,
      requiredLevel: 4,
      lootTable: ['Ancient Obsidian Dagger', 'Elixir of Mana (x3)']
    }
  },
  {
    domain: 'gamedev',
    type: 'ASSET_3D',
    label: 'Modelo 3D / Mesh / Props',
    color: 'badge-type-ASSET_3D',
    template: {
      polygonCount: 28400,
      lodLevels: 4,
      textureResolution: '4K PBR',
      materials: ['Albedo', 'Normal', 'Roughness', 'Metallic', 'Emission'],
      fileUrl: 'https://cdn.uxcribe.com/3d/gargoyle_boss_v2.fbx'
    }
  },
  {
    domain: 'gamedev',
    type: 'AUDIO_VFX',
    label: 'Efecto de Audio / VFX',
    color: 'badge-type-AUDIO_VFX',
    template: {
      audioCategory: 'BOSS_BATTLE_THEME',
      sampleRate: 48000,
      spatialized3D: true,
      loopable: true,
      maxDistanceMeters: 45
    }
  },

  // 🗄️ 3. Database Architecture & Cloud Data Engineering
  {
    domain: 'database',
    type: 'DATABASE_CLUSTER',
    label: 'Cluster de Base de Datos (Root)',
    color: 'badge-type-DATABASE_CLUSTER',
    template: {
      engine: 'MySQL 8.4 Community LTS',
      topology: 'Multi-AZ Primary-Replica',
      nodeCount: 3,
      memoryGB: 64,
      storageGB: 500,
      iops: 12000,
      backupRetentionDays: 30,
      gantt: { color: '#0ea5e9', criticalPath: true }
    }
  },
  {
    domain: 'database',
    type: 'SCHEMA',
    label: 'Esquema / Base de Datos Lógica',
    color: 'badge-type-SCHEMA',
    template: {
      schemaName: 'production_block_service',
      defaultCharset: 'utf8mb4',
      defaultCollation: 'utf8mb4_unicode_ci'
    }
  },
  {
    domain: 'database',
    type: 'TABLE',
    label: 'Tabla Relacional',
    color: 'badge-type-TABLE',
    template: {
      tableName: 'blocks',
      storageEngine: 'InnoDB',
      rowFormat: 'DYNAMIC',
      estimatedRows: 500000,
      isPartitioned: false
    }
  },
  {
    domain: 'database',
    type: 'COLUMN',
    label: 'Columna / Atributo',
    color: 'badge-type-COLUMN',
    template: {
      columnName: 'payload',
      dataType: 'JSON',
      isNullable: true,
      isPrimaryKey: false,
      defaultValue: null
    }
  },
  {
    domain: 'database',
    type: 'INDEX',
    label: 'Índice de Rendimiento',
    color: 'badge-type-INDEX',
    template: {
      indexName: 'idx_blocks_parent_id',
      indexType: 'BTREE',
      indexedColumns: ['parent_id'],
      isUnique: false,
      cardinality: 85000
    }
  },
  {
    domain: 'database',
    type: 'MIGRATION',
    label: 'Script de Migración SQL',
    color: 'badge-type-MIGRATION',
    template: {
      migrationVersion: 'V2026_08_19_001',
      sqlFileName: 'add_schema_version.sql',
      checksum: 'sha256:e8b04eb...',
      executionTimeMs: 42,
      rollbackSafe: true
    }
  },

  // 🎬 4. Film Production & VFX
  {
    domain: 'film',
    type: 'FILM_PROJECT',
    label: 'Producción de Película / Corto (Root)',
    color: 'badge-type-FILM_PROJECT',
    template: {
      title: 'Neo-Genesis 2099 (Feature Film)',
      director: 'Denis Vance',
      aspectRatio: '2.39:1 (Anamorphic)',
      frameRate: 24,
      captureResolution: '8K RED RAW',
      soundFormat: 'Dolby Atmos 7.1.4'
    }
  },
  {
    domain: 'film',
    type: 'SCENE',
    label: 'Escena',
    color: 'badge-type-SCENE',
    template: {
      sceneNumber: 4,
      location: 'Neo-Tokyo Rooftop',
      timeOfDay: 'Night / Heavy Rain',
      lightingSetup: 'Dual Cyan/Magenta Cyberpunk Key + Rim'
    }
  },
  {
    domain: 'film',
    type: 'SHOT',
    label: 'Toma de Cámara',
    color: 'badge-type-SHOT',
    template: {
      shotCode: 'SC04_SH02',
      lens: '50mm Anamorphic T1.8',
      cameraMovement: 'Steadicam Orbit + Tilt Up',
      takeCount: 4,
      status: 'APPROVED_BY_DIRECTOR'
    }
  },
  {
    domain: 'film',
    type: 'RENDER_PASS',
    label: 'Pase de Render VFX',
    color: 'badge-type-CUSTOM',
    template: {
      renderEngine: 'Octane / Unreal 5.4',
      samplesPerPixel: 2048,
      layers: ['Beauty', 'Z-Depth', 'Cryptomatte', 'Ambient Occlusion', 'Emissive']
    }
  },

  // 📚 5. EdTech & Learning Management
  {
    domain: 'edtech',
    type: 'COURSE',
    label: 'Curso Educativo (Root)',
    color: 'badge-type-COURSE',
    template: {
      courseCode: 'CS-401',
      title: 'Sistemas Distribuidos y Bases de Datos Polimórficas',
      professor: 'Dr. Alan Turing',
      difficulty: 'AVANZADO',
      totalHours: 40,
      certificateEligible: true
    }
  },
  {
    domain: 'edtech',
    type: 'MODULE',
    label: 'Módulo de Aprendizaje',
    color: 'badge-type-MODULE',
    template: {
      moduleIndex: 2,
      title: 'Single Table Inheritance y Modelos JSON en MySQL',
      learningObjectives: ['Comprender relaciones recursivas', 'Optimizar consultas con índices']
    }
  },
  {
    domain: 'edtech',
    type: 'LESSON',
    label: 'Lección Interactiva',
    color: 'badge-type-LESSON',
    template: {
      lessonType: 'VIDEO_AND_PRACTICE',
      videoDurationMin: 28,
      interactiveSandboxUrl: 'https://lab.uxcribe.com/db-sti'
    }
  },
  {
    domain: 'edtech',
    type: 'QUIZ',
    label: 'Evaluación / Examen',
    color: 'badge-type-QUIZ',
    template: {
      totalQuestions: 10,
      passingScorePercent: 80,
      timeLimitMinutes: 20,
      maxAttempts: 3
    }
  }
];

// App State
const state = {
  activeTab: 'tree', // 'tree' | 'table' | 'types' | 'database'
  token: localStorage.getItem('datablock_token') || null,
  user: JSON.parse(localStorage.getItem('datablock_user') || 'null'),
  blocksTree: [],
  blocksFlat: [],
  customTypes: JSON.parse(localStorage.getItem('datablock_custom_types') || '[]'),
  collapsedNodeIds: new Set(),
  expandedPayloadIds: new Set(),
  filters: {
    search: '',
    type: '',
    status: '',
    schema_version: ''
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
    if (state.filters.type) queryParams.set('type', state.filters.type);
    if (state.filters.status) queryParams.set('status', state.filters.status);
    if (state.filters.schema_version) queryParams.set('schema_version', state.filters.schema_version);
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
          <button class="btn btn-secondary" onclick="openSampleTemplatesModal()">🌱 Cargar Plantilla de Ejemplo</button>
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

  const startDateStr = block.start_date ? new Date(block.start_date).toLocaleDateString() : '';
  const endDateStr = block.end_date ? new Date(block.end_date).toLocaleDateString() : '';
  
  let daysDuration = '';
  if (block.start_date && block.end_date) {
    const diff = Math.ceil((new Date(block.end_date) - new Date(block.start_date)) / (1000 * 60 * 60 * 24));
    daysDuration = `${diff}d`;
  }

  const badgeTypeClass = `badge-type-${block.type}` || 'badge-type-CUSTOM';
  const badgeStatusClass = `badge-status-${block.status || 'pending'}`;

  let html = `
    <div class="tree-node" data-id="${block.id}">
      <div class="tree-node-header ${isCollapsed ? '' : 'expanded'}">
        <div class="tree-node-left" onclick="toggleNode('${block.id}')">
          <button class="tree-toggle-btn ${hasChildren ? (isCollapsed ? '' : 'expanded') : 'leaf'}" type="button">
            ${hasChildren ? '▶' : '•'}
          </button>
          <span class="badge ${badgeTypeClass}">${block.type}</span>
          <span class="tree-node-title" title="${escapeHtml(block.name)}">${escapeHtml(block.name)}</span>
          <span class="badge ${badgeStatusClass}">${block.status || 'pending'}</span>
          <span class="badge-version">v${block.schema_version || 1}</span>
          <span class="date-pill">📅 ${startDateStr} - ${endDateStr} (${daysDuration})</span>
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
          <button class="btn btn-danger btn-sm" onclick="openDeleteBlockModal('${block.id}', '${escapeHtml(block.name)}')" title="Eliminar bloque y descendientes">
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
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Versión</th>
            <th>Fechas</th>
            <th>Padre</th>
            <th>Payload</th>
            <th style="text-align: right;">Acciones</th>
          </tr>
        </thead>
        <tbody>
  `;

  if (state.blocksFlat.length === 0) {
    html += `
      <tr>
        <td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">
          No se encontraron bloques con los filtros aplicados.
        </td>
      </tr>
    `;
  } else {
    state.blocksFlat.forEach(block => {
      const parentName = block.parent_id 
        ? (state.blocksFlat.find(b => b.id === block.parent_id)?.name || block.parent_id.slice(0, 8) + '...')
        : '<span style="color: var(--text-muted); font-style: italic;">Raíz (Ninguno)</span>';

      const startDateStr = block.start_date ? new Date(block.start_date).toLocaleDateString() : '-';
      const endDateStr = block.end_date ? new Date(block.end_date).toLocaleDateString() : '-';
      const badgeTypeClass = `badge-type-${block.type}` || 'badge-type-CUSTOM';
      const badgeStatusClass = `badge-status-${block.status || 'pending'}`;

      html += `
        <tr>
          <td><strong>${escapeHtml(block.name)}</strong></td>
          <td><span class="badge ${badgeTypeClass}">${block.type}</span></td>
          <td><span class="badge ${badgeStatusClass}">${block.status}</span></td>
          <td><span class="badge-version">v${block.schema_version || 1}</span></td>
          <td><small>${startDateStr} ➜ ${endDateStr}</small></td>
          <td><small>${parentName}</small></td>
          <td>
            ${block.payload ? `<small title="${escapeHtml(JSON.stringify(block.payload))}">${Object.keys(block.payload).length} campos</small>` : '-'}
          </td>
          <td style="text-align: right;">
            <button class="btn btn-secondary btn-sm" onclick="openCreateBlockModal('${block.id}')" title="Agregar Hijo">➕</button>
            <button class="btn btn-secondary btn-sm" onclick="openEditBlockModal('${block.id}')" title="Editar">✏️</button>
            <button class="btn btn-danger btn-sm" onclick="openDeleteBlockModal('${block.id}', '${escapeHtml(block.name)}')" title="Eliminar">🗑️</button>
          </td>
        </tr>
      `;
    });
  }

  html += '</tbody></table></div>';
  container.innerHTML = html;
}

// ==========================================
// Types & Templates Manager Renderer
// ==========================================
function getAllTypes() {
  return [...DEFAULT_TYPES, ...state.customTypes];
}

function renderTypesView() {
  const container = document.getElementById('typesViewContainer');
  if (!container) return;

  const allTypes = getAllTypes();

  let html = `
    <div class="action-bar" style="margin-bottom: 1rem;">
      <div>
        <h2>🎨 Catálogo de Tipos Polimórficos y Plantillas</h2>
        <p>Los bloques comparten una única tabla pero se adaptan a cualquier dominio con metadatos JSON especializados.</p>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <button class="btn btn-secondary" onclick="openSampleTemplatesModal()">🌱 Cargar Árbol de Ejemplo</button>
        <button class="btn btn-primary" onclick="openCreateTypeModal()">+ Crear Nuevo Tipo</button>
      </div>
    </div>
    <div class="types-grid">
  `;

  allTypes.forEach(t => {
    const isCustom = state.customTypes.some(ct => ct.type === t.type);
    html += `
      <div class="type-card">
        <div class="type-card-header">
          <span class="badge ${t.color || 'badge-type-CUSTOM'}">${t.type}</span>
          ${isCustom ? `
            <button class="btn btn-danger btn-sm" onclick="deleteCustomType('${t.type}')" title="Eliminar tipo personalizado">🗑️</button>
          ` : '<span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">' + (t.domain || 'Estándar') + '</span>'}
        </div>
        <div><strong>${escapeHtml(t.label || t.type)}</strong></div>
        <div class="type-card-template">
          <pre><code>${escapeHtml(JSON.stringify(t.template || {}, null, 2))}</code></pre>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="openCreateBlockWithType('${t.type}')">
          + Crear bloque tipo ${t.type}
        </button>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
}

function deleteCustomType(typeName) {
  state.customTypes = state.customTypes.filter(t => t.type !== typeName);
  localStorage.setItem('datablock_custom_types', JSON.stringify(state.customTypes));
  populateTypeSelects();
  renderTypesView();
  showToast(`Tipo "${typeName}" eliminado`);
}

// ==========================================
// 1-Click Sample Domain Tree Seeders
// ==========================================
const DOMAIN_SAMPLES = {
  gamedev: {
    name: '🎮 Videojuego: Eldoria (Game Design)',
    description: 'Árbol completo de diseño de videojuego: Título -> Niveles/Biomas -> Jefes/NPCs, Misiones con loot y Modelos 3D PBR.',
    create: async () => {
      const now = new Date();
      const addDays = (d, days) => new Date(d.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

      const root = await apiRequest('/api/blocks', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Eldoria: Shadows of Eternity',
          type: 'GAME',
          status: 'in_progress',
          schema_version: 1,
          start_date: now.toISOString(),
          end_date: addDays(now, 180),
          payload: {
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
          name: 'Act I: Whispering Catacombs',
          type: 'LEVEL',
          status: 'in_progress',
          schema_version: 1,
          start_date: now.toISOString(),
          end_date: addDays(now, 45),
          payload: {
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
          name: 'Shadow Necromancer (Dungeon Boss)',
          type: 'CHARACTER',
          status: 'in_progress',
          schema_version: 2,
          start_date: addDays(now, 5),
          end_date: addDays(now, 25),
          payload: {
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
          name: 'Quest: Purify the Sacred Altar',
          type: 'QUEST',
          status: 'completed',
          schema_version: 1,
          start_date: addDays(now, 2),
          end_date: addDays(now, 15),
          payload: {
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
          name: 'Gargoyle Boss 3D Mesh & Textures',
          type: 'ASSET_3D',
          status: 'completed',
          schema_version: 1,
          start_date: now.toISOString(),
          end_date: addDays(now, 10),
          payload: {
            polygonCount: 32500,
            lodLevels: 4,
            textureResolution: '4K PBR',
            fileUrl: 'https://cdn.uxcribe.com/3d/gargoyle_boss.fbx'
          }
        })
      });

      await apiRequest('/api/blocks', {
        method: 'POST',
        body: JSON.stringify({
          parent_id: gameId,
          name: 'Act II: Sunken Citadel of Titans',
          type: 'LEVEL',
          status: 'pending',
          schema_version: 1,
          start_date: addDays(now, 46),
          end_date: addDays(now, 100),
          payload: {
            levelIndex: 2,
            biome: 'Underwater Submerged City',
            targetFPS: 60,
            waterPhysicsEnabled: true
          }
        })
      });
    }
  },

  database: {
    name: '🗄️ Arquitectura Cloud: Aurora MySQL Cluster',
    description: 'Modelado de infraestructura y esquema de base de datos: Cluster -> Esquema -> Tablas -> Columnas, Índices y Migraciones.',
    create: async () => {
      const now = new Date();
      const addDays = (d, days) => new Date(d.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

      const root = await apiRequest('/api/blocks', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Aurora-Prod-Primary-Cluster',
          type: 'DATABASE_CLUSTER',
          status: 'in_progress',
          schema_version: 1,
          start_date: now.toISOString(),
          end_date: addDays(now, 365),
          payload: {
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
          name: 'block_system_production',
          type: 'SCHEMA',
          status: 'completed',
          schema_version: 1,
          start_date: now.toISOString(),
          end_date: addDays(now, 30),
          payload: {
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
          name: 'table: blocks (STI Polymorphic)',
          type: 'TABLE',
          status: 'completed',
          schema_version: 1,
          start_date: now.toISOString(),
          end_date: addDays(now, 15),
          payload: {
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
          name: 'column: payload (JSON dynamic metadata)',
          type: 'COLUMN',
          status: 'completed',
          schema_version: 1,
          start_date: now.toISOString(),
          end_date: addDays(now, 10),
          payload: {
            dataType: 'JSON',
            isNullable: true,
            maxSizeBytes: 10485760,
            virtualGeneratedColumns: ['gantt_color', 'assignee_email']
          }
        })
      });

      await apiRequest('/api/blocks', {
        method: 'POST',
        body: JSON.stringify({
          parent_id: tableBlocksId,
          name: 'index: idx_blocks_parent_id_type',
          type: 'INDEX',
          status: 'completed',
          schema_version: 1,
          start_date: now.toISOString(),
          end_date: addDays(now, 12),
          payload: {
            indexType: 'BTREE',
            indexedColumns: ['parent_id', 'type'],
            isUnique: false,
            cardinality: 120000
          }
        })
      });

      await apiRequest('/api/blocks', {
        method: 'POST',
        body: JSON.stringify({
          parent_id: schemaId,
          name: 'migration: V2026_08_19__Add_Schema_Version.sql',
          type: 'MIGRATION',
          status: 'completed',
          schema_version: 1,
          start_date: now.toISOString(),
          end_date: addDays(now, 5),
          payload: {
            sqlChecksum: 'sha256:45d8335...',
            executionTimeMs: 38,
            rollbackSafe: true
          }
        })
      });
    }
  },

  film: {
    name: '🎬 Producción de Cine: Neo-Genesis 2099',
    description: 'Producción audiovisual y VFX: Proyecto de Película -> Escenas -> Tomas de cámara y Pases de renderizado 8K.',
    create: async () => {
      const now = new Date();
      const addDays = (d, days) => new Date(d.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

      const root = await apiRequest('/api/blocks', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Neo-Genesis 2099 (Feature Film)',
          type: 'FILM_PROJECT',
          status: 'in_progress',
          schema_version: 1,
          start_date: now.toISOString(),
          end_date: addDays(now, 120),
          payload: {
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
          name: 'Scene 12: The Cyber-Alley Ambush',
          type: 'SCENE',
          status: 'in_progress',
          schema_version: 1,
          start_date: now.toISOString(),
          end_date: addDays(now, 20),
          payload: {
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
          name: 'Shot 12A: Close-Up Cybernetic Eye',
          type: 'SHOT',
          status: 'completed',
          schema_version: 1,
          start_date: now.toISOString(),
          end_date: addDays(now, 5),
          payload: {
            shotCode: 'SC12_SH01',
            lens: '85mm Anamorphic T1.8',
            cameraRig: 'Technocrane + Freefly Movi',
            approvedTakes: [3, 7]
          }
        })
      });

      await apiRequest('/api/blocks', {
        method: 'POST',
        body: JSON.stringify({
          parent_id: sceneId,
          name: 'Volumetric Rain & Hologram VFX Pass',
          type: 'RENDER_PASS',
          status: 'in_progress',
          schema_version: 1,
          start_date: addDays(now, 6),
          end_date: addDays(now, 18),
          payload: {
            renderEngine: 'Unreal Engine 5.4 / Octane',
            samplesPerPixel: 2048,
            denoiser: 'NVIDIA OptiX',
            frameRange: '001 - 340'
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

  // Render Active Subtab Content
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

  // Render Table Data or Schema
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
      <span>Mostrando ${d.rowsCount} de ${d.pagination.totalRows} registros (Página ${d.pagination.page} de ${d.pagination.totalPages}) • Consulta ejecutada en ${d.executionTimeMs}ms</span>
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
          <button class="sql-snippet-btn" onclick="setSqlQuery('SELECT type, COUNT(*) as total FROM blocks GROUP BY type;')">COUNT by type</button>
          <button class="sql-snippet-btn" onclick="setSqlQuery('SHOW TABLE STATUS;')">SHOW TABLE STATUS</button>
          <button class="sql-snippet-btn" onclick="setSqlQuery('SELECT * FROM users;')">SELECT users</button>
          <button class="sql-snippet-btn" onclick="setSqlQuery('EXPLAIN SELECT * FROM blocks WHERE type = \\'PROJECT\\';')">EXPLAIN index</button>
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

  // Query Results Grid
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
      opt.textContent = `${prefix}[${node.type}] ${node.name}`;
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
  const allTypes = getAllTypes();

  if (typeSelect) {
    const currentVal = typeSelect.value;
    typeSelect.innerHTML = '';
    
    // Group by Domain
    const domains = {
      software: '🚀 Software & Proyectos Ágiles',
      gamedev: '🎮 Desarrollo de Videojuegos',
      database: '🗄️ Arquitectura Cloud & DB',
      film: '🎬 Cine & Producción VFX',
      edtech: '📚 Educación & LMS',
      custom: '✨ Personalizados'
    };

    Object.keys(domains).forEach(domKey => {
      const matchingTypes = allTypes.filter(t => (t.domain || (state.customTypes.some(ct => ct.type === t.type) ? 'custom' : 'software')) === domKey);
      if (matchingTypes.length > 0) {
        const group = document.createElement('optgroup');
        group.label = domains[domKey];
        matchingTypes.forEach(t => {
          const opt = document.createElement('option');
          opt.value = t.type;
          opt.textContent = `${t.type} - ${t.label || ''}`;
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
    allTypes.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.type;
      opt.textContent = t.type;
      filterTypeSelect.appendChild(opt);
    });
    if (currentFilter) filterTypeSelect.value = currentFilter;
  }
}

function handleTypeChange() {
  const typeSelect = document.getElementById('blockType');
  const payloadInput = document.getElementById('blockPayload');
  const selectedType = typeSelect.value;
  const match = getAllTypes().find(t => t.type === selectedType);

  if (match && match.template && payloadInput && (!payloadInput.value.trim() || payloadInput.value.trim() === '{}')) {
    payloadInput.value = JSON.stringify(match.template, null, 2);
  }
}

function openCreateBlockModal(parentId = null) {
  const dialog = document.getElementById('blockModal');
  const form = document.getElementById('blockForm');
  const title = document.getElementById('blockModalTitle');
  const blockIdInput = document.getElementById('blockId');
  const payloadInput = document.getElementById('blockPayload');

  form.reset();
  blockIdInput.value = '';
  title.textContent = parentId ? '➕ Crear Nuevo Bloque Hijo' : '➕ Crear Nuevo Bloque Raíz';

  // Dates defaults: today and today + 14 days
  const now = new Date();
  const future = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  document.getElementById('blockStartDate').value = now.toISOString().slice(0, 10);
  document.getElementById('blockEndDate').value = future.toISOString().slice(0, 10);
  document.getElementById('blockSchemaVersion').value = 1;
  document.getElementById('blockStatus').value = 'pending';

  populateTypeSelects();
  populateParentSelect(parentId, null);

  // Set default payload template
  handleTypeChange();

  dialog.showModal();
}

function openCreateBlockWithType(typeName) {
  openCreateBlockModal(null);
  const typeSelect = document.getElementById('blockType');
  if (typeSelect) {
    typeSelect.value = typeName;
    handleTypeChange();
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

    document.getElementById('blockName').value = block.name || '';
    document.getElementById('blockStatus').value = block.status || 'pending';
    document.getElementById('blockSchemaVersion').value = block.schema_version || 1;
    
    if (block.start_date) {
      document.getElementById('blockStartDate').value = new Date(block.start_date).toISOString().slice(0, 10);
    }
    if (block.end_date) {
      document.getElementById('blockEndDate').value = new Date(block.end_date).toISOString().slice(0, 10);
    }

    populateTypeSelects();
    document.getElementById('blockType').value = block.type || 'TASK';

    populateParentSelect(block.parent_id, block.id);

    const payloadInput = document.getElementById('blockPayload');
    payloadInput.value = block.payload ? JSON.stringify(block.payload, null, 2) : '{}';

    dialog.showModal();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleBlockFormSubmit(e) {
  e.preventDefault();

  const blockId = document.getElementById('blockId').value;
  const parentIdVal = document.getElementById('blockParentId').value;
  const name = document.getElementById('blockName').value.trim();
  const type = document.getElementById('blockType').value;
  const status = document.getElementById('blockStatus').value;
  const schema_version = parseInt(document.getElementById('blockSchemaVersion').value, 10) || 1;
  const startDateStr = document.getElementById('blockStartDate').value;
  const endDateStr = document.getElementById('blockEndDate').value;
  const payloadStr = document.getElementById('blockPayload').value.trim();

  let payload = null;
  if (payloadStr) {
    try {
      payload = JSON.parse(payloadStr);
    } catch (parseErr) {
      showToast('Error de sintaxis en el JSON Payload: ' + parseErr.message, 'error');
      return;
    }
  }

  const payloadBody = {
    name,
    type,
    status,
    schema_version,
    start_date: new Date(startDateStr).toISOString(),
    end_date: new Date(endDateStr).toISOString(),
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

// Custom Type Modal
function openCreateTypeModal() {
  const dialog = document.getElementById('createTypeModal');
  const form = document.getElementById('createTypeForm');
  form.reset();
  document.getElementById('newTypeTemplate').value = JSON.stringify({ customField: 'valor', priority: 'HIGH' }, null, 2);
  dialog.showModal();
}

function handleCreateTypeSubmit(e) {
  e.preventDefault();
  const typeName = document.getElementById('newTypeName').value.trim().toUpperCase();
  const label = document.getElementById('newTypeLabel').value.trim() || typeName;
  const templateStr = document.getElementById('newTypeTemplate').value.trim();

  if (!typeName) return;

  let template = {};
  if (templateStr) {
    try {
      template = JSON.parse(templateStr);
    } catch {
      showToast('Error en el JSON de la plantilla', 'error');
      return;
    }
  }

  const exists = getAllTypes().some(t => t.type === typeName);
  if (exists) {
    showToast(`El tipo "${typeName}" ya existe`, 'error');
    return;
  }

  state.customTypes.push({
    domain: 'custom',
    type: typeName,
    label,
    color: 'badge-type-CUSTOM',
    template
  });

  localStorage.setItem('datablock_custom_types', JSON.stringify(state.customTypes));
  document.getElementById('createTypeModal').close();
  populateTypeSelects();
  renderTypesView();
  showToast(`Tipo "${typeName}" agregado exitosamente`, 'success');
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
  const filterStatus = document.getElementById('filterStatus');
  const filterVersion = document.getElementById('filterVersion');

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
      state.filters.type = e.target.value;
      loadData();
    });
  }

  if (filterStatus) {
    filterStatus.addEventListener('change', (e) => {
      state.filters.status = e.target.value;
      loadData();
    });
  }

  if (filterVersion) {
    filterVersion.addEventListener('change', (e) => {
      state.filters.schema_version = e.target.value;
      loadData();
    });
  }

  // Type change listener
  const blockTypeSelect = document.getElementById('blockType');
  if (blockTypeSelect) {
    blockTypeSelect.addEventListener('change', handleTypeChange);
  }

  // Form Submissions
  document.getElementById('blockForm')?.addEventListener('submit', handleBlockFormSubmit);
  document.getElementById('loginForm')?.addEventListener('submit', handleLoginSubmit);
  document.getElementById('createTypeForm')?.addEventListener('submit', handleCreateTypeSubmit);

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
  populateTypeSelects();

  // Try auto-login with session or seed admin
  await tryAutoLogin();
  await loadData();
});
