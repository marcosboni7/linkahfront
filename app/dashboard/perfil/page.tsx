'use client';

import { useEffect, useState } from 'react';
import { UserCircle, Save, Loader2 } from 'lucide-react';

export default function PerfilPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cpf_cnpj: '',
    cep: '',
    rua: '',
    numero: '',
    bairro: ''
  });

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://linkah-api.onrender.com';

  useEffect(() => {
    const carregarDados = async () => {
      const emailLogado = localStorage.getItem('userEmail');
      
      if (!emailLogado) return;

      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/perfil?email=${emailLogado.trim().toLowerCase()}`);
        const data = await response.json();
        
        if (response.ok && data) {
          // MAPEAMENTO DIRETO: Como sua API envia o objeto direto, não use data.user
          setFormData({
            nome: data.nome || '',
            cpf_cnpj: data.cpf_cnpj || '',
            cep: data.cep || '',
            rua: data.rua || '',
            numero: data.numero || '',
            bairro: data.bairro || ''
          });
        }
      } catch (error) {
        console.error("❌ Erro ao carregar:", error);
      }
    };

    carregarDados();
  }, [apiBaseUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const emailLogado = localStorage.getItem('userEmail');

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/perfil`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email_original: emailLogado, 
          ...formData 
        }),
      });

      if (response.ok) {
        alert("✅ Dados salvos com sucesso!");
      } else {
        alert("❌ Erro ao salvar.");
      }
    } catch (error) {
      alert("❌ Erro de conexão.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <nav className="bg-white px-8 py-4 flex justify-between items-center border-b border-slate-200 shadow-sm">
        <span className="text-2xl font-black text-[#4B0082]">LİNKAH</span>
        <div className="flex items-center gap-3">
          <span className="text-slate-500 text-sm font-medium">{formData.nome || 'Carregando...'}</span>
          <UserCircle className="text-slate-300" size={32} />
        </div>
      </nav>

      <main className="max-w-[1000px] mx-auto p-6 md:p-10">
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 md:p-12">
          <h2 className="text-[#C22973] text-2xl font-bold mb-8">Dados Pessoais</h2>
          <form onSubmit={handleSalvar} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-slate-400 font-medium">Nome Completo</label>
                <input name="nome" value={formData.nome} onChange={handleChange} className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:border-[#C22973] text-slate-700 bg-white" />
              </div>
              <div className="relative">
                <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-slate-400 font-medium">CPF / CNPJ</label>
                <input name="cpf_cnpj" value={formData.cpf_cnpj} onChange={handleChange} className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:border-[#C22973] text-slate-700 bg-white" />
              </div>
            </div>

            <h2 className="text-[#C22973] text-2xl font-bold mt-12 mb-6">Endereço</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="relative">
                <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-slate-400 font-medium">CEP</label>
                <input name="cep" value={formData.cep} onChange={handleChange} className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:border-[#C22973] text-slate-700 bg-white" />
              </div>
              <div className="relative md:col-span-2">
                <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-slate-400 font-medium">Rua</label>
                <input name="rua" value={formData.rua} onChange={handleChange} className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:border-[#C22973] text-slate-700 bg-white" />
              </div>
              <div className="relative">
                <label className="absolute -top-2 left-4 bg-white px-1 text-xs text-slate-400 font-medium">Nº</label>
                <input name="numero" value={formData.numero} onChange={handleChange} className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:border-[#C22973] text-slate-700 bg-white" />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" disabled={isSaving} className="bg-[#C22973] text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#a62262] transition-all disabled:opacity-50">
                {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />} SALVAR ALTERAÇÕES
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}