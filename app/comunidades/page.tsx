'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
// Importando os componentes da sua pasta site
import { Navbar } from '../site/Navbar';
import { Footer } from '../site/Footer';

export default function ListaComunidades() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    fetch('https://linkah-api.onrender.com/api/eventos/vitrine')
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar comunidades');
        return res.json();
      })
      .then(data => {
        setEventos(data);
        setLoading(false);
      })
      .catch(err => {
        setErro("O servidor está acordando... tente atualizar em alguns segundos.");
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-screen !bg-white">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-indigo-600 font-bold tracking-widest animate-pulse">CARREGANDO...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen !bg-[#F8FAFC] !text-slate-900 font-sans">
      {/* NAVBAR IMPORTADA */}
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-6 pt-12 pb-20 w-full">
        {/* HEADER */}
        <div className="mb-12">
          <span className="text-indigo-600 font-bold text-xs uppercase tracking-[0.3em]">Explorar</span>
          <h1 className="text-4xl md:text-5xl font-black mt-2 mb-4 tracking-tight">
            Comunidades <span className="text-indigo-600">Ativas</span>
          </h1>
          <p className="text-slate-500 max-w-lg leading-relaxed">
            Conecte-se com pessoas nos melhores eventos e participe das conversas em tempo real.
          </p>
        </div>

        {erro && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-center mb-8 border border-red-100 font-medium">
            {erro}
          </div>
        )}

        {/* GRID DE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventos.map((evento: any) => (
            <div key={evento.id} className="group relative bg-white border border-slate-200 rounded-3xl overflow-hidden hover:shadow-[0_20px_50px_rgba(79,70,229,0.1)] transition-all duration-500 hover:-translate-y-2">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={evento.imagem_capa || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop'} 
                  alt={evento.nome} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur-sm text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    Live Now
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h2 className="text-xl font-bold mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {evento.nome}
                </h2>
                <p className="text-slate-500 text-sm mb-6 line-clamp-2 min-h-[40px]">
                  {evento.descricao || "Participe da conversa oficial deste evento."}
                </p>
                
                <Link 
                  href={`/evento/${evento.id}/comunidade`}
                  className="flex items-center justify-center w-full bg-slate-950 text-white py-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-lg active:scale-95 group-hover:shadow-indigo-200"
                >
                  Entrar na Comunidade
                  <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY STATE */}
        {eventos.length === 0 && !loading && !erro && (
          <div className="text-center py-24 bg-white rounded-[40px] border-2 border-dashed border-slate-200">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-slate-800">Nenhuma sala encontrada</h3>
          </div>
        )}
      </main>

      {/* FOOTER IMPORTADO */}
      <Footer />
    </div>
  );
}