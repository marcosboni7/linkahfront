'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, ChevronRight, ChevronDown, MapPin, 
  Globe, Calendar, Clock, Edit3, Trash2, Image as ImageIcon, 
  X, Save, Loader2, Ticket, Upload, Camera
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://zmn9xuwd4y.us-east-1.awsapprunner.com';

export default function TabelaEventos() {
  const { t, language }: any = useLanguage();
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  const buscarEmailNoStorage = () => {
    try {
      const chaves = ['@Linkah:User', '@Linkah:user', 'user', 'userData'];
      for (const chave of chaves) {
        const item = localStorage.getItem(chave);
        if (item) {
          const parsed = JSON.parse(item);
          const email = parsed.email || parsed.user?.email || parsed.data?.email;
          if (email) return email.toLowerCase().trim();
        }
      }
      return localStorage.getItem('email') || null;
    } catch (e) { return null; }
  };

  const carregarEventos = async () => {
    console.log("🔍 [DEBUG] Iniciando busca...");
    setLoading(true);
    try {
      const token = localStorage.getItem('@Linkah:Token') || localStorage.getItem('token');
      const email = buscarEmailNoStorage();
      
      console.log("📧 [DEBUG] E-mail recuperado:", email);

      // CORREÇÃO DO ERRO 400: Se email for null, não enviamos o parâmetro "email="
      let endpoint = `${API_URL}/api/eventos/listar?t=${Date.now()}`;
      if (email) {
        endpoint += `&email=${encodeURIComponent(email)}`;
      }

      const res = await fetch(endpoint, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        console.log("✅ [DEBUG] Sucesso! Eventos:", data.length);
        setEventos(Array.isArray(data) ? [...data] : []);
      } else {
        console.error("❌ [DEBUG] Erro API:", res.status);
        // Se deu erro com email, tenta sem nada só por garantia
        if (res.status === 400 || res.status === 403) {
            const fallbackRes = await fetch(`${API_URL}/api/eventos/listar?t=${Date.now()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (fallbackRes.ok) {
                const fallbackData = await fallbackRes.json();
                setEventos(fallbackData);
            }
        }
      }
    } catch (err) {
      console.error("💥 Erro de conexão:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregarEventos(); }, []);

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
    setSaving(true);
    try {
      const token = localStorage.getItem('@Linkah:Token') || localStorage.getItem('token');
      const formData = new FormData();
      formData.append('nome', eventoParaEditar.nome);
      formData.append('categoria', eventoParaEditar.categoria || '');
      formData.append('data_inicio', eventoParaEditar.data_inicio);
      if (selectedFile) formData.append('imagem', selectedFile);

      const res = await fetch(`${API_URL}/api/eventos/${eventoParaEditar.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        Swal.fire({ title: "Atualizado!", icon: 'success', timer: 1000, showConfirmButton: false, toast: true, position: 'top-end' });
        setTimeout(() => carregarEventos(), 500);
      }
    } catch (err) { 
        Swal.fire('Erro', 'Falha ao salvar na AWS', 'error'); 
    } finally { 
        setSaving(false); 
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden font-sans">
      <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">AWS Manager</h2>
          <p className="text-slate-950 font-bold text-2xl tracking-tighter">Meus Eventos</p>
        </div>
        <button onClick={() => router.push('/dashboard/eventos/novo/presencial')} className="bg-slate-950 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 text-xs active:scale-95 transition-all">
          Novo Evento <ChevronDown size={18} className="text-[#C22973]" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <tr>
              <th className="px-10 py-6">Evento</th>
              <th className="px-6 py-6 text-center">Data</th>
              <th className="px-10 py-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={3} className="py-32 text-center"><Loader2 className="animate-spin mx-auto text-[#C22973]" size={40} /></td></tr>
            ) : eventos.length === 0 ? (
              <tr><td colSpan={3} className="py-20 text-center text-slate-400 font-bold italic">Nenhum evento encontrado.</td></tr>
            ) : (
              eventos.map((evento) => (
                <tr key={evento.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border shrink-0">
                        <img src={`${evento.imagem_capa}?t=${Date.now()}`} className="w-full h-full object-cover" onError={(e:any)=>e.target.src='https://placehold.co/400x400?text=Event'} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{evento.nome || 'Evento Linkah'}</p>
                        <p className="text-[10px] text-[#C22973] font-bold uppercase tracking-widest">{evento.categoria}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center text-xs font-bold text-slate-700">{formatarDataLocal(evento.data_inicio)}</td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => abrirModalEdicao(evento)} className="p-3 text-slate-400 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-all"><Edit3 size={18} /></button>
                      <button onClick={() => router.push(`/dashboard/eventos/novo/ingressos/${evento.id}`)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Ticket size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isEditModalOpen && eventoParaEditar && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 border-b bg-slate-50/50 flex justify-between items-center">
              <h2 className="text-xl font-bold">Editar Dados</h2>
              <button onClick={() => setIsEditModalOpen(false)}><X size={24} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleSalvarEdicao} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Imagem de Capa</label>
                <div onClick={() => fileInputRef.current?.click()} className="relative w-full h-52 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer overflow-hidden">
                  {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <Upload className="text-slate-300" />}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Nome do Evento</label>
                <input required className="w-full bg-slate-50 border p-4 rounded-xl font-bold text-slate-900" value={eventoParaEditar.nome || ''} onChange={(e) => setEventoParaEditar({ ...eventoParaEditar, nome: e.target.value })} />
              </div>
              <button type="submit" disabled={saving} className="w-full bg-slate-950 text-white py-5 rounded-2xl font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-3">
                {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} className="text-[#C22973]" /> Salvar na AWS</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}