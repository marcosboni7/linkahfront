'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
      const emailLogado = localStorage.getItem('userEmail');
      
      if (!emailLogado) {
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
          title: '✅ Perfil Atualizado!',
          text: 'Suas informações foram salvas. Voltando para o painel...',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          background: '#ffffff',
          customClass: {
            popup: 'rounded-[2rem]'
          }
        });

        // Pequeno delay para o usuário ver o check de sucesso
        setTimeout(() => {
          router.push('/auth/dashboard');
        }, 2000);

      } else {
        const err = await response.json();
        Swal.fire('Ops!', err.message || 'Falha ao salvar', 'error');
      }
    } catch (error) {
      Swal.fire('Erro', 'Conexão interrompida com o servidor.', 'error');
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
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10">
      <div className="max-w-[800px] mx-auto">
        
        {/* VOLTAR PARA O DASHBOARD ESPECÍFICO */}
        <Link href="/auth/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#C22973] transition-all mb-8 font-bold text-xs tracking-widest uppercase">
          <ArrowLeft size={16} /> Painel de Controle
        </Link>

        <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 p-8 md:p-12 border border-white">
          <div className="flex items-center gap-5 mb-12">
            <div className="w-16 h-16 bg-pink-50 rounded-[1.5rem] flex items-center justify-center">
              <UserCircle className="text-[#C22973]" size={35} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 leading-none">Perfil</h2>
              <p className="text-slate-400 mt-2 font-medium">Edite suas informações profissionais</p>
            </div>
          </div>
          
          <form onSubmit={handleSalvar} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group">
                <label className="text-[11px] text-slate-400 font-black uppercase tracking-[0.15em] mb-3 block ml-1 group-focus-within:text-[#C22973] transition-colors">Nome Completo</label>
                <input name="nome" value={formData.nome} onChange={handleChange} className="w-full border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-[#C22973] focus:bg-white transition-all bg-slate-50/80 font-medium" />
              </div>
              <div className="group">
                <label className="text-[11px] text-slate-400 font-black uppercase tracking-[0.15em] mb-3 block ml-1 group-focus-within:text-[#C22973] transition-colors">Documento (CPF/CNPJ)</label>
                <input name="cpf_cnpj" value={formData.cpf_cnpj} onChange={handleChange} className="w-full border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-[#C22973] focus:bg-white transition-all bg-slate-50/80 font-medium" />
              </div>
            </div>

            <div className="pt-10 border-t border-slate-100 space-y-8">
              <h3 className="text-slate-900 font-black text-lg uppercase tracking-tight">Localização</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="col-span-1">
                  <label className="text-[11px] text-slate-400 font-black uppercase tracking-[0.15em] mb-3 block">CEP</label>
                  <input name="cep" value={formData.cep} onChange={handleChange} className="w-full border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-[#C22973] bg-slate-50/80" />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] text-slate-400 font-black uppercase tracking-[0.15em] mb-3 block">Rua</label>
                  <input name="rua" value={formData.rua} onChange={handleChange} className="w-full border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-[#C22973] bg-slate-50/80" />
                </div>
                <div className="col-span-1">
                  <label className="text-[11px] text-slate-400 font-black uppercase tracking-[0.15em] mb-3 block">Número</label>
                  <input name="numero" value={formData.numero} onChange={handleChange} className="w-full border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-[#C22973] bg-slate-50/80" />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSaving} 
              className="w-full bg-[#C22973] text-white py-6 rounded-2xl font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#a62262] hover:scale-[1.01] transition-all shadow-xl shadow-pink-200 disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />} 
              Atualizar Perfil
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}