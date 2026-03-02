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

  // Estados para Edição e Anexo
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventoParaEditar, setEventoParaEditar] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formatação de data para exibição
  const formatarDataLocal = (dataString: string) => {
    if (!dataString) return '---';
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString(language === 'PT' ? 'pt-BR' : 'en-US');
    } catch (e) {
      return dataString;
    }
  };

  /**
   * BUSCADOR DE E-MAIL MULTI-CAMADA
   * Tenta encontrar o e-mail do usuário em todas as chaves possíveis do LocalStorage
   */
  const buscarEmailNoStorage = () => {
    try {
      const chavesParaTestar = ['@Linkah:User', '@Linkah:user', 'user', 'userData', 'auth', 'profile'];
      
      for (const chave of chavesParaTestar) {
        const item = localStorage.getItem(chave);
        if (item) {
          const parsed = JSON.parse(item);
          // Varre diferentes estruturas de objeto comuns em sistemas de login
          const email = 
            parsed.email || 
            parsed.user?.email || 
            parsed.data?.email || 
            parsed.userData?.email || 
            parsed.attributes?.email ||
            parsed.user?.data?.email;

          if (email && typeof email === 'string' && email.includes('@')) {
            return email;
          }
        }
      }

      // Se não achou em objetos, tenta chaves de string simples
      const emailSimples = localStorage.getItem('email') || localStorage.getItem('userEmail');
      if (emailSimples && emailSimples.includes('@')) return emailSimples;

    } catch (err) {
      console.error("❌ [DEBUG] Erro ao processar LocalStorage:", err);
    }
    return null;
  };

  // FUNÇÃO PARA CARREGAR LISTA DE EVENTOS
  const carregarEventos = async () => {
    console.log("🔍 [DEBUG] Iniciando busca de eventos...");
    setLoading(true);

    try {
      const token = localStorage.getItem('@Linkah:Token') || localStorage.getItem('token') || localStorage.getItem('userToken');
      const email = buscarEmailNoStorage();
      
      console.log("📧 [DEBUG] E-mail recuperado para filtro:", email);

      if (!email) {
        console.warn("⚠️ [DEBUG] Nenhum e-mail identificado no storage. A lista pode falhar.");
      }

      // Adicionamos o timestamp (t=...) para quebrar o cache da AWS/Cloudfront
      const res = await fetch(`${API_URL}/api/eventos/listar?email=${email || ''}&t=${Date.now()}`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (res.ok) {
        const data = await res.json();
        console.log("✅ [DEBUG] Eventos carregados com sucesso:", data.length);
        setEventos(Array.isArray(data) ? [...data] : []);
      } else {
        const errorText = await res.text();
        console.error("❌ [DEBUG] Erro na resposta da API:", res.status, errorText);
        setEventos([]);
      }
    } catch (err) {
      console.error("💥 [DEBUG] Erro fatal de conexão:", err);
      setEventos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEventos();
  }, []);

  const abrirModalEdicao = (evento: any) => {
    console.log("📝 [DEBUG] Editando Evento:", evento.id);
    setEventoParaEditar({ ...evento });
    setPreviewUrl(evento.imagem_capa); 
    setSelectedFile(null);
    setIsEditModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("📸 [DEBUG] Novo arquivo selecionado:", file.name);
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // SALVAR ALTERAÇÕES (PUT)
  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    console.log("🚀 [DEBUG] Enviando atualização para AWS...");

    try {
      const token = localStorage.getItem('@Linkah:Token') || localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('nome', eventoParaEditar.nome);
      formData.append('categoria', eventoParaEditar.categoria || '');
      formData.append('data_inicio', eventoParaEditar.data_inicio);
      formData.append('moeda', eventoParaEditar.moeda || 'BRL');
      formData.append('valor_minimo', String(eventoParaEditar.valor_minimo || '0'));
      
      if (selectedFile) {
        formData.append('imagem', selectedFile);
        console.log("📎 [DEBUG] Nova imagem anexada ao envio.");
      }

      const res = await fetch(`${API_URL}/api/eventos/${eventoParaEditar.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        console.log("🎉 [DEBUG] Atualização concluída na AWS.");
        setIsEditModalOpen(false);
        
        Swal.fire({ 
          title: "Sincronizado!", 
          icon: 'success', 
          timer: 1500, 
          showConfirmButton: false,
          position: 'top-end',
          toast: true
        });

        // Delay para garantir que a AWS propagou a mudança no S3/DB
        setTimeout(() => carregarEventos(), 600);
      } else {
        console.error("❌ [DEBUG] Erro no PUT:", res.status);
        Swal.fire('Erro', 'Não foi possível salvar as alterações.', 'error');
      }
    } catch (err) {
      console.error("💥 [DEBUG] Falha ao conectar na AWS:", err);
      Swal.fire('Erro', 'Falha de conexão com o servidor.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleExcluir = async (id: number) => {
    const result = await Swal.fire({
      title: "Excluir Evento?",
      text: "Esta ação é irreversível.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#C22973',
      confirmButtonText: "Sim, excluir"
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('@Linkah:Token') || localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/eventos/${id}`, { 
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          setEventos((prev) => prev.filter((ev) => ev.id !== id));
          Swal.fire("Excluído!", "O evento foi removido da AWS.", "success");
        }
      } catch (err) {
        console.error("Erro ao deletar:", err);
      }
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden font-sans">
      
      {/* CABEÇALHO */}
      <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C22973]" />
            <h2 className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Painel Produtor</h2>
          </div>
          <p className="text-slate-950 font-bold text-2xl tracking-tighter">Meus Eventos</p>
        </div>

        <button
          onClick={() => router.push('/dashboard/eventos/novo/presencial')}
          className="bg-slate-950 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-black transition-all shadow-xl text-xs active:scale-95"
        >
          {t.newEvent || "Criar Novo Evento"}
          <ChevronDown size={18} className="text-[#C22973]" />
        </button>
      </div>

      {/* TABELA DE DADOS */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            <tr>
              <th className="px-10 py-6">Evento</th>
              <th className="px-6 py-6 text-center">Data</th>
              <th className="px-6 py-6 text-center">Moeda</th>
              <th className="px-10 py-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-32 text-center">
                  <Loader2 className="animate-spin mx-auto text-[#C22973]" size={40} />
                  <p className="mt-4 text-slate-400 text-xs font-bold uppercase tracking-widest">Sincronizando com AWS...</p>
                </td>
              </tr>
            ) : eventos.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-24 text-center">
                  <p className="text-slate-400 font-bold italic text-sm">Nenhum evento encontrado para o e-mail logado.</p>
                </td>
              </tr>
            ) : (
              eventos.map((evento) => (
                <tr key={evento.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden border border-slate-100 shrink-0">
                        {evento.imagem_capa ? (
                          <img 
                            src={`${evento.imagem_capa}?t=${Date.now()}`} 
                            className="w-full h-full object-cover" 
                            alt=""
                            onError={(e:any) => e.target.src = 'https://placehold.co/400x400?text=Linkah'}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={20} /></div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm leading-tight">{evento.nome || 'Evento sem nome'}</p>
                        <p className="text-[10px] text-[#C22973] font-bold uppercase tracking-widest mt-1">{evento.categoria}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center text-xs font-bold text-slate-700">
                    {formatarDataLocal(evento.data_inicio)}
                  </td>
                  <td className="px-6 py-6 text-center">
                    <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-emerald-50 text-emerald-600">
                      {evento.moeda || 'BRL'}
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => router.push(`/dashboard/eventos/novo/ingressos/${evento.id}`)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm"><Ticket size={18} /></button>
                      <button onClick={() => abrirModalEdicao(evento)} className="p-3 text-slate-400 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition-all shadow-sm"><Edit3 size={18} /></button>
                      <button onClick={() => handleExcluir(evento.id)} className="p-3 text-slate-400 hover:text-[#C22973] hover:bg-rose-50 rounded-xl transition-all shadow-sm"><Trash2 size={18} /></button>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in duration-200">
            
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-950 tracking-tighter">Editar Evento</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-slate-400 border border-slate-100 hover:text-rose-500 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSalvarEdicao} className="p-8 space-y-6 overflow-y-auto max-h-[75vh]">
              
              {/* COMPONENTE DE UPLOAD */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Imagem de Capa (AWS S3)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group w-full h-52 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-[#C22973] transition-all"
                >
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white" size={32} />
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto text-slate-300 mb-2" size={32} />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selecionar Arquivo</p>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>

              {/* CAMPOS DE TEXTO */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Nome do Evento</label>
                  <input 
                    required 
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none focus:bg-white focus:border-slate-950 font-bold text-slate-900 transition-all" 
                    value={eventoParaEditar.nome || ''} 
                    onChange={(e) => setEventoParaEditar({ ...eventoParaEditar, nome: e.target.value })} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Data</label>
                    <input 
                      type="date" 
                      required 
                      className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold text-slate-900 outline-none" 
                      value={eventoParaEditar.data_inicio ? eventoParaEditar.data_inicio.split('T')[0] : ''} 
                      onChange={(e) => setEventoParaEditar({ ...eventoParaEditar, data_inicio: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Categoria</label>
                    <select 
                      className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl font-bold text-slate-900 outline-none"
                      value={eventoParaEditar.categoria || ''}
                      onChange={(e) => setEventoParaEditar({ ...eventoParaEditar, categoria: e.target.value })}
                    >
                      <option value="Show">Show</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Online">Online</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={saving} 
                className="w-full bg-slate-950 text-white py-5 rounded-2xl font-bold uppercase text-xs tracking-widest shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <><Save size={18} className="text-[#C22973]" /> Confirmar Atualização</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}