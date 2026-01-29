'use client';

import { useState } from 'react';
import { ChevronLeft, Camera, Loader2, X, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NovoEventoOnline() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    link_transmissao: '',
    descricao: '',
    data_inicio: '',
    hora_inicio: '',
    data_termino: '',
    hora_termino: '',
    imagem_capa: '', // Aqui será guardado o texto Base64
    status: 'Ativo',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviewImage(base64);
        setFormData(prev => ({ ...prev, imagem_capa: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (value.trim() !== "") {
      setErrors(prev => ({ ...prev, [name]: false }));
    }
  };

  const validate = () => {
    const newErrors: any = {};
    if (!formData.nome.trim()) newErrors.nome = true;
    if (!formData.link_transmissao.trim()) newErrors.link_transmissao = true;
    if (!formData.categoria.trim()) newErrors.categoria = true;
    if (!formData.data_inicio) newErrors.data_inicio = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://linkah-api.onrender.com';
      const emailLogado = localStorage.getItem('userEmail');

      if (!emailLogado) {
        alert("Sessão expirada. Faça login novamente.");
        router.push('/login');
        return;
      }

      // Enviando como JSON puro
      const res = await fetch(`${apiBaseUrl}/api/eventos/novo-online`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          produtor_email: emailLogado,
          tipo: 'Online'
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/dashboard/eventos/novo/ingressos/${data.id}`);
      } else {
        alert(data.error || "Erro ao salvar.");
      }
    } catch (err) {
      alert("Erro na conexão.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* HEADER */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="text-slate-400 hover:text-[#C22973]"><ChevronLeft size={24} /></button>
          <h1 className="text-slate-800 font-black text-xl">Criar Evento Online</h1>
        </div>
        <button onClick={() => handleSubmit()} disabled={loading} className="bg-[#C22973] text-white px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-pink-100">
          {loading ? <Loader2 className="animate-spin" size={16} /> : 'AVANÇAR'}
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-12">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* COLUNA ESQUERDA - DADOS */}
          <div className="lg:col-span-8 space-y-8 bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-white">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Nome do evento</label>
                <input className={`w-full bg-slate-50 border ${errors.nome ? 'border-red-400' : 'border-slate-100'} p-5 rounded-3xl outline-none focus:border-[#C22973] font-bold text-slate-700`} placeholder="Ex: Masterclass Online" onChange={(e) => handleChange('nome', e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Link da Transmissão</label>
                <input className={`w-full bg-slate-50 border ${errors.link_transmissao ? 'border-red-400' : 'border-slate-100'} p-5 rounded-3xl outline-none focus:border-indigo-500 font-bold text-indigo-600`} placeholder="Link do Zoom, Youtube ou Meet" onChange={(e) => handleChange('link_transmissao', e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Categoria</label>
                    <select className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl outline-none font-bold text-slate-700" onChange={(e) => handleChange('categoria', e.target.value)}>
                        <option value="">Selecione</option>
                        <option value="Workshop">Workshop</option>
                        <option value="Show">Show</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Data Início</label>
                    <input type="date" className="w-full bg-slate-50 border border-slate-100 p-5 rounded-3xl outline-none font-bold text-slate-700 text-xs" onChange={(e) => handleChange('data_inicio', e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Descrição</label>
                <textarea rows={4} className="w-full bg-slate-50 border border-slate-100 p-6 rounded-[2rem] outline-none focus:border-[#C22973] font-medium text-slate-600" placeholder="Sobre o evento..." onChange={(e) => handleChange('descricao', e.target.value)} />
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA - CAPA */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-white">
              <label className="text-[10px] font-black text-slate-400 uppercase block mb-4 tracking-widest text-center">Capa do Evento</label>
              <div className="aspect-square bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 gap-4 group hover:border-[#C22973] relative overflow-hidden transition-all">
                {previewImage ? (
                  <>
                    <img src={previewImage} className="w-full h-full object-cover" alt="Preview" />
                    <button type="button" onClick={() => { setPreviewImage(null); handleChange('imagem_capa', ''); }} className="absolute top-4 right-4 bg-white p-2 rounded-full text-red-500 shadow-lg z-20"><X size={18}/></button>
                  </>
                ) : (
                  <>
                    <Camera size={28} className="group-hover:text-[#C22973]" />
                    <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-[#C22973]">Upload da Imagem</span>
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} />
                  </>
                )}
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}