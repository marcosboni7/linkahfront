'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, LogOut, Search, MapPin, 
  Trash2, Edit, Loader2, Plus, Calendar
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function PainelEventos() {
  const router = useRouter();
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const [filtro, setFiltro] = useState('');
  const apiBaseUrl = 'https://linkah-api.onrender.com';

  // PROTEÇÃO: Só entra se estiver logado
  useEffect(() => {
    const user = localStorage.getItem('@Linkah:User');
    const token = localStorage.getItem('@Linkah:Token');

    if (!user || !token) {
      router.push('/auth/login');
    } else {
      setIsChecking(false);
      carregarEventos();
    }
  }, [router]);

  const carregarEventos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiBaseUrl}/api/eventos`);
      if (res.ok) {
        const data = await res.json();
        setEventos(data);
      }
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('@Linkah:User');
    localStorage.removeItem('@Linkah:Token');
    router.push('/');
  };

  const eventosFiltrados = eventos.filter(evt => 
    evt.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
    evt.id?.toString().includes(filtro)
  );

  if (isChecking) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#C22973]" size={40} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky h-screen top-0">
        <div className="p-6 text-xl font-black text-slate-800 italic uppercase tracking-tighter">
          LINKAH <span className="text-[#C22973]">PRO</span>
        </div>
        <nav className="flex-1 px-4 mt-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm bg-[#C22973] text-white shadow-lg shadow-pink-100">
            <Calendar size={18} /> Meus Eventos
          </button>
          <button onClick={() => router.push('/dashboard/perfil')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-50">
            <Edit size={18} /> Meu Perfil
          </button>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
           <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Filtrar meus eventos..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-xs outline-none focus:border-[#C22973]"
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
           </div>
           <button 
             onClick={() => router.push('/dashboard/eventos/novo')}
             className="bg-[#C22973] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-[#a62262]"
           >
             <Plus size={16} /> Criar Evento
           </button>
        </header>

        <div className="p-8">
          <h2 className="text-2xl font-black text-slate-800 uppercase italic mb-6">Meus Eventos</h2>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="animate-spin text-[#C22973]" size={32} />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Carregando eventos...</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-8 py-4">Evento</th>
                    <th className="px-8 py-4">Localização</th>
                    <th className="px-8 py-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {eventosFiltrados.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-slate-800">{evt.nome}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">ID: #{evt.id}</p>
                      </td>
                      <td className="px-8 py-5 text-xs font-bold text-slate-600">
                        <div className="flex items-center gap-1">
                          <MapPin size={14} className="text-[#C22973]" />
                          {evt.cidade} - {evt.estado}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-center gap-3">
                          <button onClick={() => router.push(`/dashboard/eventos/editar/${evt.id}`)} className="text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-all">
                            <Edit size={18} />
                          </button>
                          <button className="text-red-400 hover:bg-red-50 p-2 rounded-lg transition-all">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}