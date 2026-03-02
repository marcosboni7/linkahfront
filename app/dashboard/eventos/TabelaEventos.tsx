'use client';
//teste
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

  const carregarEventos = async () => {
    console.log("🔍 [DEBUG] Iniciando busca...");
    setLoading(true);
    
    try {
      // 1. Tentar pegar o Token
      const token = localStorage.getItem('@Linkah:Token') || localStorage.getItem('token');
      
      // 2. Mapeamento agressivo de e-mail (Debug ampliado)
      let emailEncontrado = null;
      console.log("Keys no Storage:", Object.keys(localStorage)); // Lista todas as chaves para debug
      
      const possiveisChaves = ['@Linkah:User', 'user', 'userData', 'auth'];
      for (const chave of possiveisChaves) {
        const data = localStorage.getItem(chave);
        if (data) {
          try {
            const obj = JSON.parse(data);
            emailEncontrado = obj.email || obj.user?.email || obj.data?.email;
            if (emailEncontrado) break;
          } catch (e) {}
        }
      }

      if (!emailEncontrado) emailEncontrado = localStorage.getItem('email');
      
      console.log("📧 [DEBUG] E-mail final para filtro:", emailEncontrado);

      // 3. Montar URL sem causar Erro 400
      // Se não tem e-mail, chamamos o endpoint limpo sem o parâmetro ?email=
      let url = `${API_URL}/api/eventos/listar?t=${Date.now()}`;
      if (emailEncontrado && emailEncontrado !== "null") {
        url += `&email=${encodeURIComponent(emailEncontrado)}`;
      }

      console.log("🔗 [DEBUG] URL de chamada:", url);

      const res = await fetch(url, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        console.log("✅ [DEBUG] Dados recebidos:", data);
        setEventos(Array.isArray(data) ? data : []);
      } else {
        const errorText = await res.text();
        console.error(`❌ [DEBUG] Erro ${res.status}:`, errorText);
      }
    } catch (err) {
      console.error("💥 [DEBUG] Falha catastrófica:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEventos();
  }, []);

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
        Swal.fire({ title: "Sucesso!", icon: 'success', timer: 1500, showConfirmButton: false });
        carregarEventos();
      }
    } catch (err) {
      Swal.fire('Erro', 'Falha ao atualizar', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden font-sans">
      <div className="p-10 border-b border-slate-50 flex justify-between items-center">
        <div>
          <h2 className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Gestão</h2>
          <p className="text-slate-950 font-bold text-2xl tracking-tighter">Meus Eventos</p>
        </div>
        <button onClick={() => router.push('/dashboard/eventos/novo/presencial')} className="bg-slate-950 text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-black transition-all">
          + Novo Evento
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <tr>
              <th className="px-10 py-4">Evento</th>
              <th className="px-6 py-4 text-center">Data</th>
              <th className="px-10 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={3} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-[#C22973]" /></td></tr>
            ) : eventos.length === 0 ? (
              <tr><td colSpan={3} className="py-20 text-center text-slate-400 italic">Nenhum evento para exibir.</td></tr>
            ) : (
              eventos.map((evento) => (
                <tr key={evento.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden">
                        <img src={evento.imagem_capa} className="w-full h-full object-cover" onError={(e:any)=>e.target.src='https://placehold.co/100'} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{evento.nome}</p>
                        <p className="text-[10px] text-[#C22973] font-bold">{evento.categoria}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center text-xs font-medium text-slate-600">
                    {formatarDataLocal(evento.data_inicio)}
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => abrirModalEdicao(evento)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Edit3 size={18} /></button>
                      <button onClick={() => router.push(`/dashboard/eventos/novo/ingressos/${evento.id}`)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Ticket size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE EDIÇÃO */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2rem] p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl">Editar Evento</h3>
              <button onClick={() => setIsEditModalOpen(false)}><X /></button>
            </div>
            <form onSubmit={handleSalvarEdicao} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Imagem</label>
                <div onClick={() => fileInputRef.current?.click()} className="h-32 bg-slate-50 border-2 border-dashed rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden">
                  {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <Upload className="text-slate-300" />}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Nome</label>
                <input 
                  className="w-full p-4 bg-slate-50 rounded-xl font-bold outline-none border focus:border-slate-900" 
                  value={eventoParaEditar.nome} 
                  onChange={(e) => setEventoParaEditar({...eventoParaEditar, nome: e.target.value})}
                />
              </div>
              <button type="submit" disabled={saving} className="w-full bg-[#C22973] text-white py-4 rounded-xl font-bold hover:bg-[#a01f5e] transition-all flex items-center justify-center gap-2">
                {saving ? <Loader2 className="animate-spin" size={18} /> : 'Salvar Alterações'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}