'use client';

import { useRouter } from 'next/navigation';

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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800">
          Complete seu perfil
        </h2>

        <p className="mt-3 text-sm text-slate-600">
          Para continuar, configure seus dados.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleConfigurar}
            className="w-full rounded-xl bg-[#4B0082] py-3 px-4 text-white font-bold"
          >
            Configurar meus dados
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-slate-300 py-3 px-4 text-slate-700 font-bold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}