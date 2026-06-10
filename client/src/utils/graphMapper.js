const FK_PATTERNS = [/_ID$/i, /_NO$/i, /_NBR$/i, /_KEY$/i, /_NUM$/i, /_CODE$/i, /^PARENT_/i, /^FK_/i];

const NEO4J_PALETTE = [
  '#4A90E2', '#E27D60', '#85DCB8', '#E8A838',
  '#C9B1FF', '#F07427', '#7EC8E3', '#9DE04A',
  '#FF8FAB', '#0FB8AD',
];

let paletteIdx = 0;
const colorCache = {};

export function getNodeColor(type) {
  if (!colorCache[type]) {
    colorCache[type] = NEO4J_PALETTE[paletteIdx % NEO4J_PALETTE.length];
    paletteIdx++;
  }
  return colorCache[type];
}

export function resetColorCache() {
  paletteIdx = 0;
  Object.keys(colorCache).forEach(k => delete colorCache[k]);
}

export function detectFkColumns(columns) {
  return columns.filter(col => FK_PATTERNS.some(p => p.test(col)));
}

export function detectIdColumn(columns) {
  const exact = columns.find(c => /^ID$/i.test(c));
  if (exact) return exact;
  const prefixed = columns.find(c => /^ID_/i.test(c) || /_ID$/i.test(c));
  if (prefixed) return prefixed;
  return columns[0] || '';
}

export function detectLabelColumn(columns) {
  const priorities = ['NAME', 'NOMBRE', 'DESC', 'DESCRIPTION', 'DESCRIPCION',
    'LABEL', 'TITLE', 'TITULO', 'TEXT', 'TEXTO', 'NOM', 'NOMRE'];
  for (const p of priorities) {
    const found = columns.find(c => c.toUpperCase().includes(p));
    if (found) return found;
  }
  return columns[1] || columns[0] || '';
}

export function autoDetectMapping(columns) {
  const fks = detectFkColumns(columns);
  return {
    nodeIdCol: detectIdColumn(columns),
    nodeLabelCol: detectLabelColumn(columns),
    edgeSourceCol: fks[0] || '',
    edgeTargetCol: fks[1] || '',
    nodeType: 'row',
  };
}

export function rowsToElements(rows, columns, mapping) {
  const { nodeIdCol, nodeLabelCol, edgeSourceCol, edgeTargetCol, nodeType = 'row' } = mapping;

  if (!rows || rows.length === 0) return [];

  const nodeColor = getNodeColor(nodeType);
  const seenIds = new Set();
  const nodes = [];

  rows.forEach((row, idx) => {
    const rawId = row[nodeIdCol];
    const id = rawId != null ? String(rawId) : `node-${idx}`;

    if (seenIds.has(id)) return;
    seenIds.add(id);

    const rawLabel = row[nodeLabelCol];
    const label = rawLabel != null ? String(rawLabel).slice(0, 30) : id;

    const data = { id, label, nodeType, _color: nodeColor };
    columns.forEach(col => {
      data[col] = row[col] != null ? String(row[col]) : '';
    });

    nodes.push({ group: 'nodes', data });
  });

  const edges = [];
  if (edgeSourceCol && edgeTargetCol) {
    rows.forEach((row, idx) => {
      const source = row[edgeSourceCol] != null ? String(row[edgeSourceCol]) : '';
      const target = row[edgeTargetCol] != null ? String(row[edgeTargetCol]) : '';

      if (!source || !target || source === target) return;
      if (!seenIds.has(source) || !seenIds.has(target)) return;

      edges.push({
        group: 'edges',
        data: {
          id: `e-${idx}-${source}-${target}`,
          source,
          target,
          label: edgeSourceCol,
        },
      });
    });
  }

  return [...nodes, ...edges];
}
