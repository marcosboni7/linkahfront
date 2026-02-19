'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function NovoEvento() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nome: '', data: '', local: '', cidade: '', estado: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://linkah-api.onrender.com/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        // Pega o ID que veio do banco de dados (id ou _id)
        const eventoId = data.id || data._id || (data.evento && (data.evento.id || data.evento._id));

        if (eventoId) {
          // Manda para a URL com o ID real
          router.push(`/dashboard/eventos/${eventoId}/ingressos`);
        } else {
          Swal.fire('Erro', 'Evento criado, mas ID não retornado.', 'error');
        }
      } else {
        Swal.fire('Erro', 'Falha ao criar evento.', 'error');
      }
    } catch (error) {
      Swal.fire('Erro', 'Erro de conexão.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10">
      <div className="max-w-2xl mx-auto bg-white p-10 rounded-[2.5rem] shadow-sm">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 mb-6"><ChevronLeft /> Voltar</button>
        <h1 className="text-2xl font-black mb-8 uppercase italic">Dados do Evento</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input placeholder="Nome do Evento" className="w-full p-4 bg-slate-50 border rounded-2xl" onChange={e => setForm({...form, nome: e.target.value})} required />
          <input type="date" className="w-full p-4 bg-slate-50 border rounded-2xl" onChange={e => setForm({...form, data: e.target.value})} required />
          <input placeholder="Cidade" className="w-full p-4 bg-slate-50 border rounded-2xl" onChange={e => setForm({...form, cidade: e.target.value})} required />
          <button type="submit" disabled={loading} className="w-full bg-[#C22973] text-white py-5 rounded-2xl font-black uppercase">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Próximo: Definir Ingressos'}
          </button>
        </form>
      </div>
    </div>
  );
}