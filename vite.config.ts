import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';

const localApiMiddleware = (env: Record<string, string>): Plugin => ({
  name: 'local-api-middleware',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url === '/api/analyze' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            process.env.GEMINI_API_KEY = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
            // Dynamically import backend logic
            const { processAnalysis } = await server.ssrLoadModule('./api/analyze.ts');
            const parsedBody = body ? JSON.parse(body) : {};
            const result = await processAnalysis(parsedBody);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(JSON.stringify(result));
          } catch (err: any) {
            console.error('Local API middleware error:', err);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err.message || 'Error processing analysis locally' }));
          }
        });
        return;
      }
      next();
    });
  }
});

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), localApiMiddleware(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
