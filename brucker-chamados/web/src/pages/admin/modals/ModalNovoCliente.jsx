import { useState } from 'react';
import { Modal } from '../../../components/Modal';
import { LoadingButton } from '../../../components/LoadingButton';
import api from '../../../lib/api';
import toast from 'react-hot-toast';
import { CheckCircle, Copy } from 'lucide-react';

const inputStyle = {
  width: '100%', padding: '12px 14px', backgroundColor: '#0D1117',
  border: '1px solid #1E2533', borderRadius: '8px', color: '#FFFFFF',
  fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  fontFamily: "'Barlow', sans-serif"
};
const btnPrimary = {
  padding: '10px 20px', backgroundColor: '#E84C1E', color: '#FFFFFF',
  border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
  cursor: 'pointer', fontFamily: "'Barlow', sans-serif"
};

export default function ModalNovoCliente({ isOpen, onClose, onCriado }) {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '' });
  const [salvando, setSalvando] = useState(false);
  const [clienteCriado, setClienteCriado] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome) { toast.error('Nome é obrigatório'); return; }
    setSalvando(true);
    try {
      const { data } = await api.post('/clientes', form);
      setClienteCriado(data);
      toast.success('Cliente criado com sucesso!');
    } catch {
      toast.error('Erro ao criar cliente');
    } finally {
      setSalvando(false);
    }
  };

  const copiarCodigo = async () => {
    if (clienteCriado?.codigo_acesso) {
      try {
        await navigator.clipboard.writeText(clienteCriado.codigo_acesso);
        toast.success('Código copiado!');
      } catch {
        toast.error('Erro ao copiar');
      }
    }
  };

  const handleClose = () => {
    if (clienteCriado) {
      setForm({ nome: '', email: '', telefone: '' });
      setClienteCriado(null);
      onCriado();
    } else {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={clienteCriado ? 'Cliente Criado!' : 'Novo Cliente'}>
      {clienteCriado ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '24px' }}>
            <CheckCircle size={48} color="#3D9E6B" style={{ marginBottom: '16px' }} />
            <h3 style={{ color: '#FFFFFF', margin: '0 0 8px', fontSize: '18px' }}>
              {clienteCriado.nome}
            </h3>
            <p style={{ color: '#8A94A6', margin: 0, fontSize: '14px' }}>
              Cliente cadastrado com sucesso!
            </p>
          </div>

          <div style={{
            padding: '24px', backgroundColor: '#0D1117', borderRadius: '12px',
            border: '2px solid #E84C1E', marginBottom: '24px'
          }}>
            <p style={{ color: '#8A94A6', fontSize: '12px', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Código de Acesso Gerado
            </p>
            <p style={{
              color: '#E84C1E', fontSize: '32px', fontWeight: 700, margin: '0 0 12px',
              fontFamily: 'monospace', letterSpacing: '3px'
            }}>
              {clienteCriado.codigo_acesso}
            </p>
            <p style={{ color: '#8A94A6', fontSize: '12px', margin: '0 0 16px' }}>
              Envie este código ao cliente para que ele acesse o sistema de chamados
            </p>
            <button onClick={copiarCodigo} className="btn-secondary" style={{
              padding: '12px 24px', backgroundColor: 'rgba(77, 142, 245, 0.15)',
              border: '1px solid #4D8EF5', borderRadius: '8px',
              color: '#4D8EF5', cursor: 'pointer', display: 'inline-flex',
              alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 600,
              fontFamily: "'Barlow', sans-serif"
            }}>
              <Copy size={16} /> Copiar Código
            </button>
          </div>

          <button onClick={handleClose} className="btn-primary" style={{ ...btnPrimary, width: '100%' }}>
            Fechar
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Nome *</label>
            <input value={form.nome} onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))} style={inputStyle} placeholder="Nome completo ou razão social" />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>E-mail</label>
            <input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} placeholder="email@exemplo.com" />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: '#8A94A6', fontSize: '13px', display: 'block', marginBottom: '6px' }}>Telefone</label>
            <input value={form.telefone} onChange={(e) => setForm(f => ({ ...f, telefone: e.target.value }))} style={inputStyle} placeholder="(51) 99999-9999" />
          </div>
          <LoadingButton type="submit" loading={salvando} loadingText="Criando..." className="btn-primary" style={{ ...btnPrimary, width: '100%' }}>
            Cadastrar Cliente
          </LoadingButton>
          <p style={{ color: '#8A94A6', fontSize: '12px', textAlign: 'center', margin: '12px 0 0' }}>
            O código de acesso será gerado automaticamente
          </p>
        </form>
      )}
    </Modal>
  );
}
