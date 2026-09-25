import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';

// Initialize Firebase client SDK for server-side endpoints & OG tags
let db: any = null;
function getDb() {
  if (!db) {
    try {
      if (fs.existsSync('firebase-applet-config.json')) {
        const configStr = fs.readFileSync('firebase-applet-config.json', 'utf8');
        const config = JSON.parse(configStr);
        const app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
        db = config.firestoreDatabaseId ? getFirestore(app, config.firestoreDatabaseId) : getFirestore(app);
      }
    } catch (err) {
      console.warn('Firebase init warning:', err);
    }
  }
  return db;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoints
  app.post('/api/verify-passkey', async (req, res) => {
    const { id, passkeyHash } = req.body;
    try {
      const database = getDb();
      if (!database) {
        return res.status(500).json({ error: 'Database not initialized' });
      }
      const docSnap = await getDoc(doc(database, 'documents', id));
      if (!docSnap.exists()) {
        return res.status(404).json({ error: 'Document not found' });
      }
      if (docSnap.data()?.passkeyHash === passkeyHash) {
        return res.json({ success: true });
      }
      return res.status(401).json({ error: 'Invalid passkey' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.get('/raw/:id', async (req, res) => {
    try {
      const database = getDb();
      if (!database) {
        return res.status(500).send('Database not initialized');
      }
      const docId = req.params.id.replace(/\.[^/.]+$/, ""); // Strip extension
      const docSnap = await getDoc(doc(database, 'documents', docId));
      if (!docSnap.exists()) {
        return res.status(404).send('Document not found');
      }
      const data = docSnap.data();
      if (data?.isEncrypted) {
        return res.status(403).send('Cannot serve raw encrypted document. Please unlock in viewer.');
      }
      
      let contentType = 'text/plain';
      if (req.params.id.endsWith('.js')) contentType = 'application/javascript';
      else if (req.params.id.endsWith('.css')) contentType = 'text/css';
      else if (req.params.id.endsWith('.html') || data?.type === 'html') contentType = 'text/html';
      
      res.setHeader('Content-Type', contentType);
      res.send(data?.content || '');
    } catch (e) {
      res.status(500).send('Server error');
    }
  });

  // OpenGraph tag injection for view route
  const injectOGTags = async (req: express.Request, res: express.Response, next: express.NextFunction, vite: any, distPath: string) => {
    try {
      const docId = req.params.id;
      let docData: any = null;
      try {
        const database = getDb();
        if (database) {
          const docSnap = await getDoc(doc(database, 'documents', docId));
          if (docSnap.exists()) {
            docData = docSnap.data();
          }
        }
      } catch (dbErr) {
        console.warn('Could not fetch doc for OG tags:', dbErr);
      }
      
      let template = '';
      if (vite) {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
      } else {
        template = fs.readFileSync(path.resolve(distPath, 'index.html'), 'utf-8');
      }

      if (docData) {
        const title = docData?.title || `Document ${docId}`;
        const description = docData?.isEncrypted 
          ? '🔒 Password protected document on DocShowcase.' 
          : (docData?.content || '').slice(0, 160).replace(/[#*`\n\r]/g, ' ').trim();

        const ogTags = `
    <meta property="og:title" content="${title} - DocShowcase" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="DocShowcase" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title} - DocShowcase" />
    <meta name="twitter:description" content="${description}" />
    <title>${title} - DocShowcase</title>
        `;
        
        template = template.replace('</head>', `${ogTags}\n  </head>`);
      }
      
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e) {
      next();
    }
  };

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    
    app.get('/view/:id', (req, res, next) => injectOGTags(req, res, next, vite, ''));
    app.use(vite.middlewares);
    
    app.use('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const indexPath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    
    app.get('/view/:id', (req, res, next) => injectOGTags(req, res, next, null, distPath));
    app.use(express.static(distPath, { index: false }));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
