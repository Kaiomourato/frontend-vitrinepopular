import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from '@/App'
import { dispararToast } from '@/components/ui'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Registra o service worker (autoUpdate) e avisa quando houver nova versão
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    dispararToast('Nova versão disponível — atualizando...', 'info')
    updateSW(true)
  },
  onOfflineReady() {
    dispararToast('Aplicativo pronto para uso offline.', 'success')
  },
})