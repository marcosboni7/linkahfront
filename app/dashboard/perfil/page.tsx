'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCircle, Save, Loader2, ArrowLeft, Info } from 'lucide-react';
import Swal from 'sweetalert2';
import Link from 'next/link';

export default function PerfilPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
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
    // BLOQUEIO: Se o navegador já sabe que o perfil está ok, manda para eventos
    const jaCompletou = localStorage.getItem('perfil_completo');
    if (jaCompletou === 'true') {
      router.replace('/dashboard/eventos');
      return;
    }

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

  // Validação Inline (Feedback em Tempo Real)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Se o usuário digitar, removemos o erro visual na hora
    if (value.trim() !== "" && errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação rápida antes de enviar
    const newErrors: Record<string, string> = {};
    if (!formData.nome) newErrors.nome = "Obrigatório";
    if (!formData.cpf_cnpj) newErrors.cpf_cnpj = "Obrigatório";
    if (!formData.cep) newErrors.cep = "Obrigatório";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

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
        // MARCAÇÃO: Salva que o perfil foi preenchido com sucesso
        localStorage.setItem('perfil_completo', 'true');
        localStorage.setItem('userName', formData.nome);

        await Swal.fire({
          title: '<span style="color: #C22973">✅ Perfil Atualizado!</span>',
          text: 'Suas informações foram salvas. Acesso ao painel liberado.',
          icon: 'success',
          confirmButtonColor: '#C22973',
          confirmButtonText: 'IR PARA MEUS EVENTOS',
          customClass: { popup: 'rounded-[2rem]' }
        });

        // Redireciona e impede de voltar
        router.push('/dashboard/eventos');

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
        
        <Link href="/dashboard/eventos" className="inline-flex items-center gap-2 text-slate-400 hover:text-[#C22973] transition-all mb-8 font-bold text-xs tracking-widest uppercase">
          <ArrowLeft size={16} /> Painel de Controle
        </Link>

        <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 p-8 md:p-12 border border-white">
          <div className="flex items-center gap-5 mb-12">
            <div className="w-16 h-16 bg-pink-50 rounded-[1.5rem] flex items-center justify-center">
              <UserCircle className="text-[#C22973]" size={35} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 leading-none tracking-tight">Finalizar Cadastro</h2>
              <p className="text-slate-400 mt-2 font-medium">Complete seu perfil para gerenciar eventos</p>
            </div>
          </div>
          
          <form onSubmit={handleSalvar} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="group">
                <label className={`text-[11px] font-black uppercase tracking-[0.15em] mb-3 block ml-1 transition-colors ${errors.nome ? 'text-red-500' : 'text-slate-400 group-focus-within:text-[#C22973]'}`}>Nome Completo *</label>
                <input 
                  name="nome" 
                  value={formData.nome} 
                  onChange={handleChange} 
                  className={`w-full border-2 p-4 rounded-2xl outline-none transition-all font-bold ${errors.nome ? 'border-red-200 bg-red-50' : 'border-slate-50 bg-slate-50/80 focus:border-[#C22973] focus:bg-white'}`} 
                />
              </div>
              <div className="group">
                <label className={`text-[11px] font-black uppercase tracking-[0.15em] mb-3 block ml-1 transition-colors ${errors.cpf_cnpj ? 'text-red-500' : 'text-slate-400 group-focus-within:text-[#C22973]'}`}>Documento (CPF/CNPJ) *</label>
                <input 
                  name="cpf_cnpj" 
                  value={formData.cpf_cnpj} 
                  onChange={handleChange} 
                  className={`w-full border-2 p-4 rounded-2xl outline-none transition-all font-bold ${errors.cpf_cnpj ? 'border-red-200 bg-red-50' : 'border-slate-50 bg-slate-50/80 focus:border-[#C22973] focus:bg-white'}`} 
                />
              </div>
            </div>

            <div className="pt-10 border-t border-slate-100 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-slate-900 font-black text-lg uppercase tracking-tight">Localização</h3>
                <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-full font-bold text-slate-500 uppercase">Endereço de Faturamento</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="col-span-1">
                  <label className="text-[11px] text-slate-400 font-black uppercase tracking-[0.15em] mb-3 block">CEP *</label>
                  <input name="cep" value={formData.cep} onChange={handleChange} className="w-full border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-[#C22973] bg-slate-50/80 font-bold" />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] text-slate-400 font-black uppercase tracking-[0.15em] mb-3 block">Rua *</label>
                  <input name="rua" value={formData.rua} onChange={handleChange} className="w-full border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-[#C22973] bg-slate-50/80 font-bold" />
                </div>
                <div className="col-span-1">
                  <label className="text-[11px] text-slate-400 font-black uppercase tracking-[0.15em] mb-3 block">Número</label>
                  <input name="numero" value={formData.numero} onChange={handleChange} className="w-full border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-[#C22973] bg-slate-50/80 font-bold" />
                </div>
              </div>
            </div>

            <div className="bg-pink-50 p-6 rounded-[2rem] flex gap-4 items-start border border-pink-100">
              <Info className="text-[#C22973] shrink-0" size={20} />
              <p className="text-[12px] text-pink-900 font-medium leading-relaxed">
                <strong>Por que pedimos isso?</strong> Seus dados de localização e documento são necessários para a emissão de notas fiscais e processamento seguro dos seus recebimentos.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={isSaving} 
              className="w-full bg-[#C22973] text-white py-6 rounded-2xl font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-[#a62262] transition-all shadow-xl shadow-pink-100 disabled:opacity-50 active:scale-95"
            >
              {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />} 
              Concluir Perfil
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}