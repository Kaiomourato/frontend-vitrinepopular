import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatarPreco(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export function formatarDataRelativa(iso: string): string {
  const data = new Date(iso)
  const agora = new Date()
  const diffMs = agora.getTime() - data.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMin / 60)
  const diffD = Math.floor(diffH / 24)

  if (diffMin < 1) return 'agora mesmo'
  if (diffMin < 60) return `há ${diffMin} min`
  if (diffH < 24) return `há ${diffH}h`
  if (diffD === 1) return 'ontem'
  if (diffD < 7) return `há ${diffD} dias`
  return data.toLocaleDateString('pt-BR')
}

export function formatarWhatsApp(numero: string | null): string | null {
  if (!numero) return null
  const digits = numero.replace(/\D/g, '')
  return `https://wa.me/55${digits}`
}

export function extrairErroApi(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const err = error as { response?: { data?: { message?: string } } }
    return err.response?.data?.message ?? 'Ocorreu um erro inesperado.'
  }
  return 'Não foi possível conectar ao servidor.'
}