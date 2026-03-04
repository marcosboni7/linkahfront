'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Edit3, X, Loader2, Ticket, Upload, Trash2 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

export default function TabelaEventos() {
  const { language }: any = useLanguage();
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Estados do Modal de Edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventoParaEditar, setEventoParaEditar] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função Inteligente para a Imagem
  const getImageUrl = (path: string) => {
    if (!path || path === "null" || path === "undefined" || path === "") {
      return 'https://placehold.co/400x400?text=Sem+Foto';
    }
    // Se o banco já mandou a URL completa (começa com http), usa ela direto
    if (path.startsWith('http')) return path;
    
    // Se for só o nome do arquivo, aí sim adiciona o prefixo da API
    return `${API_URL}/uploads/${path}`;
  };

  const formatarDataLocal = (dataString: string) => {
    if (!dataString) return '---';
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString(language === 'PT' ? 'pt-BR' : 'en-US');
    } catch (e) { return dataString; }
  };

  const carregarEventos = async () => {
    setLoading(true);
    try {
      const rawToken = localStorage.getItem('@Linkah:Token') || localStorage.getItem('token');
      const token = rawToken ? rawToken.replace(/['"]+/g, '').trim() : '';
      let emailBase = localStorage.getItem('userEmail') || localStorage.getItem('email') || "marcosphara@gmail.com";
      const emailLimpo = emailBase.replace(/['"]+/g, '').trim().toLowerCase();

      let url = `${API_URL}/api/eventos/listar?email=${encodeURIComponent(emailLimpo)}&t=${Date.now()}`;
      let res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      let data = await res.json();

      if (res.ok) {
        console.log("DEBUG EVENTOS:", data); // Olhe isso no console do navegador!
        setEventos(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarEventos(); }, []);

  const handleRemoverEvento = async (id: string, nome: string) => {
    const confirm = await Swal.fire({
      title: 'Excluir?',
      text: `Remover ${nome}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF4D4D',
      confirmButtonText: 'Sim, excluir'
    });

    if (confirm.isConfirmed) {
      const rawToken = localStorage.getItem('@Linkah:Token') || localStorage.getItem('token');
      const token = rawToken ? rawToken.replace(/['"]+/g, '').trim() : '';
      await fetch(`${API_URL}/api/eventos/${id}`, { 
        method: 'DELETE', 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      carregarEventos();
    }
  };

  const abrirModalEdicao = (evento: any) => {
    setEventoParaEditar({ ...evento });
    setPreviewUrl(getImageUrl(evento.imagem_capa));
    setSelectedFile(null);
    setIsEditModalOpen(true);
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventoParaEditar?.nome || eventoParaEditar.nome.trim() === "") {
      return Swal.fire('Aviso', 'O nome do evento não pode estar vazio', 'warning');
    }
    setSaving(true);

    try {
      const rawToken = localStorage.getItem('@Linkah:Token') || localStorage.getItem('token');
      const token = rawToken ? rawToken.replace(/['"]+/g, '').trim() : '';
      
      const headers: any = { 'Authorization': `Bearer ${token}` };
      let body: any;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('nome', eventoParaEditar.nome.trim());
        formData.append('categoria', eventoParaEditar.categoria || 'Entretenimento');
        formData.append('data_inicio', eventoParaEditar.data_inicio || new Date().toISOString());
        formData.append('descricao', eventoParaEditar.descricao || '');
        formData.append('local_nome', eventoParaEditar.local_nome || '');
        formData.append('cidade', eventoParaEditar.cidade || '');
        formData.append('estado', eventoParaEditar.estado || '');
        formData.append('status', eventoParaEditar.status || 'Ativo');
        formData.append('imagem_capa', selectedFile); 
        body = formData;
      } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify({
          ...eventoParaEditar,
          nome: eventoParaEditar.nome.trim()
        });
      }

      const res = await fetch(`${API_URL}/api/eventos/${eventoParaEditar.id}`, {
        method: 'PUT',
        headers: headers,
        body: body,
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        await Swal.fire({ title: "Sucesso!", icon: 'success', timer: 1000, showConfirmButton: false });
        carregarEventos(); 
      } else {
        const errorData = await res.json();
        Swal.fire('Erro', errorData.error || 'Erro ao salvar', 'error');
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
      Swal.fire('Erro', 'Conexão interrompida.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden font-sans">
      <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-white">
        <div>
          <h2 className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Painel do Produtor</h2>
          <p className="text-slate-950 font-bold text-2xl tracking-tighter">Meus Eventos</p>
        </div>
        <button onClick={() => router.push('/dashboard/eventos/novo/presencial')} className="bg-[#030712] text-white px-8 py-4 rounded-2xl font-bold text-xs hover:bg-black transition-all shadow-lg active:scale-95">
          + Novo Evento
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <tr>
              <th className="px-10 py-5">Evento</th>
              <th className="px-6 py-5 text-center">Data</th>
              <th className="px-10 py-5 text-right">Gestão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={3} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-[#FF4D4D]" size={32} /></td></tr>
            ) : eventos.length === 0 ? (
              <tr><td colSpan={3} className="py-24 text-center text-slate-400 font-medium">Nenhum evento encontrado.</td></tr>
            ) : (
              eventos.map((evento) => (
                <tr key={evento.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border border-slate-50 shadow-inner">
                        <img 
                          src={getImageUrl(evento.imagem_capa)} 
                          className="w-full h-full object-cover" 
                          onError={(e:any) => { e.target.src='https://placehold.co/200x200?text=Linkah' }}
                        />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-base tracking-tight">{evento.nome || "Sem nome"}</p>
                        <p className="text-[10px] text-[#FF4D4D] font-black uppercase tracking-widest">{evento.categoria || 'Evento'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center text-xs font-bold text-slate-500 uppercase">
                    {formatarDataLocal(evento.data_inicio)}
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => abrirModalEdicao(evento)} className="p-3 bg-slate-50 text-slate-400 hover:text-black rounded-xl transition-all"><Edit3 size={18} /></button>
                      <button onClick={() => router.push(`/dashboard/eventos/novo/ingressos/${evento.id}`)} className="p-3 bg-slate-50 text-slate-400 hover:text-[#FF4D4D] rounded-xl transition-all"><Ticket size={18} /></button>
                      <button onClick={() => handleRemoverEvento(evento.id, evento.nome)} className="p-3 bg-slate-50 text-slate-400 hover:text-red-600 rounded-xl transition-all"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isEditModalOpen && eventoParaEditar && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-2xl tracking-tighter">Editar Evento</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X /></button>
            </div>
            
            <form onSubmit={handleSalvarEdicao} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Imagem de Capa</label>
                <div 
                  onClick={() => fileInputRef.current?.click()} 
                  className="h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center cursor-pointer overflow-hidden group hover:border-[#FF4D4D] transition-all"
                >
                  {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <Upload size={32} className="text-slate-300" />}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={(e:any) => {
                    const file = e.target.files?.[0];
                    if (file) { 
                      setSelectedFile(file); 
                      setPreviewUrl(URL.createObjectURL(file)); 
                    }
                  }} 
                  accept="image/*" 
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Evento</label>
                <input 
                  className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none border border-transparent focus:border-black focus:bg-white transition-all shadow-sm" 
                  value={eventoParaEditar.nome || ""} 
                  onChange={(e) => setEventoParaEditar({...eventoParaEditar, nome: e.target.value})} 
                />
              </div>

              <button 
                type="submit" 
                disabled={saving} 
                className="w-full bg-[#030712] text-white py-5 rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : 'Salvar Alterações'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}