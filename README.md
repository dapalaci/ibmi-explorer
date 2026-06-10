# IBM i Explorer

Herramienta web standalone para consultar un servidor **IBM i** (probado contra
[pub400.com](https://pub400.com)) vía JDBC y visualizar los resultados SQL como
**grafos force-directed estilo Neo4j**.

## Características

- **Backend** Express + [`node-jt400`](https://www.npmjs.com/package/node-jt400)
  (JDBC sobre JVM) con pool de conexiones lazy y configuración por env o desde la UI.
- **API REST**: `/api/connect`, `/api/tables`, `/api/tables/:name/schema`, `/api/query`.
- **Frontend** React 18 + Vite con tema oscuro tipo Neo4j Browser.
- **GraphView**: Cytoscape.js con layout `cose-bilkent`, colores por tipo de nodo,
  zoom/pan y selección de nodos.
- **MappingPanel**: mapeo dinámico de columnas a nodos/aristas con autodetección de FKs.
- **TableBrowser**: listado filtrable de tablas del esquema.
- **QueryEditor**: editor SQL con `Ctrl+Enter` y contador de filas/columnas.

## Requisitos

- Node.js 18+
- Java (JRE/JDK) 8+ en el PATH — `node-jt400` arranca una JVM para el driver JT400.

## Configuración

```bash
cp .env.example .env
# Edita .env con tus credenciales de IBM i
```

## Uso

```bash
npm install
npm run dev      # arranca server (Express) + client (Vite) en paralelo
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

Para producción:

```bash
npm run build    # genera client/dist
npm start        # sirve la API
```

## Estructura

```
server/          Backend Express + node-jt400
  index.js       Bootstrap del servidor
  ibmi.js        Pool de conexión JT400
  routes/        connect, tables, schema, query
client/          Frontend React + Vite
  src/components GraphView, MappingPanel, TableBrowser, QueryEditor, ConnectionPanel
  src/utils      graphMapper — transforma filas SQL en nodos/aristas
```
