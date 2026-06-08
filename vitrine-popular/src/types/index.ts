// ============================================================
// Tipos TypeScript — espelham os DTOs do backend Java
// Mantenha sincronizado com qualquer mudança na API
// ============================================================

// ── Autenticação ──────────────────────────────────────────────────────────────

export interface LojaVinculada {
  id: number
  nome: string
}

export interface UsuarioResponse {
  id: number
  nome: string
  email: string
  perfil: 'LOJISTA' | 'COLABORADOR'
  loja: LojaVinculada | null
}

export interface LoginResponse {
  usuario: UsuarioResponse
  token: string
}

// ── Categorias ────────────────────────────────────────────────────────────────

export interface CategoriaResponse {
  id: number
  nome: string
}

// ── Lojas ────────────────────────────────────────────────────────────────────

export interface LojaResponse {
  id: number
  nome: string
  endereco: string | null
  whatsapp: string | null
  isParceira: boolean
  pin?: string // só retornado no momento de criação
}

// ── Ofertas ───────────────────────────────────────────────────────────────────

export type StatusOferta = 'ATIVA' | 'EXPIRADA' | 'REMOVIDA'

export interface LojaResumo {
  id: number
  nome: string
  endereco: string | null
  whatsapp: string | null
}

export interface CategoriaResumo {
  id: number
  nome: string
}

export interface OfertaResponse {
  id: number
  produtoNome: string
  descricao: string | null
  preco: number
  imagemUrl: string
  status: StatusOferta
  dataPostagem: string        // ISO 8601 — formatar no frontend
  votosAcabou: number
  votosAindaTem: number
  loja: LojaResumo
  categoria: CategoriaResumo
}

// Dados enviados ao criar/editar uma oferta (campo 'dados' do multipart)
export interface OfertaRequest {
  produtoNome: string
  descricao?: string
  preco: number
  lojaId: number
  categoriaId: number
}

// ── Paginação (padrão Spring Page<T>) ────────────────────────────────────────

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number        // página atual (0-indexed)
  size: number
  first: boolean
  last: boolean
  empty: boolean
}

// ── Erro da API ───────────────────────────────────────────────────────────────

export interface ErroApi {
  status: number
  message: string
}