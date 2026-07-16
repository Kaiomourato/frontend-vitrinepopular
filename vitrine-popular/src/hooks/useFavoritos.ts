import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { favoritosService } from '@/services/favoritos'
import { useAuthStore } from '@/store/authStore'
import { dispararToast } from '@/components/ui'
import type { OfertaResponse } from '@/types'

// Lista de ofertas favoritas do usuário logado (RF11).
// O backend não manda flag `isFavorito` por oferta — derivamos o Set de IDs aqui.
export function useFavoritos() {
  const isAutenticado = useAuthStore(s => s.isAutenticado)

  const { data, isLoading } = useQuery({
    queryKey: ['favoritos'],
    queryFn: favoritosService.listar,
    enabled: isAutenticado,
  })

  const idsFavoritos = new Set((data ?? []).map(o => o.id))

  return { favoritos: data ?? [], idsFavoritos, isLoading }
}

// Alterna favoritar/desfavoritar com atualização otimista na lista de favoritos.
export function useToggleFavorito() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ oferta, favoritado }: { oferta: OfertaResponse; favoritado: boolean }) =>
      favoritado ? favoritosService.desfavoritar(oferta.id) : favoritosService.favoritar(oferta.id),

    onMutate: async ({ oferta, favoritado }) => {
      await queryClient.cancelQueries({ queryKey: ['favoritos'] })
      const anterior = queryClient.getQueryData<OfertaResponse[]>(['favoritos'])
      queryClient.setQueryData<OfertaResponse[]>(['favoritos'], (atual = []) =>
        favoritado ? atual.filter(o => o.id !== oferta.id) : [...atual, oferta]
      )
      return { anterior }
    },

    onError: (_err, _vars, context) => {
      if (context?.anterior) queryClient.setQueryData(['favoritos'], context.anterior)
      dispararToast('Não foi possível atualizar seus favoritos.', 'error')
    },

    onSuccess: (_data, { favoritado }) => {
      dispararToast(favoritado ? 'Removido dos favoritos.' : 'Adicionado aos favoritos!', 'success')
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favoritos'] })
    },
  })
}
