import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useRealtimeChamados(clienteId, onUpdate) {
  useEffect(() => {
    const channel = supabase
      .channel('chamados-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chamados',
          ...(clienteId ? { filter: `cliente_id=eq.${clienteId}` } : {})
        },
        (payload) => {
          onUpdate(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clienteId, onUpdate]);
}
