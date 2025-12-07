// ==========================================
// 🚀 GESTIÓN DE PEDIDOS - BACKEND (caché + export + auditoría)
// Versión 1.4
// ==========================================
// Desarrollado por Juan Carlos Suárez
// Aplicación web construida con Google Apps Script para la gestión integral de proveedores, empresas y pedidos. Licencia: Creative Commons Reconocimiento (CC BY) creativecommons.org

// Puedes usar, copiar, modificar y distribuir este código (sin fines comerciales), siempre que cites a Juan Carlos Suárez como autor original./*
// ==========================================

// ===== Helpers de URL / navegación =====

/** URL del deployment vigente de la App Web (o null si no hay). */
function getAppUrl_() {
  try {
    var url = ScriptApp.getService().getUrl();
    return url || null;
  } catch (e) {
    return null;
  }
}

/** Elige la mejor página de lista disponible: 'orders' | 'orders_list' | 'dashboard'. */
function getPreferredOrdersPage() {
  var candidates = ['orders_list', 'orders'];
  for (var i = 0; i < candidates.length; i++) {
    try {
      HtmlService.createHtmlOutputFromFile(candidates[i]); // prueba existencia de archivo
      return candidates[i];
    } catch (e) { /* sigue */ }
  }
  return 'dashboard';
}

/** Construye una URL absoluta y segura hacia page (en el deployment activo). */
function getAppPageUrl(page) {
  var url = getAppUrl_();
  if (!url) return ''; // el cliente avisará si viene vacío
  return url + (url.indexOf('?') >= 0 ? '&' : '?') + 'page=' + encodeURIComponent(page || 'dashboard');
}

/** Devuelve la URL absoluta a la lista de pedidos (orders u orders_list). */
function getOrdersListUrl() {
  var page = getPreferredOrdersPage();
  return getAppPageUrl(page);
}

// ===== Menú =====
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🚀 Gestión Pedidos')
    .addItem('📦 Abrir App Principal', 'openWebApp')
    .addSeparator()
    .addItem('📒 Agenda de Proveedores', 'openSuppliersList')
    .addToUi();
}

/** Abrir portada (dashboard) — sin URL manual. */
function openWebApp() {
  var url = getAppPageUrl('dashboard');
  if (!url) {
    SpreadsheetApp.getUi().alert(
      'Este proyecto aún no está desplegado como Aplicación Web.\n\n' +
      'Ve a Publicar → Implementar como aplicación web → Guardar y desplegar.\n' +
      'Luego vuelve a ejecutar esta opción del menú.'
    );
    return;
  }
  var html = HtmlService.createHtmlOutput(
    '<script>window.top.location.href = ' + JSON.stringify(url) + ';</script>'
  ).setWidth(120).setHeight(30);
  SpreadsheetApp.getUi().showModalDialog(html, 'Abriendo App...');
}

/** Abrir agenda de proveedores — sin URL manual. */
function openSuppliersList() {
  var url = getAppPageUrl('suppliers');
  if (!url) {
    SpreadsheetApp.getUi().alert(
      'Este proyecto aún no está desplegado como Aplicación Web.\n\n' +
      'Ve a Publicar → Implementar como aplicación web → Guardar y desplegar.'
    );
    return;
  }
  var html = HtmlService.createHtmlOutput(
    '<script>window.top.location.href = ' + JSON.stringify(url) + ';</script>'
  ).setWidth(120).setHeight(30);
  SpreadsheetApp.getUi().showModalDialog(html, 'Abriendo Agenda...');
}

// ===== Enrutamiento Web (doGet) =====
function doGet(e) {
  var page = (e && e.parameter && e.parameter.page) || 'dashboard';
  var title = 'Panel de Control';
  var filename = page;

  if (page === 'suppliers')     title = 'Gestión de Proveedores';
  else if (page === 'orders')   title = 'Gestión de Pedidos';
  else if (page === 'orders_list') { title = 'Listado de Pedidos'; filename = 'orders_list'; }
  else if (page === 'auxiliary')    { title = 'Configuración';      filename = 'auxiliary_management'; }
  else if (page === 'authorizations') { title = 'Autorizaciones';   filename = 'authorizations'; }

  try {
    var template = HtmlService.createTemplateFromFile(filename);
    template.data       = e ? (e.parameter || {}) : {};
    template.appUrl     = getAppUrl_();             // URL del deployment activo (o null si no hay)
    template.ordersPage = getPreferredOrdersPage(); // 'orders' | 'orders_list' | 'dashboard'
    return template.evaluate()
      .setTitle(title)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  } catch (err) {
    return HtmlService.createHtmlOutput(
      '<h3>Error 404</h3><p>Página no encontrada: ' + filename + '</p>'
    );
  }
}

function include(filename) {
  try {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
  } catch (e) {
    return '';
  }
}

// ===== Configuración BBDD =====
const SHEETS = {
  PROVEEDORES:   'Proveedores',
  EMPRESAS:      'Empresas',
  TIPOS:         'Tipos',
  PEDIDOS:       'Pedidos',
  COMPRADORES:   'Compradores',
  MEDIOS_PEDIDO: 'MediosPedido',
  ZONAS:         'Zonas',
  EDIFICIOS:     'Edificios',
  SOLICITANTES:  'Solicitantes'
};

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  return sheet;
}

function getHeaders(sheetName) {
  switch (sheetName) {
    case SHEETS.PROVEEDORES:   return ['Id_Proveedor', 'Nombre', 'Apellidos', 'Teléfono', 'Empresa', 'Email', 'Estado', 'Notas'];
    case SHEETS.EMPRESAS:      return ['Id_Empresa', 'Nombre Empresa', 'CIF', 'Dirección', 'CP', 'Población', 'Provincia', 'Teléfono', 'Email', 'Tipo Proveedor', 'Notas'];
    case SHEETS.TIPOS:         return ['Id_Tipo', 'Tipo de Proveedor'];
    case SHEETS.PEDIDOS:       return [
      'Id_Pedido','Proveedor','Descripción','Fecha Pedido','Fecha Estimada','Fecha Llegada','Comprador','Servido','GDC_PINV','Autorizado',
      'Medio Pedido','Zona','Edificio','Solicitante','SC','OC','Albarán','Factura','Presupuesto','Notas','Importe','Adjuntos'
    ];
    case SHEETS.COMPRADORES:   return ['Id_Comprador', 'Nombre Comprador'];
    case SHEETS.MEDIOS_PEDIDO: return ['Id_Medio', 'Medio de Pedido'];
    case SHEETS.ZONAS:         return ['Id_Zona', 'Nombre Zona'];
    case SHEETS.EDIFICIOS:     return ['Id_Edificio', 'Nombre Edificio'];
    case SHEETS.SOLICITANTES:  return ['Id_Solicitante', 'Nombre Solicitante'];
    default: return [];
  }
}

function sanitizeValue(value) {
  if (value instanceof Date) return value.toISOString();
  if (value === null || value === undefined) return '';
  return value;
}

// ===== getData base =====
function getData(sheetName, maxRows = 0) {
  try {
    const sheet = getSheet(sheetName);
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return [];
    const lastCol = sheet.getLastColumn();
    if (lastCol === 0) return [];

    let startRow = 2;
    let numRows = lastRow - 1;
    if (maxRows > 0 && numRows > maxRows) {
      startRow = lastRow - maxRows + 1;
      numRows = maxRows;
    }
    const range   = sheet.getRange(startRow, 1, numRows, lastCol);
    const data    = range.getValues();
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

    return data.map(row => {
      let obj = {};
      headers.forEach((h, i) => obj[h] = sanitizeValue(row[i]));
      return obj;
    });
  } catch (e) {
    console.error('Error en getData(' + sheetName + '): ' + e);
    return [];
  }
}

// ===== Datos auxiliares (si los usas) =====
function getAllData() {
  try {
    return {
      suppliers: getData(SHEETS.PROVEEDORES, 0),
      companies: getData(SHEETS.EMPRESAS, 0),
      types:     getData(SHEETS.TIPOS, 0)
    };
  } catch (e) {
    console.error('Error en getAllData: ' + e);
    return { suppliers: [], companies: [], types: [] };
  }
}

function getSuppliersByCompany(companyId) {
  try {
    const allSuppliers = getData(SHEETS.PROVEEDORES, 0);
    return allSuppliers.filter(s => s.Empresa == companyId);
  } catch (e) {
    console.error('Error en getSuppliersByCompany: ' + e);
    return [];
  }
}

function lookupPostalCode(cp) {
  try { return []; } catch (e) { console.error('Error en lookupPostalCode: ' + e); return []; }
}

function getDropdownData() {
  try {
    return {
      empresas:     getData(SHEETS.EMPRESAS, 0).map(e => ({ id: e['Id_Empresa'], name: e['Nombre Empresa'] })),
      tipos:        getData(SHEETS.TIPOS, 0).map(t => ({ id: t['Id_Tipo'], name: t['Tipo de Proveedor'] })),
      compradores:  getData(SHEETS.COMPRADORES, 0).map(c => ({ id: c['Id_Comprador'], name: c['Nombre Comprador'] })),
      medios:       getData(SHEETS.MEDIOS_PEDIDO, 0).map(m => ({ id: m['Id_Medio'], name: m['Medio de Pedido'] })),
      zonas:        getData(SHEETS.ZONAS, 0).map(z => ({ id: z['Id_Zona'], name: z['Nombre Zona'] })),
      edificios:    getData(SHEETS.EDIFICIOS, 0).map(e => ({ id: e['Id_Edificio'], name: e['Nombre Edificio'] })),
      solicitantes: getData(SHEETS.SOLICITANTES, 0).map(s => ({ id: s['Id_Solicitante'], name: s['Nombre Solicitante'] }))
    };
  } catch (e) {
    console.error('Error en getDropdownData: ' + e);
    return { empresas: [], tipos: [], compradores: [], medios: [], zonas: [], edificios: [], solicitantes: [] };
  }
}

// ==========================================
// 🔗 Link helpers y caché (para búsqueda/export)
// ==========================================
const LINKED_COLUMNS     = ['GDC_PINV', 'SC', 'OC', 'Albarán', 'Factura', 'Presupuesto'];
const CACHE_TTL_SECONDS  = 300; // 5 minutos

function getFirstLinkFromRichText(rt) {
  if (!rt) return null;
  try {
    const urlWhole = rt.getLinkUrl && rt.getLinkUrl();
    if (urlWhole) return urlWhole;
    if (rt.getRuns) {
      const runs = rt.getRuns();
      if (runs && runs.length) {
        for (var i = 0; i < runs.length; i++) {
          var u = runs[i].getTextStyle().getLinkUrl();
          if (u) return u;
        }
      }
    }
  } catch (e) {}
  return null;
}

function buildCacheKey(filters, page, pageSize) {
  try {
    const f = JSON.stringify(filters || {});
    return `orders:${page}:${pageSize}:${f}`;
  } catch (e) {
    return `orders:${page}:${pageSize}`;
  }
}

// ==========================================
// 🔎 BÚSQUEDA con caché y enlaces por página (orders_list.html)
// ==========================================
function searchOrders(filters, page, pageSize) {
  page     = page     || 1;
  pageSize = pageSize || 50;
  pageSize = Math.min(Number(pageSize) || 20, 20); // tope 20 en servidor

  const cache = CacheService.getScriptCache();
  const cacheKey = buildCacheKey(filters, page, pageSize);
  const cached = cache.get(cacheKey);
  if (cached) {
    try { return JSON.parse(cached); } catch (e) {}
  }

  try {
    const sheet   = getSheet(SHEETS.PEDIDOS);
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow < 2) {
      const res = { orders: [], pagination: { total: 0, page: 1, totalPages: 0, pageSize } };
      cache.put(cacheKey, JSON.stringify(res), CACHE_TTL_SECONDS);
      return res;
    }

    const headers  = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const numRows  = lastRow - 1;
    const range    = sheet.getRange(2, 1, numRows, lastCol);
    const values   = range.getValues();
    const formulas = range.getFormulas();

    // Construcción base (+ enlaces detectados por fórmula HYPERLINK)
    let allOrders = values.map((row, r) => {
      const obj = { _rowIndex: r + 2 };
      for (var c = 0; c < headers.length; c++) {
        const h = headers[c];
        obj[h] = sanitizeValue(row[c]);
        const f = formulas[r][c];
        if (f && /HYPERLINK/i.test(f)) {
          const m = String(f).match(/HYPERLINK\s*\(\s*"([^"]+)"\s*[,;]\s*"/i);
          if (m) obj['Enlace_' + h] = m[1];
        }
      }
      return obj;
    });

    // Filtros (como en tu versión)
    const term        = (filters.search      || '').toLowerCase().trim();
    const supplier    = (filters.supplier    || '').toLowerCase().trim();
    const servido     = (filters.servido     || '').toLowerCase().trim();
    const autorizado  = (filters.autorizado  || '').toLowerCase().trim();
    const solicitante = (filters.solicitante || '').toLowerCase().trim();
    const comprador   = (filters.comprador   || '').toLowerCase().trim();

    const filtered = allOrders.filter(order => {
      if (term) {
        const matchesTerm = Object.values(order).some(val => String(val).toLowerCase().includes(term));
        if (!matchesTerm) return false;
      }
      if (supplier    && String(order['Proveedor']   || '').toLowerCase() !== supplier)    return false;
      if (servido     && String(order['Servido']     || '').toLowerCase() !== servido)     return false;
      if (autorizado  && String(order['Autorizado']  || '').toLowerCase() !== autorizado)  return false;
      if (solicitante && String(order['Solicitante'] || '').toLowerCase() !== solicitante) return false;
      if (comprador   && String(order['Comprador']   || '').toLowerCase() !== comprador)   return false;
      return true;
    });

    // Orden por fecha (desc)
    filtered.sort((a, b) => new Date(b['Fecha Pedido'] || 0) - new Date(a['Fecha Pedido'] || 0));

    // Paginación
    const total       = filtered.length;
    const totalPages  = Math.max(1, Math.ceil(total / pageSize));
    const start       = (page - 1) * pageSize;
    const end         = start + pageSize;
    const pagedOrders = filtered.slice(start, end);

    // Completar enlaces RichText SOLO para la página actual
    LINKED_COLUMNS.forEach(colName => {
      const colIndex = headers.indexOf(colName);
      if (colIndex === -1) return;
      const cells = [];
      const a1ToOrder = {};
      for (var i = 0; i < pagedOrders.length; i++) {
        var o = pagedOrders[i];
        if (!o['Enlace_' + colName]) {
          const rg = sheet.getRange(o['_rowIndex'], colIndex + 1);
          const a1 = rg.getA1Notation();
          cells.push(a1);
          a1ToOrder[a1] = o;
        }
      }
      if (cells.length) {
        const ranges = sheet.getRangeList(cells).getRanges();
        for (var k = 0; k < ranges.length; k++) {
          var r = ranges[k];
          var a1 = r.getA1Notation();
          var rt = null;
          try { rt = r.getRichTextValue(); } catch (e) {}
          var url = getFirstLinkFromRichText(rt);
          if (url) a1ToOrder[a1]['Enlace_' + colName] = url;
        }
      }
    });

    const res = { orders: pagedOrders, pagination: { total, page, totalPages, pageSize } };
    CacheService.getScriptCache().put(cacheKey, JSON.stringify(res), CACHE_TTL_SECONDS);
    return res;

  } catch (e) {
    console.error('Error searching orders: ' + e);
    const res = { orders: [], pagination: { total: 0, page: 1, totalPages: 0, pageSize: pageSize || 20 } };
    CacheService.getScriptCache().put(buildCacheKey(filters, page, pageSize), JSON.stringify(res), CACHE_TTL_SECONDS);
    return res;
  }
}

// ==========================================
// ✅ Exportaciones (CSV + Sheet)
// ==========================================
function exportOrdersCSV(filters, scope) {
  scope = (scope || 'visible').toLowerCase(); // 'visible' | 'all'
  try {
    const sheet   = getSheet(SHEETS.PEDIDOS);
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow < 2) throw new Error('No hay datos');

    const headers  = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const data     = sheet.getRange(2, 1, lastRow - 1, lastCol);
    const values   = data.getValues();
    const formulas = data.getFormulas();

    // Construcción + enlaces por fórmula
    let allOrders = values.map((row, r) => {
      const obj = { _rowIndex: r + 2 };
      for (var c = 0; c < headers.length; c++) {
        const h = headers[c];
        obj[h] = sanitizeValue(row[c]);
        const f = formulas[r][c];
        if (f && /HYPERLINK/i.test(f)) {
          const m = String(f).match(/HYPERLINK\s*\(\s*"([^"]+)"\s*[,;]\s*"/i);
          if (m) obj['Enlace_' + h] = m[1];
        }
      }
      return obj;
    });

    // Filtros (igual que searchOrders)
    const term        = (filters.search      || '').toLowerCase().trim();
    const supplier    = (filters.supplier    || '').toLowerCase().trim();
    const servido     = (filters.servido     || '').toLowerCase().trim();
    const autorizado  = (filters.autorizado  || '').toLowerCase().trim();
    const solicitante = (filters.solicitante || '').toLowerCase().trim();
    const comprador   = (filters.comprador   || '').toLowerCase().trim();

    const filtered = allOrders.filter(order => {
      if (term) {
        const matchesTerm = Object.values(order).some(val => String(val).toLowerCase().includes(term));
        if (!matchesTerm) return false;
      }
      if (supplier    && String(order['Proveedor']   || '').toLowerCase() !== supplier)    return false;
      if (servido     && String(order['Servido']     || '').toLowerCase() !== servido)     return false;
      if (autorizado  && String(order['Autorizado']  || '').toLowerCase() !== autorizado)  return false;
      if (solicitante && String(order['Solicitante'] || '').toLowerCase() !== solicitante) return false;
      if (comprador   && String(order['Comprador']   || '').toLowerCase() !== comprador)   return false;
      return true;
    });

    // Orden por fecha desc
    filtered.sort((a, b) => new Date(b['Fecha Pedido'] || 0) - new Date(a['Fecha Pedido'] || 0));

    // Completar enlaces RichText para columnas LINKED_COLUMNS en toda la selección filtrada
    LINKED_COLUMNS.forEach(colName => {
      const colIndex = headers.indexOf(colName);
      if (colIndex === -1) return;
      const rtCol = sheet.getRange(2, colIndex + 1, lastRow - 1, 1).getRichTextValues();
      filtered.forEach(o => {
        if (!o['Enlace_' + colName]) {
          const rt  = rtCol[o['_rowIndex'] - 2][0];
          const url = getFirstLinkFromRichText(rt);
          if (url) o['Enlace_' + colName] = url;
        }
      });
    });

    // Construcción CSV según scope
    let outHeaders, buildRow;
    if (scope === 'all') {
      const linkCols = LINKED_COLUMNS.map(c => 'Enlace_' + c);
      outHeaders = headers.concat(linkCols);
      buildRow = o => outHeaders.map(h => o[h] || '');
    } else {
      outHeaders = [
        'Fecha Pedido','Proveedor','Descripción','Solicitante',
        'GDC_PINV','Enlace_GDC_PINV','SC','Enlace_SC','OC','Enlace_OC',
        'Albarán','Enlace_Albarán','Factura','Enlace_Factura','Presupuesto','Enlace_Presupuesto',
        'Servido','Autorizado','Importe'
      ];
      buildRow = o => [
        o['Fecha Pedido'] || '',
        o['Proveedor'] || '',
        o['Descripción'] || '',
        o['Solicitante'] || '',
        o['GDC_PINV'] || '',
        o['Enlace_GDC_PINV'] || '',
        o['SC'] || '',
        o['Enlace_SC'] || '',
        o['OC'] || '',
        o['Enlace_OC'] || '',
        o['Albarán'] || '',
        o['Enlace_Albarán'] || '',
        o['Factura'] || '',
        o['Enlace_Factura'] || '',
        o['Presupuesto'] || '',
        o['Enlace_Presupuesto'] || '',
        o['Servido'] || '',
        o['Autorizado'] || '',
        o['Importe'] || ''
      ];
    }

    function csvEscape(s) {
      s = (s === null || s === undefined) ? '' : String(s);
      if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
        s = '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    }

    const lines = [];
    lines.push(outHeaders.map(csvEscape).join(','));
    filtered.forEach(o => lines.push(buildRow(o).map(csvEscape).join(',')));

    const csv     = lines.join('\n');
    const base64  = Utilities.base64Encode(csv, Utilities.Charset.UTF_8);
    const stamp   = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmm");
    const fileLabel = scope === 'all' ? 'ALL' : 'VISIBLE';
    return { filename: `Pedidos_export_${fileLabel}_${stamp}.csv`, mimeType: 'text/csv', base64 };

  } catch (e) {
    throw new Error('Export CSV: ' + e.message);
  }
}

function exportOrdersToSheet(filters, scope) {
  try {
    const res = exportOrdersCSV(filters, scope); // reutilizamos lógica
    const ss  = SpreadsheetApp.create(`Pedidos Export ${scope === 'all' ? 'ALL' : 'VISIBLE'} ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmm")}`);
    const sh  = ss.getActiveSheet();

    // Parsear CSV para setValues
    const csvString = Utilities.newBlob(Utilities.base64Decode(res.base64)).getDataAsString('UTF-8');
    const rows = csvString.split(/\r?\n/).map(line => {
      const out = [];
      let cur = '', inQ = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
          else { inQ = !inQ; }
        } else if (ch === ',' && !inQ) { out.push(cur); cur = ''; }
        else { cur += ch; }
      }
      out.push(cur);
      return out;
    });

    sh.clear();
    sh.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
    return { url: ss.getUrl() };
  } catch (e) {
    throw new Error('Export Sheet: ' + e.message);
  }
}

// ==========================================
// 🛡️ Autorizaciones (pendientes / seleccionados / todos)
// ==========================================
function getPendingOrders() {
  try {
    const allOrders = getData(SHEETS.PEDIDOS, 0);
    const pending = allOrders.filter(order => {
      const auth = String(order['Autorizado'] || '').trim().toLowerCase();
      return auth !== 'sí' && auth !== 'si' && auth !== 'true' && auth !== 'yes';
    });
    // Orden ascendente por fecha (estilo impresión)
    pending.sort((a, b) => new Date(a['Fecha Pedido'] || 0) - new Date(b['Fecha Pedido'] || 0));
    return pending;
  } catch (e) {
    console.error('Error en getPendingOrders: ' + e);
    return [];
  }
}

// Núcleo que marca "Sí" en Autorizado para una lista de IDs.
function _markOrdersAsAuthorizedCore(orderIds) {
  const sheet   = getSheet(SHEETS.PEDIDOS);
  const data    = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIndex   = headers.indexOf('Id_Pedido');
  const authIndex = headers.indexOf('Autorizado');
  if (idIndex === -1 || authIndex === -1) throw new Error('Columnas no encontradas');

  const idsToUpdate = new Set(orderIds.map(String));
  let count = 0;
  const VALOR_AUTORIZADO = 'Sí';

  for (let i = 1; i < data.length; i++) {
    const rowId = String(data[i][idIndex]).trim();
    if (idsToUpdate.has(rowId)) {
      sheet.getRange(i + 1, authIndex + 1).setValue(VALOR_AUTORIZADO);
      count++;
    }
  }
  return { success: true, count };
}

// Autorizar SELECCIONADOS + auditoría
function markOrdersAsAuthorized(orderIds, payload) {
  const res = _markOrdersAsAuthorizedCore(orderIds);

  try {
    const all    = getData(SHEETS.PEDIDOS, 0);
    const idsSet = new Set(orderIds.map(String));
    const pedidos = all
      .filter(p => idsSet.has(String(p['Id_Pedido'])))
      .map(p => ({
        id: String(p['Id_Pedido'] || ''),
        proveedor: String(p['Proveedor'] || ''),
        descripcion: String(p['Descripción'] || ''),
        importe: p['Importe'] || ''
      }));

    const details = {
      count: res.count,
      firmas: (payload && (payload.firmas || payload.extras)) || '',
      pedidos
    };

    logAudit({
      action: 'AUTHORIZE_SELECTED',
      page:   'authorizations',
      details,
      userAgent: (payload && payload.userAgent) || '',
      extras:    (payload && payload.extras)    || ''
    });
  } catch (e) {
    console.error('Audit fallback error: ' + e);
  }

  SpreadsheetApp.flush();
  return res;
}

// Autorizar TODOS + auditoría
function authorizeAllPendingOrders(payload) {
  const pending = getPendingOrders();
  const ids     = pending.map(o => String(o['Id_Pedido']));
  const res     = _markOrdersAsAuthorizedCore(ids);

  const details = {
    count: res.count,
    firmas: (payload && payload.firmas) || (payload && payload.extras) || '',
    pedidos: pending.map(p => ({
      id: String(p['Id_Pedido'] || ''),
      proveedor: String(p['Proveedor'] || ''),
      descripcion: String(p['Descripción'] || ''),
      importe: p['Importe'] || ''
    }))
  };

  logAudit({
    action: 'AUTHORIZE_ALL',
    page:   'authorizations',
    details,
    userAgent: (payload && payload.userAgent) || '',
    extras:    (payload && payload.extras)    || ''
  });

  SpreadsheetApp.flush();
  return res;
}

// Utilidades para autorizaciones
function getPendingOrdersCount() { return getPendingOrders().length; }
function getPendingOrdersBrief() {
  return getPendingOrders().map(p => ({
    id: String(p['Id_Pedido'] || ''),
    proveedor: String(p['Proveedor'] || ''),
    descripcion: String(p['Descripción'] || ''),
    importe: p['Importe'] || ''
  }));
}
function getOrdersBriefByIds(ids) {
  const all = getData(SHEETS.PEDIDOS, 0);
  const set = new Set((ids || []).map(String));
  return all
    .filter(p => set.has(String(p['Id_Pedido'])))
    .map(p => ({
      id: String(p['Id_Pedido'] || ''),
      proveedor: String(p['Proveedor'] || ''),
      descripcion: String(p['Descripción'] || ''),
      importe: p['Importe'] || ''
    }));
}

// ==========================================
// ✏️ CRUD unitario
// ==========================================
function getOrderById(orderId) {
  try {
    const sheet  = getSheet(SHEETS.PEDIDOS);
    const finder = sheet.createTextFinder(String(orderId).trim()).matchEntireCell(true);
    const result = finder.findNext();
    if (!result) return null;

    const rowIndex = result.getRow();
    const range    = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn());
    const values   = range.getValues()[0];
    const formulas = range.getFormulas()[0];
    const richText = range.getRichTextValues()[0];
    const headers  = getHeaders(SHEETS.PEDIDOS);

    let order = {};
    headers.forEach((h, i) => {
      order[h] = sanitizeValue(values[i]);
      let link = null;
      if (formulas[i] && /HYPERLINK/i.test(formulas[i])) {
        const m = String(formulas[i]).match(/HYPERLINK\s*\(\s*"([^"]+)"\s*[,;]\s*"/i);
        if (m) link = m[1];
      }
      if (!link && richText[i]) {
        try {
          link = richText[i].getLinkUrl();
          if (!link && richText[i].getRuns) {
            const runs = richText[i].getRuns();
            if (runs && runs.length) {
              for (const r of runs) {
                const u = r.getTextStyle().getLinkUrl();
                if (u) { link = u; break; }
              }
            }
          }
        } catch (e) {}
      }
      if (link) order['Enlace_' + h] = link;
    });
    return order;
  } catch (e) {
    console.error('Error en getOrderById: ' + e);
    return null;
  }
}

function updateOrderField(orderId, field, value) {
  try {
    const sheet  = getSheet(SHEETS.PEDIDOS);
    const finder = sheet.createTextFinder(String(orderId).trim()).matchEntireCell(true);
    const result = finder.findNext();
    if (!result) throw new Error('Pedido no encontrado');

    const headers  = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const colIndex = headers.indexOf(field);
    if (colIndex === -1) throw new Error('Campo no encontrado');

    sheet.getRange(result.getRow(), colIndex + 1).setValue(value);

    if (field === 'Servido' && ['Sí','Si','SI'].includes(value)) {
      const dateIndex = headers.indexOf('Fecha Llegada');
      if (dateIndex !== -1) sheet.getRange(result.getRow(), dateIndex + 1).setValue(new Date());
    }
    return { success: true };
  } catch (e) {
    throw e;
  }
}

function saveRecord(sheetName, formObject) {
  try {
    const sheet   = getSheet(sheetName);
    const headers = getHeaders(sheetName);
    const idField = headers[0];
    const isNew   = !formObject[idField];
    if (isNew) formObject[idField] = Utilities.getUuid();

    const row = headers.map(h => {
      if (h.startsWith('Enlace_')) return '';
      const link = formObject['Enlace_' + h];
      const val  = formObject[h];
      return (link && val) ? `=HYPERLINK("${link}"; "${val}")` : (val || '');
    });

    if (isNew) {
      sheet.appendRow(row);
    } else {
      const finder = sheet.createTextFinder(String(formObject[idField])).matchEntireCell(true);
      const result = finder.findNext();
      if (!result) throw new Error('Registro no encontrado');
      sheet.getRange(result.getRow(), 1, 1, row.length).setValues([row]);
    }
    return { success: true, id: formObject[idField], isNew };
  } catch (e) {
    throw new Error(e.message);
  }
}

function deleteRecord(sheetName, id) {
  try {
    const sheet  = getSheet(sheetName);
    const finder = sheet.createTextFinder(String(id)).matchEntireCell(true);
    const result = finder.findNext();
    if (result) { sheet.deleteRow(result.getRow()); return { success: true }; }
    throw new Error('Registro no encontrado');
  } catch (e) {
    throw e;
  }
}

function uploadFileToDrive(data, filename, mimetype) {
  try {
    var folder = DriveApp.getFolderById("1uR9yHK5IZcbCdzcaMAGfkri8RHzEniMY");
    var blob   = Utilities.newBlob(Utilities.base64Decode(data), mimetype, filename);
    var file   = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return { success: true, url: file.getUrl() };
  } catch (e) {
    throw new Error(e.message);
  }
}

// ==========================================
// 📑 AUDITORÍA
// ==========================================
const AUDIT_SHEET   = 'Auditoria'; // nombre exacto de la pestaña
const AUDIT_HEADERS = ['Timestamp','UserEmail','Action','Page','DetailsJSON','UserAgent','Extras'];

function getAuditSheet_() {
  const sh = getSheet(AUDIT_SHEET);
  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();

  if (lastRow === 0) {
    sh.appendRow(AUDIT_HEADERS);
  } else {
    const headers = sh.getRange(1,1,1,Math.max(lastCol, AUDIT_HEADERS.length)).getValues()[0];
    const have = headers.slice(0, AUDIT_HEADERS.length).join('|');
    const want = AUDIT_HEADERS.join('|');
    if (have !== want) {
      sh.getRange(1,1,1,AUDIT_HEADERS.length).setValues([AUDIT_HEADERS]);
    }
  }
  return sh;
}

function logAudit(entry) {
  const lock = LockService.getDocumentLock();
  lock.waitLock(30000); // Apps Script: sin separadores numéricos
  try {
    const sh = getAuditSheet_();
    const userEmail = (Session.getActiveUser().getEmail() || Session.getEffectiveUser().getEmail() || '');
    const row = [
      new Date(),
      userEmail,
      entry.action || '',
      entry.page   || '',
      typeof entry.details === 'string' ? entry.details : JSON.stringify(entry.details || {}),
      entry.userAgent || '',
      entry.extras || ''
    ];
    sh.appendRow(row);
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

// ===== Utilidad de prueba (opcional) =====
function testAuditWrite() {
  const res = logAudit({
    action: 'TEST_WRITE',
    page: 'authorizations',
    details: { ping: true },
    userAgent: 'ManualRun',
    extras: 'Prueba manual'
  });
  Logger.log(res);
}
