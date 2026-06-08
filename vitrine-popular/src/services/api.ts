import axios from 'axios'

// URL base da API — vem do .env em produção, localhost em dev
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor de requisição:
// Injeta o token JWT automaticamente em toda chamada autenticada.
// O componente não precisa saber da existência do token — só chama a API.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vp_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor de resposta:
// Se a API retornar 401 ou 403, redireciona para o login e limpa o storage.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expirado ou inválido — limpa sessão
      localStorage.removeItem('vp_token')
      localStorage.removeItem('vp_usuario')
      // Redireciona sem recarregar o histórico
      window.location.replace('/login')
    }
    return Promise.reject(error)
  }
)

export default api