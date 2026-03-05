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

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventoParaEditar, setEventoParaEditar] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função de validação de imagem corrigida
  const validarImagem = (url: any) => {
    // Se for null, undefined ou a string "null"/"undefined" ou conter erro de objeto
    if (!url || url === "null" || url === "undefined" || String(url).includes('[object Object]')) {
      return 'https://placehold.co/400x400/e2e8f0/64748b?text=Linkah';
    }

    // Se a URL já for completa (S3 ou externa)
    if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
      // Evita tentar carregar a imagem padrão que sabemos estar dando 404/403 no seu servidor
      if (url.includes('default-event.png')) {
        return 'https://placehold.co/400x400/e2e8f0/64748b?text=Evento';
      }
      return url;
    }

    // Se for apenas o nome do arquivo, concatena com a rota de uploads
    return `${API_URL}/uploads/${url}`;
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
      let emailBase = localStorage.getItem('userEmail') || localStorage.getItem('email') || "";
      const emailLimpo = emailBase.replace(/['"]+/g, '').trim().toLowerCase();

      // Timestamp para evitar cache agressivo da AWS/Browser
      let url = `${API_URL}/api/eventos/listar?email=${encodeURIComponent(emailLimpo)}&t=${Date.now()}`;
      
      let res = await fetch(url, { 
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });
      let data = await res.json();

      if (res.ok) {
        setEventos(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("❌ Erro ao buscar lista:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarEventos(); }, []);

  const abrirModalEdicao = (evento: any) => {
    setEventoParaEditar({ ...evento });
    setPreviewUrl(validarImagem(evento.imagem_capa));
    setSelectedFile(null);
    setIsEditModalOpen(true);
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventoParaEditar?.nome) return;
    
    setSaving(true);
    try {
      const rawToken = localStorage.getItem('@Linkah:Token') || localStorage.getItem('token');
      const token = rawToken ? rawToken.replace(/['"]+/g, '').trim() : '';
      
      const formData = new FormData();
      formData.append('nome', eventoParaEditar.nome.trim());
      formData.append('categoria', eventoParaEditar.categoria || 'Entretenimento');
      
      if (selectedFile) {
        formData.append('imagem_capa', selectedFile);
      } else {
        // Se não mudou a foto, envia o valor atual (pode ser null ou o nome do arquivo antigo)
        formData.append('imagem_capa', eventoParaEditar.imagem_capa || '');
      }

      const res = await fetch(`${API_URL}/api/eventos/${eventoParaEditar.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        await Swal.fire({ title: "Sucesso!", text: "Evento atualizado", icon: 'success', timer: 1500, showConfirmButton: false });
        carregarEventos();
      } else {
        const errorData = await res.json();
        Swal.fire('Erro', errorData.error || 'Erro ao salvar', 'error');
      }
    } catch (err) {
      Swal.fire('Erro', 'Falha na comunicação com servidor', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleExcluir = async (id: any) => {
    const result = await Swal.fire({
      title: 'Excluir evento?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Não'
    });

    if (result.isConfirmed) {
      try {
        const rawToken = localStorage.getItem('@Linkah:Token') || localStorage.getItem('token');
        const token = rawToken ? rawToken.replace(/['"]+/g, '').trim() : '';
        await fetch(`${API_URL}/api/eventos/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        carregarEventos();
      } catch (e) { console.error(e); }
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden font-sans">
      <div className="p-10 border-b border-slate-50 flex justify-between items-center">
        <div>
          <h2 className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Painel do Produtor</h2>
          <p className="text-slate-950 font-bold text-2xl tracking-tighter">Meus Eventos</p>
        </div>
        <button 
          onClick={() => router.push('/dashboard/eventos/novo/presencial')} 
          className="bg-[#030712] text-white px-8 py-4 rounded-2xl font-bold text-xs hover:bg-black transition-all shadow-lg"
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
              <tr><td colSpan={3} className="py-24 text-center"><Loader2 className="animate-spin mx-auto text-[#FF4D4D]" size={32} /></td></tr>
            ) : eventos.length === 0 ? (
                <tr><td colSpan={3} className="py-24 text-center text-slate-400">Nenhum evento encontrado.</td></tr>
            ) : (
              eventos.map((evento) => (
                <tr key={evento.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border border-slate-50 shadow-inner">
                        <img 
                          src={validarImagem(evento.imagem_capa)} 
                          className="w-full h-full object-cover" 
                          alt={evento.nome}
                          onError={(e:any) => {
                            e.target.onerror = null; 
                            e.target.src='https://placehold.co/400x400/e2e8f0/64748b?text=Erro+404';
                          }} 
                        />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-base">{evento.nome || "Sem nome"}</p>
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
                      <button onClick={() => handleExcluir(evento.id)} className="p-3 bg-slate-50 text-slate-400 hover:text-red-600 rounded-xl transition-all"><Trash2 size={18} /></button>
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
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl">
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
                    <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <Upload size={32} className="text-slate-300" />
                  )}
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
                className="w-full bg-[#030712] text-white py-5 rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl disabled:opacity-50"
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