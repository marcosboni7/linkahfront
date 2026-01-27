'use client';

import { useEffect, useState } from 'react';
import { UserCircle, Save, Loader2 } from 'lucide-react';

export default function PerfilPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    nome: '',
    cpf_cnpj: '',
    cep: '',
    rua: '',
    numero: '',
    bairro: ''
  });

  const apiBaseUrl = 'https://linkah-api.onrender.com';

  useEffect(() => {
    const carregarDados = async () => {
      // 1. Tenta pegar o email do localStorage
      let emailLogado = localStorage.getItem('userEmail');
      
      // Se estiver nulo, vamos forçar o seu email para teste agora
      if (!emailLogado) {
        emailLogado = 'marcosphara@gmail.com'; 
        localStorage.setItem('userEmail', emailLogado);
      }

      try {
        console.log("🔄 Buscando dados para:", emailLogado);
        const response = await fetch(`${apiBaseUrl}/api/auth/perfil?email=${emailLogado}`);
        const data = await response.json();
        
        console.log("✅ Resposta da API:", data);

        if (response.ok && data) {
          // Ajuste aqui: se os dados vierem direto no objeto 'data'
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
        console.error("❌ Erro:", error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
        alert("✅ Salvo com sucesso!");
      } else {
        const err = await response.json();
        alert("❌ Erro: " + (err.message || "Falha ao salvar"));
      }
    } catch (error) {
      alert("❌ Erro de conexão.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#C22973]" size={40} /></div>;

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-10">
      <div className="max-w-[800px] mx-auto bg-white rounded-[2rem] shadow-sm p-8">
        <h2 className="text-[#C22973] text-2xl font-bold mb-8">Dados Pessoais</h2>
        
        <form onSubmit={handleSalvar} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="text-xs text-slate-400 font-bold mb-1 block">NOME COMPLETO</label>
              <input name="nome" value={formData.nome} onChange={handleChange} className="w-full border p-4 rounded-xl outline-none focus:border-[#C22973]" />
            </div>
            <div className="relative">
              <label className="text-xs text-slate-400 font-bold mb-1 block">CPF / CNPJ</label>
              <input name="cpf_cnpj" value={formData.cpf_cnpj} onChange={handleChange} className="w-full border p-4 rounded-xl outline-none focus:border-[#C22973]" />
            </div>
          </div>

          <h2 className="text-[#C22973] text-2xl font-bold mt-10 mb-6">Endereço</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-1">
              <label className="text-xs text-slate-400 font-bold mb-1 block">CEP</label>
              <input name="cep" value={formData.cep} onChange={handleChange} className="w-full border p-4 rounded-xl outline-none focus:border-[#C22973]" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-slate-400 font-bold mb-1 block">RUA</label>
              <input name="rua" value={formData.rua} onChange={handleChange} className="w-full border p-4 rounded-xl outline-none focus:border-[#C22973]" />
            </div>
            <div className="col-span-1">
              <label className="text-xs text-slate-400 font-bold mb-1 block">Nº</label>
              <input name="numero" value={formData.numero} onChange={handleChange} className="w-full border p-4 rounded-xl outline-none focus:border-[#C22973]" />
            </div>
          </div>

          <button type="submit" disabled={isSaving} className="w-full bg-[#C22973] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#a62262] transition-all">
            {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />} 
            SALVAR ALTERAÇÕES
          </button>
        </form>
      </div>
    </div>
  );
}