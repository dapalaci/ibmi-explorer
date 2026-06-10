import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';

cytoscape.use(coseBilkent);

const CY_STYLE = [
  {
    selector: 'node',
    style: {
      'background-color': 'data(_color)',
      'label': 'data(label)',
      'color': '#fff',
      'text-valign': 'center',
      'text-halign': 'center',
      'font-size': '11px',
      'font-family': 'JetBrains Mono, monospace',
      'width': 58,
      'height': 58,
      'border-width': 2,
      'border-color': 'rgba(255,255,255,0.2)',
      'text-wrap': 'ellipsis',
      'text-max-width': '52px',
      'text-overflow-wrap': 'anywhere',
    },
  },
  {
    selector: 'node:selected',
    style: {
      'border-width': 3,
      'border-color': '#0fb8ad',
      'box-shadow': '0 0 10px #0fb8ad',
    },
  },
  {
    selector: 'node:active',
    style: { 'overlay-opacity': 0.1 },
  },
  {
    selector: 'edge',
    style: {
      'line-color': '#2a2f4a',
      'target-arrow-color': '#2a2f4a',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'label': 'data(label)',
      'font-size': '9px',
      'font-family': 'JetBrains Mono, monospace',
      'color': '#8892b0',
      'text-background-color': '#0d0f1a',
      'text-background-opacity': 0.85,
      'text-background-padding': '2px',
      'width': 1.5,
      'opacity': 0.8,
    },
  },
  {
    selector: 'edge:selected',
    style: {
      'line-color': '#0fb8ad',
      'target-arrow-color': '#0fb8ad',
      'opacity': 1,
    },
  },
];

export default function GraphView({ elements, onNodeClick, onBgClick }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: [],
      style: CY_STYLE,
      layout: { name: 'preset' },
      minZoom: 0.05,
      maxZoom: 4,
      boxSelectionEnabled: false,
    });

    cyRef.current.on('tap', 'node', evt => {
      onNodeClick?.(evt.target.data());
    });

    cyRef.current.on('tap', evt => {
      if (evt.target === cyRef.current) onBgClick?.();
    });

    return () => { cyRef.current?.destroy(); };
  }, []);

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.elements().remove();

    if (!elements || elements.length === 0) return;

    cy.add(elements);

    const layoutName = elements.filter(e => e.group === 'nodes').length > 1
      ? 'cose-bilkent'
      : 'preset';

    cy.layout({
      name: layoutName,
      animate: true,
      animationDuration: 600,
      animationEasing: 'ease-out',
      nodeRepulsion: 5000,
      idealEdgeLength: 120,
      edgeElasticity: 0.45,
      nestingFactor: 0.1,
      gravity: 0.25,
      numIter: 2500,
      tile: true,
      randomize: false,
      padding: 40,
    }).run();
  }, [elements]);

  const isEmpty = !elements || elements.length === 0;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', background: 'var(--bg-deep)' }}
      />
      {isEmpty && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-dim)', pointerEvents: 'none',
        }}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ opacity: 0.3, marginBottom: 16 }}>
            <circle cx="20" cy="20" r="10" stroke="currentColor" strokeWidth="2" />
            <circle cx="44" cy="20" r="10" stroke="currentColor" strokeWidth="2" />
            <circle cx="32" cy="46" r="10" stroke="currentColor" strokeWidth="2" />
            <line x1="29" y1="20" x2="35" y2="20" stroke="currentColor" strokeWidth="2" />
            <line x1="24" y1="28" x2="28" y2="36" stroke="currentColor" strokeWidth="2" />
            <line x1="40" y1="28" x2="36" y2="36" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span style={{ fontSize: 13 }}>Ejecuta una consulta para ver el grafo</span>
        </div>
      )}
    </div>
  );
}
