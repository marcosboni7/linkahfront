'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Edit3,
  X,
  Loader2,
  Ticket,
  Upload,
  ChevronDown,
  Search,
  Sparkles,
  Globe,
  MapPin,
  Calendar
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL = 'https://api-linkah.onrender.com';
const CLOUDINARY_CLOUD_NAME = 'dj32txsol';

const CATEGORIAS_VALIDAS = [
  'Arte & Cultura',
  'Entretenimento',
  'Negócios',
  'Educação & Desenvolvimento',
  'Esportes & Bem-estar',
  'Experiências & Lifestyle',
  'Família & Comunidade'
];

// Helpers de Formatação
function formatDateToInput(dateValue: any): string {
  if (!dateValue) return '';

  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }

  if (typeof dateValue === 'string' && dateValue.includes('T')) {
    return dateValue.split('T')[0];
  }

  const d = new Date(dateValue);
  if (!isNaN(d.getTime())) {
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  return '';
}

function formatDateToBR(dateValue: any): string {
  if (!dateValue) return 'A definir';
  const data = formatDateToInput(dateValue);
  if (!data) return 'A definir';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
}

function formatDateToBackend(dateValue: any): string {
  if (!dateValue) return '';

  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }

  const d = new Date(dateValue);
  if (!isNaN(d.getTime())) {
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  return '';
}

export default function TabelaEventos() {
  const { t }: any = useLanguage();
  const [eventos, setEventos] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [eventoParaEditar, setEventoParaEditar] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const eventosFiltrados = eventos.filter((evento) =>
    evento.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    evento.categoria?.toLowerCase().includes(busca.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validarImagem = (url: any) => {
    if (!url || url === 'null' || url === 'undefined' || String(url).includes('[object Object]')) {
      return 'https://placehold.co/600x400/f1f5f9/94a3b8?text=Sem+Capa';
    }

    const valor = String(url).trim();

    if (valor.startsWith('http://') || valor.startsWith('https://')) {
      return valor;
    }

    if (valor.startsWith('linkah/eventos/')) {
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${valor}`;
    }

    return `${API_URL}/uploads/${valor}`;
  };

  const carregarEventos = async () => {
    setLoading(true);
    try {
      const rawToken = localStorage.getItem('@Linkah:Token');
      const token = rawToken?.replace(/['"]+/g, '').trim() || '';
      const userRaw = localStorage.getItem('@Linkah:User');
      let emailProdutor = '';

      if (userRaw) {
        const userObj = JSON.parse(userRaw);
        emailProdutor = userObj.email || userObj.user?.email || '';
      }

      if (!emailProdutor) {
        emailProdutor = localStorage.getItem('userEmail') || '';
      }

      const res = await fetch(
        `${API_URL}/api/eventos/listar?email=${encodeURIComponent(emailProdutor.toLowerCase())}&t=${Date.now()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      if (res.ok) {
        setEventos(Array.isArray(data) ? data : []);
      } else {
        console.error('Erro ao listar eventos:', data);
      }
    } catch (err) {
      console.error('Erro ao carregar:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEventos();
  }, []);

  const abrirModalEdicao = (evento: any) => {
    setEventoParaEditar({
      ...evento,
      categoria: evento.categoria || CATEGORIAS_VALIDAS[0],
      nome: evento.nome || '',
      descricao: evento.descricao || '',
      local_nome: evento.local_nome || '',
      data_inicio: formatDateToInput(evento.data_inicio),
      imagem_capa: evento.imagem_capa || '',
    });

    setPreviewUrl(validarImagem(evento.imagem_capa));
    setSelectedFile(null);
    setIsEditModalOpen(true);
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const rawToken = localStorage.getItem('@Linkah:Token');
      const token = rawToken?.replace(/['"]+/g, '').trim() || '';
      const formData = new FormData();

      formData.append('nome', eventoParaEditar.nome || '');
      formData.append('categoria', eventoParaEditar.categoria || '');
      formData.append('descricao', eventoParaEditar.descricao || '');
      formData.append('local_nome', eventoParaEditar.local_nome || '');

      const dataInicioFormatada = formatDateToBackend(eventoParaEditar.data_inicio);
      if (dataInicioFormatada) {
        formData.append('data_inicio', dataInicioFormatada);
      }

      if (selectedFile) {
        formData.append('imagem_capa', selectedFile);
      } else if (eventoParaEditar.imagem_capa) {
        formData.append('imagem_capa', eventoParaEditar.imagem_capa);
      }

      const res = await fetch(`${API_URL}/api/eventos/${eventoParaEditar.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const responseData = await res.json();

      if (res.ok) {
        setIsEditModalOpen(false);
        Swal.fire({
          title: 'Sucesso!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        carregarEventos();
      } else {
        throw new Error(responseData.error || 'Erro ao salvar alterações');
      }
    } catch (err: any) {
      console.error('Erro ao salvar:', err);
      Swal.fire({
        title: 'Erro',
        text: err.message || 'Erro ao salvar',
        icon: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 relative">
      <div className="p-10 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-[#C22973] font-black uppercase text-[10px] tracking-[0.3em] mb-1 italic">
            Gestão de Experiências
          </h2>
          <p className="text-slate-900 font-black text-2xl tracking-tighter uppercase italic">
            Meus Eventos
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full sm:w-72 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#C22973]" size={16} />
            <input
              type="text"
              placeholder="Buscar evento..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-bold outline-none focus:bg-white transition-all"
            />
          </div>

          <div className="relative w-full sm:w-auto" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full bg-slate-950 text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#C22973] transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
            >
              <Sparkles size={14} className="text-pink-400" />
              Criar Evento
              <ChevronDown size={14} className={showDropdown ? 'rotate-180' : ''} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-4 w-72 bg-white rounded-[2.5rem] shadow-2xl border border-slate-50 p-6 z-[100] animate-in fade-in zoom-in duration-200">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2 italic">
                  Selecione o Formato
                </p>
                <div className="grid gap-3">
                  <button
                    onClick={() => router.push(`/dashboard/eventos/novo/presencial`)}
                    className="w-full flex items-center gap-4 p-4 bg-slate-50 hover:bg-[#C22973] hover:text-white rounded-2xl transition-all group text-left"
                  >
                    <div className="w-10 h-10 bg-white text-[#C22973] rounded-xl flex items-center justify-center shadow-sm group-hover:bg-pink-100">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-wider">Presencial</span>
                      <span className="block text-[8px] opacity-60 font-bold italic">Encontro Físico</span>
                    </div>
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/eventos/novo/online`)}
                    className="w-full flex items-center gap-4 p-4 bg-slate-50 hover:bg-blue-600 hover:text-white rounded-2xl transition-all group text-left"
                  >
                    <div className="w-10 h-10 bg-white text-blue-600 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-blue-100">
                      <Globe size={18} />
                    </div>
                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-wider">Online</span>
                      <span className="block text-[8px] opacity-60 font-bold italic">Live / Digital</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-b-[3rem]">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">
            <tr>
              <th className="px-10 py-6 italic">Evento & Vibe</th>
              <th className="px-6 py-6 text-center italic">Performance</th>
              <th className="px-6 py-6 text-center italic">Status</th>
              <th className="px-10 py-6 text-right italic">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-32 text-center">
                  <Loader2 className="animate-spin mx-auto text-[#C22973]" size={40} />
                </td>
              </tr>
            ) : (
              eventosFiltrados.map((evento) => (
                <tr key={evento.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                      <img
                        src={validarImagem(evento.imagem_capa)}
                        className="w-16 h-16 rounded-[1.3rem] object-cover shadow-md"
                        alt=""
                      />
                      <div>
                        <p className="font-black text-slate-900 text-lg tracking-tight mb-1">{evento.nome}</p>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-tighter ${
                              evento.tipo === 'Online' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {evento.tipo || 'Presencial'}
                          </span>
                          <span className="text-[9px] text-[#C22973] font-black uppercase tracking-widest">
                            {evento.categoria}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-slate-400">
                          <Calendar size={10} />
                          <span className="text-[9px] font-bold uppercase italic">
                            {formatDateToBR(evento.data_inicio)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-8 text-center font-black text-xl">{evento.vendas_count || 0}</td>
                  <td className="px-6 py-8 text-center">
                    <span className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-[8px] font-black uppercase">
                      Ativo
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => abrirModalEdicao(evento)}
                        className="w-11 h-11 bg-white border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:text-black transition-all shadow-sm"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/eventos/novo/ingressos/${evento.id}`)}
                        className="w-11 h-11 bg-white border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:text-blue-600 transition-all shadow-sm"
                      >
                        <Ticket size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isEditModalOpen && eventoParaEditar && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-black text-2xl uppercase italic text-slate-900">Editar Experiência</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvarEdicao} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase italic ml-2">
                    Capa Visual
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square bg-slate-50 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex items-center justify-center cursor-pointer overflow-hidden relative group"
                  >
                    {previewUrl ? (
                      <img src={previewUrl} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" alt="" />
                    ) : (
                      <Upload size={40} className="text-slate-200" />
                    )}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="text-white" />
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e: any) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        setPreviewUrl(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase italic ml-2">
                      Nome do Evento
                    </label>
                    <input
                      className="w-full p-4 bg-slate-50 rounded-xl font-bold outline-none border border-transparent focus:border-pink-200"
                      value={eventoParaEditar.nome || ''}
                      onChange={(e) => setEventoParaEditar({ ...eventoParaEditar, nome: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase italic ml-2">
                      Categoria
                    </label>
                    <select
                      className="w-full p-4 bg-slate-50 rounded-xl font-bold outline-none border border-transparent focus:border-pink-200"
                      value={eventoParaEditar.categoria}
                      onChange={(e) => setEventoParaEditar({ ...eventoParaEditar, categoria: e.target.value })}
                    >
                      {CATEGORIAS_VALIDAS.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase italic ml-2">
                      Data de Início
                    </label>
                    <input
                      type="date"
                      className="w-full p-4 bg-slate-50 rounded-xl font-bold outline-none border border-transparent focus:border-pink-200"
                      value={eventoParaEditar.data_inicio || ''}
                      onChange={(e) => setEventoParaEditar({ ...eventoParaEditar, data_inicio: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase italic ml-2">
                      {eventoParaEditar.tipo === 'Online' ? 'Link da Reunião' : 'Local do Evento'}
                    </label>
                    <input
                      className="w-full p-4 bg-slate-50 rounded-xl font-bold outline-none border border-transparent focus:border-pink-200"
                      value={eventoParaEditar.local_nome || ''}
                      onChange={(e) => setEventoParaEditar({ ...eventoParaEditar, local_nome: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase italic ml-2">
                  Descrição da Experiência
                </label>
                <textarea
                  className="w-full p-5 bg-slate-50 rounded-2xl font-bold outline-none min-h-[100px] resize-none border border-transparent focus:border-pink-200"
                  value={eventoParaEditar.descricao || ''}
                  onChange={(e) => setEventoParaEditar({ ...eventoParaEditar, descricao: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-slate-950 text-white p-6 rounded-[1.8rem] font-black uppercase text-xs tracking-[0.3em] hover:bg-[#C22973] transition-all shadow-2xl flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : 'Confirmar Alterações'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}