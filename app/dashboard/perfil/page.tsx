'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Importante para o redirecionamento
import { UserCircle, Save, Loader2, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function PerfilPage() {
  const router = useRouter();
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
      let emailLogado = localStorage.getItem('userEmail');
      
      if (!emailLogado) {
        // Se não tiver email no storage, manda pro login
        router.push('/auth/login');
        return;
      }

      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/perfil?email=${emailLogado}`);
        const data = await response.json();
        
        if (response.ok && data) {
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
        console.error("❌ Erro ao carregar perfil:", error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();
  }, [router]);

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
        Swal.fire({
          title: '✅ Sucesso!',
          text: 'Seu perfil foi atualizado. Vamos para o painel!',
          icon: 'success',
          confirmButtonColor: '#C22973',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'rounded-[2rem]'
          }
        }).then(() => {
          // 🚀 REDIRECIONA PARA O DASHBOARD APÓS O OK
          router.push('/dashboard');
        });
      } else {
        const err = await response.json();
        Swal.fire('Erro', err.message || 'Falha ao salvar', 'error');
      }
    } catch (error) {
      Swal.fire('Erro', 'Erro de conexão com o servidor.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#C22973]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-10">
      <div className="max-w-[800px] mx-auto">
        
        {/* BOTÃO VOLTAR */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#C22973] transition-colors mb-6 font-bold text-sm">
          <ArrowLeft size={18} /> VOLTAR AO PAINEL
        </Link>

        <div className="bg-white rounded-[2.5rem] shadow-sm p-8 md:p-12 border border-slate-200">
          <div className="flex items-center gap-4 mb-10">
            <div className="bg-pink-100 p-3 rounded-2xl">
              <UserCircle className="text-[#C22973]" size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Meus Dados</h2>
              <p className="text-slate-400 text-sm font-medium">Mantenha suas informações atualizadas</p>
            </div>
          </div>
          
          <form onSubmit={handleSalvar} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1">Nome Completo</label>
                <input name="nome" value={formData.nome} onChange={handleChange} className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-[#C22973] transition-all bg-slate-50/50" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1">CPF / CNPJ</label>
                <input name="cpf_cnpj" value={formData.cpf_cnpj} onChange={handleChange} className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-[#C22973] transition-all bg-slate-50/50" />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-slate-800 font-bold mb-6 flex items-center gap-2">Endereço de Atuação</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1">CEP</label>
                  <input name="cep" value={formData.cep} onChange={handleChange} className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-[#C22973] transition-all bg-slate-50/50" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1">Rua / Logradouro</label>
                  <input name="rua" value={formData.rua} onChange={handleChange} className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-[#C22973] transition-all bg-slate-50/50" />
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest ml-1">Nº</label>
                  <input name="numero" value={formData.numero} onChange={handleChange} className="w-full border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-[#C22973] transition-all bg-slate-50/50" />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSaving} 
              className="w-full bg-[#C22973] text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#a62262] transition-all shadow-lg shadow-pink-200 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />} 
              SALVAR ALTERAÇÕES
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}