# Vitrine Popular — Frontend

Frontend do TCC "Vitrine Popular": uma vitrine de ofertas do comércio popular de Picos-PI.
React 19 + TypeScript + Vite + Tailwind 4 + React Router 7 + TanStack React Query 5 + Zustand + Axios.

A aplicação é uma PWA (manifesto + service worker via `vite-plugin-pwa`), instalável e com
cache offline básico para o feed público (ofertas, lojas, categorias).

## Rodando localmente

```bash
npm install
npm run dev
```

## Variáveis de ambiente

| Variável         | Descrição                                          | Exemplo                          |
|------------------|-----------------------------------------------------|-----------------------------------|
| `VITE_API_URL`   | URL base da API do backend (Spring Boot)            | `https://vitrine-popular-api.onrender.com` |

Crie um arquivo `.env` (não versionado) na raiz do projeto para desenvolvimento local, se a API
não estiver em `http://localhost:8080`:

```
VITE_API_URL=http://localhost:8080
```

## Deploy (Vercel)

No painel do projeto na Vercel, em **Settings → Environment Variables**, defina:

- `VITE_API_URL` — a URL pública do backend hospedado no Render (ex.: `https://vitrine-popular-api.onrender.com`).

Sem essa variável configurada, o app cai no fallback `http://localhost:8080` (definido em
`src/services/api.ts`) e todas as chamadas à API falharão em produção.

### CORS no backend (Render)

O backend usa a variável de ambiente `FRONTEND_ORIGIN` para liberar o CORS. No serviço do Render,
essa variável precisa conter o domínio real do frontend publicado na Vercel (ex.:
`https://vitrine-popular.vercel.app`). Caso contrário, o backend cai no fallback de localhost e
bloqueia as requisições vindas de produção.

## Build

```bash
npm run build
```

Gera `dist/` com os assets de produção, incluindo `manifest.webmanifest` e `sw.js` (service worker)
do plugin PWA.
