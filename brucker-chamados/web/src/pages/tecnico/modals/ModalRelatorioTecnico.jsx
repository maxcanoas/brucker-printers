import { useState, useEffect } from 'react';
import { Modal } from '../../../components/Modal';
import { LoadingButton } from '../../../components/LoadingButton';
import { useTheme } from '../../../contexts/ThemeContext';
import api from '../../../lib/api';
import toast from 'react-hot-toast';

export default function ModalRelatorioTecnico({ chamado, onClose, onConcluido }) {
  const { theme } = useTheme();
  const [descricaoServico, setDescricaoServico] = useState('');
  const [pecasUtilizadas, setPecasUtilizadas] = useState('');
  const [duracaoMinutos, setDuracaoMinutos] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (chamado) {
      setDescricaoServico('');
      setPecasUtilizadas('');
      setDuracaoMinutos('');
    }
  }, [chamado]);

  const inputStyle = {
    width: '100%', padding: '12px 14px', backgroundColor: theme.bg,
    border: `1px solid ${theme.border}`, borderRadius: '8px', color: theme.text,
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    fontFamily: "'Barlow', sans-serif"
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!descricaoServico.trim()) {
      toast.error('Informe a descrição do serviço');
      return;
    }
    setSalvando(true);
    try {
      await api.post('/relatorios', {
        chamado_id: chamado.id,
        descricao_servico: descricaoServico.trim(),
        pecas_utilizadas: pecasUtilizadas.trim() || null,
        duracao_minutos: duracaoMinutos ? parseInt(duracaoMinutos, 10) : null
      });
      toast.success('Chamado concluído!');
      onConcluido();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao concluir chamado');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal isOpen={!!chamado} onClose={onClose} title={`Encerrar Chamado #${chamado?.numero}`} width="560px">
      <form onSubmit={handleSubmit}>
        <p style={{ color: theme.textSecondary, fontSize: '13px', margin: '0 0 20px' }}>
          Preencha o relatório técnico para concluir o atendimento.
        </p>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: theme.textSecondary, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
            Descrição do Serviço *
          </label>
          <textarea
            value={descricaoServico}
            onChange={(e) => setDescricaoServico(e.target.value)}
            placeholder="Descreva o serviço executado..."
            rows={4}
            style={{ ...inputStyle, resize: 'vertical' }}
            autoFocus
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: theme.textSecondary, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
            Peças Utilizadas
          </label>
          <textarea
            value={pecasUtilizadas}
            onChange={(e) => setPecasUtilizadas(e.target.value)}
            placeholder="Opcional — liste as peças substituídas ou utilizadas..."
            rows={2}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ color: theme.textSecondary, fontSize: '13px', display: 'block', marginBottom: '6px' }}>
            Duração (minutos)
          </label>
          <input
            type="number"
            min="0"
            value={duracaoMinutos}
            onChange={(e) => setDuracaoMinutos(e.target.value)}
            placeholder="Opcional"
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={salvando}
            style={{
              padding: '10px 20px', backgroundColor: 'transparent',
              border: `1px solid ${theme.border}`, borderRadius: '8px',
              color: theme.textSecondary, fontSize: '14px', fontWeight: 600,
              cursor: salvando ? 'not-allowed' : 'pointer',
              fontFamily: "'Barlow', sans-serif"
            }}
          >
            Cancelar
          </button>
          <LoadingButton
            type="submit"
            loading={salvando}
            loadingText="Concluindo..."
            style={{
              padding: '10px 20px', backgroundColor: '#3D9E6B', color: '#FFFFFF',
              border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
              fontFamily: "'Barlow', sans-serif"
            }}
          >
            Concluir Chamado
          </LoadingButton>
        </div>
      </form>
    </Modal>
  );
}
