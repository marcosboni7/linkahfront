'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Settings, X } from 'lucide-react';

export default function AvisoCadastro() {
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    const verificarPerfil = () => {
      try {
        const perfilCompleto = localStorage.getItem('perfil_completo');

        if (!ativo) return;

        if (perfilCompleto === 'true') {
          setMostrarAviso(false);
        } else {
          setMostrarAviso(true);
        }
      } catch (error) {
        console.error('❌ Erro ao verificar perfil_completo:', error);
        if (ativo) {
          setMostrarAviso(true);
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    };

    verificarPerfil();

    return () => {
      ativo = false;
    };
  }, []);

  const handleIrParaPerfil = () => {
    setMostrarAviso(false);
    setTimeout(() => {
      window.location.href = '/dashboard/perfil?editar=true';
    }, 50);
  };

  const handleFechar = () => {
    setMostrarAviso(false);
  };

  if (carregando) return null;
  if (!mostrarAviso) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[9998]" />

      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-8 relative animate-in fade-in zoom-in duration-200 pointer-events-auto">
          <button
            type="button"
            onClick={handleFechar}
            className="absolute top-4 right-4 w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition cursor-pointer z-10"
          >
            <X size={18} className="text-slate-500" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mb-6">
            <AlertCircle className="text-amber-500" size={28} />
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 tracking-tight">
            Complete seu perfil
          </h2>

          <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-8">
            Antes de continuar, configure seus dados para liberar todos os recursos da plataforma.
            Depois que salvar uma vez, esse aviso não aparece mais sozinho.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={handleIrParaPerfil}
              className="flex-1 bg-[#C22973] text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 hover:opacity-90 transition cursor-pointer z-10 relative"
            >
              <Settings size={18} />
              Configurar meus dados
            </button>

            <button
              type="button"
              onClick={handleFechar}
              className="flex-1 bg-slate-100 text-slate-700 rounded-2xl py-4 font-bold hover:bg-slate-200 transition cursor-pointer z-10 relative"
            >
              Agora não
            </button>
          </div>
        </div>
      </div>
    </>
  );
}