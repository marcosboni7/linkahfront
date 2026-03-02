'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Edit3, X, Loader2, Ticket, Upload, Search, AlertCircle, Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

export default function TabelaEventos() {
  const { language }: any = useLanguage();
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [erroApi, setErroApi] = useState<string | null>(null);
  const router = useRouter();

  // Estados para Edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventoParaEditar, setEventoParaEditar] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatarDataLocal = (dataString: string) => {
    if (!dataString) return '---';
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString(language === 'PT' ? 'pt-BR' : 'en-US');
    } catch (e) { return dataString; }
  };

  const carregarEventos = async () => {
    setLoading(true);
    setErroApi(null);
    try {
      const rawToken = localStorage.getItem('@Linkah:Token') || localStorage.getItem('token');
      const token = rawToken ? rawToken.replace(/['"]+/g, '').trim() : '';
      let emailBase = localStorage.getItem('userEmail') || localStorage.getItem('email') || "marcosphara@gmail.com";
      const emailLimpo = emailBase.replace(/['"]+/g, '').trim().toLowerCase();

      let url = `${API_URL}/api/eventos/listar?email=${encodeURIComponent(emailLimpo)}&t=${Date.now()}`;
      let res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      let data = await res.json();

      if (!res.ok || data.error === "Email não fornecido") {
        url = `${API_URL}/api/eventos/listar?produtor_email=${encodeURIComponent(emailLimpo)}&t=${Date.now()}`;
        res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        data = await res.json();
      }

      if (res.ok) setEventos(Array.isArray(data) ? data : []);
      else setErroApi(data.error || "Erro ao carregar eventos");
    } catch (err) {
      setErroApi("Falha na conexão com o servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarEventos(); }, []);

  // --- FUNÇÃO DE REMOVER ---
  const handleRemoverEvento = async (id: string, nome: string) => {
    const confirmacao = await Swal.fire({
      title: 'Tem certeza?',
      text: `O evento "${nome}" será excluído permanentemente!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FF4D4D',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (confirmacao.isConfirmed) {
      try {
        const rawToken = localStorage.getItem('@Linkah:Token') || localStorage.getItem('token');
        const token = rawToken ? rawToken.replace(/['"]+/g, '').trim() : '';

        const res = await fetch(`${API_URL}/api/eventos/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          Swal.fire({ title: 'Excluído!', text: 'Evento removido com sucesso.', icon: 'success', timer: 1500, showConfirmButton: false });
          carregarEventos(); 
        } else {
          throw new Error('Erro ao deletar');
        }
      } catch (err) {
        Swal.fire('Erro', 'Não foi possível excluir o evento.', 'error');
      }
    }
  };

  const abrirModalEdicao = (evento: any) => {
    setEventoParaEditar({ ...evento });
    setPreviewUrl(evento.imagem_capa);
    setSelectedFile(null);
    setIsEditModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventoParaEditar.nome) return;
    
    setSaving(true);
    try {
      const rawToken = localStorage.getItem('@Linkah:Token') || localStorage.getItem('token');
      const token = rawToken ? rawToken.replace(/['"]+/g, '').trim() : '';
      
      const formData = new FormData();
      formData.append('nome', eventoParaEditar.nome);
      formData.append('categoria', eventoParaEditar.categoria || 'Evento');
      formData.append('data_inicio', eventoParaEditar.data_inicio);
      
      if (selectedFile) {
        formData.append('imagem', selectedFile);
      }

      const res = await fetch(`${API_URL}/api/eventos/${eventoParaEditar.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        await Swal.fire({ title: "Sucesso!", icon: 'success', timer: 1500, showConfirmButton: false });
        carregarEventos();
      } else {
        Swal.fire('Erro', 'Falha ao salvar alterações', 'error');
      }
    } catch (err) {
      Swal.fire('Erro', 'Falha ao atualizar', 'error');
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
        <button 
          onClick={() => router.push('/dashboard/eventos/novo/presencial')} 
          className="bg-[#030712] text-white px-8 py-4 rounded-2xl font-bold text-xs hover:bg-black transition-all shadow-lg active:scale-95"
        >
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
              <tr>
                <td colSpan={3} className="py-24 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-[#FF4D4D]" size={32} />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Carregando...</span>
                  </div>
                </td>
              </tr>
            ) : erroApi ? (
              <tr>
                <td colSpan={3} className="py-24 text-center text-[#FF4D4D]">
                   <AlertCircle className="mx-auto" size={32} />
                   <p className="font-bold">{erroApi}</p>
                </td>
              </tr>
            ) : eventos.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-24 text-center text-slate-400 font-medium">Nenhum evento encontrado.</td>
              </tr>
            ) : (
              eventos.map((evento) => (
                <tr key={evento.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden shadow-inner border border-slate-50">
                        <img 
                          src={evento.imagem_capa} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          onError={(e:any)=>e.target.src='https://placehold.co/200x200?text=Linkah'} 
                          alt={evento.nome}
                        />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-base tracking-tight">{evento.nome}</p>
                        <p className="text-[10px] text-[#FF4D4D] font-black uppercase tracking-widest">{evento.categoria || 'Evento'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center text-xs font-bold text-slate-500 uppercase">
                    {formatarDataLocal(evento.data_inicio)}
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => abrirModalEdicao(evento)} className="p-3 bg-slate-50 text-slate-400 hover:text-black rounded-xl transition-all" title="Editar"><Edit3 size={18} /></button>
                      <button onClick={() => router.push(`/dashboard/eventos/novo/ingressos/${evento.id}`)} className="p-3 bg-slate-50 text-slate-400 hover:text-[#FF4D4D] rounded-xl transition-all" title="Ingressos"><Ticket size={18} /></button>
                      <button onClick={() => handleRemoverEvento(evento.id, evento.nome)} className="p-3 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Excluir"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE EDIÇÃO */}
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
                  {previewUrl ? (
                    <img src={previewUrl} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" alt="Preview" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-300">
                      <Upload size={32} />
                      <span className="text-[10px] font-bold uppercase">Upload</span>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*" />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Evento</label>
                <input 
                  className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none border border-transparent focus:border-black focus:bg-white transition-all shadow-sm" 
                  value={eventoParaEditar.nome} 
                  onChange={(e) => setEventoParaEditar({...eventoParaEditar, nome: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                disabled={saving} 
                className="w-full bg-[#030712] text-white py-5 rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-3 mt-4 shadow-xl active:scale-[0.98] disabled:opacity-50"
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