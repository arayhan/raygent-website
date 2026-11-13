import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { Marked } from 'marked';

const here = path.dirname(fileURLToPath(import.meta.url));

const LANGS = ['en', 'id'] as const;
const VIRTUAL = 'virtual:raygent-docs';

/**
 * Renders raygent's markdown guides (raygent/docs/<lang>/<slug>.md) at build
 * time into `virtual:raygent-docs`, so the site ships HTML and no markdown
 * parser. Links like `sync.md` become `#sync`: the same files read correctly
 * on GitHub and on the site.
 */
function raygentDocs(): Plugin {
  const dir = path.resolve(here, process.env.RAYGENT_DOCS_DIR ?? '../raygent/docs');
  const resolved = '\0' + VIRTUAL;
  const md = new Marked({
    walkTokens(token) {
      if (token.type !== 'link') return;
      const m = /^([a-z0-9-]+)\.md(#[\w-]+)?$/.exec(token.href);
      if (m) token.href = `#${m[1]}`;
    },
  });

  return {
    name: 'raygent-docs',
    resolveId: (id) => (id === VIRTUAL ? resolved : undefined),
    load(id) {
      if (id !== resolved) return;
      const out: Record<string, Record<string, { title: string; html: string }>> = {};
      for (const lang of LANGS) {
        const langDir = path.join(dir, lang);
        if (!fs.existsSync(langDir)) {
          this.error(`raygent docs: ${langDir} not found. Clone raygent next to this repo or set RAYGENT_DOCS_DIR.`);
        }
        out[lang] = {};
        for (const file of fs.readdirSync(langDir).filter((f) => f.endsWith('.md'))) {
          const full = path.join(langDir, file);
          this.addWatchFile(full);
          const slug = file.slice(0, -3);
          const src = fs.readFileSync(full, 'utf8');
          out[lang][slug] = {
            title: /^# (.+)$/m.exec(src)?.[1].trim() ?? slug,
            html: md.parse(src, { async: false }) as string,
          };
        }
      }
      // Mirrors how id.tsx is typed against Dict: a guide missing in one language fails the build.
      const [en, ids] = LANGS.map((l) => Object.keys(out[l]).sort());
      const missing = [
        ...en.filter((s) => !ids.includes(s)).map((s) => `id/${s}.md`),
        ...ids.filter((s) => !en.includes(s)).map((s) => `en/${s}.md`),
      ];
      if (missing.length) this.error(`raygent docs: missing ${missing.join(', ')} in ${dir}`);
      return `export default ${JSON.stringify(out)};`;
    },
    configureServer(server) {
      server.watcher.add(dir);
      const reload = (file: string) => {
        if (!path.resolve(file).startsWith(dir) || !file.endsWith('.md')) return;
        const mod = server.moduleGraph.getModuleById(resolved);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('change', reload);
      server.watcher.on('add', reload);
      server.watcher.on('unlink', reload);
    },
  };
}

export default defineConfig({
  root: here,
  // GitHub Pages serves this project site under /raygent-website/.
  base: '/raygent-website/',
  plugins: [react(), tailwindcss(), raygentDocs()],
  build: {
    // Resolved against root, so it lands in this repo whatever the cwd.
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(here, 'index.html'),
        docs: path.resolve(here, 'docs/index.html'),
      },
    },
  },
});
