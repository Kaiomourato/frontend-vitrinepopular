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
// PENDENTE: sugestão de COLABORADOR aguardando aprovação do lojista dono ou de um admin.
export type StatusOferta = 'ATIVA' | 'EXPIRADA' | 'REMOVIDA' | 'PENDENTE'

// Quem originou a oferta — LOJISTA (fluxo direto, nasce ATIVA) ou COLABORADOR (sugestão, nasce PENDENTE)
export type OrigemOferta = 'COLABORADOR' | 'LOJISTA'

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

export interface AutorResumo {
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
  interessados: number      // contagem de favoritos
  origem: OrigemOferta
  autor: AutorResumo | null
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

// ── Gamificação ──────────────────────────────────────────────────────────────
export type Medalha = 'BRONZE' | 'PRATA' | 'OURO'

export interface RankingColaborador {
  usuarioId: number
  nome: string
  contribuicoesAprovadas: number
}

export interface RankingLoja {
  lojaId: number
  nome: string
  endereco: string | null
  popularidade: number
}

export interface UsuarioGamificacao {
  usuarioId: number
  contribuicoesAprovadas: number
  medalha: Medalha | null
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

// ── Paginação ─────────────────────────────────────────────────────────────────
// Formato real observado na API (Spring Boot 3.2+ com spring-data-web
// "page-as-object"): os metadados vêm aninhados em `page`, sem os campos
// `first`/`last`/`empty` do Page<T> "clássico" — derive-os de
// `page.number`/`page.totalPages` quando precisar.
export interface PageMetadata {
  size: number
  number: number
  totalElements: number
  totalPages: number
}

export interface PageResponse<T> {
  content: T[]
  page: PageMetadata
}

// ── Erro da API ───────────────────────────────────────────────────────────────
export interface ErroApi {
  status: number
  message: string
}