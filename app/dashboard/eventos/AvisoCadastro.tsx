'use client';

import { useRouter } from 'next/navigation';
import { X, Settings } from 'lucide-react';

interface AvisoCadastroProps {
  onClose: () => void;
}

export default function AvisoCadastro({ onClose }: AvisoCadastroProps) {
  const router = useRouter();

  const handleConfigurar = () => {
    onClose();
    router.push('/dashboard/perfil');
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-8 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
          aria-label="Fechar"
        >
          <X size={22} />
        </button>

        <h2 className="text-xl md:text-2xl font-black text-slate-800 pr-8">
          Complete seu perfil
        </h2>

        <p className="text-sm text-slate-500 mt-3 leading-relaxed">
          Para continuar usando a plataforma da melhor forma, configure seus dados.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleConfigurar}
            className="flex-1 flex items-center justify-center gap-2 bg-[#4B0082] text-white rounded-2xl py-3 px-4 font-bold hover:opacity-90 transition-all"
          >
            <Settings size={18} />
            Configurar meus dados
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-slate-200 text-slate-700 rounded-2xl py-3 px-4 font-bold hover:bg-slate-50 transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}