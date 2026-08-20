/**
 * DataBlock Studio - Single Page Application Client
 * Full CRUD, Hierarchical Tree, Relational Parent Editor, Polymorphic Domain Types & Sample Seeders
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
  activeTab: 'tree', // 'tree' | 'table' | 'types'
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

  // Update tabs active class
  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === state.activeTab);
  });

  if (treeView) treeView.style.display = state.activeTab === 'tree' ? 'block' : 'none';
  if (tableView) tableView.style.display = state.activeTab === 'table' ? 'block' : 'none';
  if (typesView) typesView.style.display = state.activeTab === 'types' ? 'block' : 'none';

  if (!state.token) {
    renderUnauthenticated();
    return;
  }

  if (state.activeTab === 'tree') renderTreeView();
  if (state.activeTab === 'table') renderTableView();
  if (state.activeTab === 'types') renderTypesView();
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
  
  // Calculate days duration
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

  // Payload Drawer
  if (block.payload && isPayloadExpanded) {
    html += `
      <div class="payload-preview">
        <pre><code>${escapeHtml(JSON.stringify(block.payload, null, 2))}</code></pre>
      </div>
    `;
  }

  // Children
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

      // 1. Root Game
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

      // 2. Level 1 (Act I)
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

      // 2.1 Boss under Level 1
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

      // 2.2 Quest under Level 1
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

      // 2.3 3D Asset under Level 1
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

      // 3. Level 2 (Act II)
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

      // 1. Root Cluster
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

      // 2. Schema
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

      // 2.1 Table 'blocks'
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

      // 2.1.1 Column 'payload'
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

      // 2.1.2 Index
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

      // 2.2 Migration
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
