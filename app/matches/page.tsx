'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [cidadeUser, setCidadeUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    async function carregarMatches() {
      try {
        const response = await fetch('http://localhost:3001/api/onboarding/matches', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 400) {
            // Se não respondeu onboarding ainda, joga pra lá
            router.push('/onboarding');
            return;
          }
          throw new Error(data.error || 'Erro ao carregar conexões');
        }

        setMatches(data.matches || []);
        setCidadeUser(data.cidade || '');
      } refactored: {
        // tratamento de erro padrão abaixo
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    carregarMatches();
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Conexões na sua região</h1>
            <p className="text-zinc-400 mt-1 text-sm">
              Pessoas com interesses parecidos em <span className="text-indigo-400 font-medium">{cidadeUser || 'sua cidade'}</span>
            </p>
          </div>
          <button
            onClick={() => router.push('/onboarding')}
            className="text-xs bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 py-2 px-4 rounded-lg transition-colors"
          >
            Refazer Onboarding
          </button>
        </div>

        {loading && (
          <div className="text-center py-20 text-zinc-500 animate-pulse">
            Buscando conexões compatíveis...
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg mb-6">
            {error}
          </div>
        )}

        {!loading && matches.length === 0 && (
          <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
            <p className="text-zinc-400">Nenhum match encontrado no momento.</p>
            <p className="text-zinc-600 text-sm mt-1">Volte mais tarde quando mais pessoas entrarem na sua cidade!</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map((match) => (
            <div key={match.user_id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-all">
              <div>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 text-lg">
                    {match.avatar ? (
                      <img src={match.avatar} alt={match.nome} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      match.nome?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white">{match.nome}</h3>
                    <p className="text-xs text-zinc-400">{match.setor || 'Membro Linkah'}</p>
                  </div>
                </div>

                <p className="text-sm text-zinc-300 mb-4 line-clamp-2">
                  {match.bio || 'Sem biografia cadastrada.'}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  <span className="text-[11px] bg-zinc-950 text-zinc-400 border border-zinc-800 px-2.5 py-1 rounded-md">
                    🎬 {match.genero_filme}
                  </span>
                  <span className="text-[11px] bg-zinc-950 text-zinc-400 border border-zinc-800 px-2.5 py-1 rounded-md">
                    🧠 {match.personalidade}
                  </span>
                </div>
              </div>

              <button
                onClick={() => alert(`Enviar mensagem ou conectar com ${match.nome}`)}
                className="w-full bg-zinc-800 hover:bg-indigo-600 text-zinc-200 hover:text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                Conectar-se
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}