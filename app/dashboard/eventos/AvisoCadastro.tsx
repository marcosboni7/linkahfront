'use client';

import { useRouter } from 'next/navigation';

// Tipagem correta para a prop onClose
interface AvisoCadastroProps {
  onClose: () => void;  // Definindo que onClose é uma função que não retorna nada
}

export default function AvisoCadastro({ onClose }: AvisoCadastroProps) {
  const router = useRouter();

  const handleConfigurar = () => {
    onClose();  // Chama a função de fechar o modal
    router.push('/dashboard/perfil');  // Redireciona para a página de perfil
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in duration-200">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-black text-slate-800">
              Complete seu perfil
            </h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Para continuar com a melhor experiência, configure seus dados.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Fechar aviso"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleConfigurar}
            className="flex-1 flex items-center justify-center gap-2 bg-[#4B0082] text-white rounded-2xl py-3 px-4 font-bold hover:opacity-90 transition-all"
          >
            Configurar meus dados
          </button>

          <button
            onClick={onClose}
            className="flex-1 border border-slate-200 text-slate-700 rounded-2xl py-3 px-4 font-bold hover:bg-slate-50 transition-all"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
}