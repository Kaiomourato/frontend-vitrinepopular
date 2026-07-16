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
  perfil: 'LOJISTA' | 'COLABORADOR' | 'ADMIN'
  loja: LojaVinculada | null
}

export interface LoginResponse {
  perfil: UsuarioResponse  // backend retorna "perfil", não "usuario"
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
  pin?: string
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
  dataPostagem: string
  votosAcabou: number
  votosAindaTem: number
  loja: LojaResumo
  categoria: CategoriaResumo
}

export interface OfertaRequest {
  produtoNome: string
  descricao?: string
  preco: number
  lojaId: number
  categoriaId: number
}

// ── Ordenação e filtros do feed (RF06/RF07) ─────────────────────────────────
export type OrdenacaoOferta = 'recentes' | 'preco' | 'interacao'

export interface ListarOfertasParams {
  page?: number
  size?: number
  sort?: OrdenacaoOferta
  precoMin?: number
  precoMax?: number
  categoriaId?: number
}

// ── Paginação (padrão Spring Page<T>) ────────────────────────────────────────
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
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