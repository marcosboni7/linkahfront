'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-linkah.onrender.com';

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [cidadeUser, setCidadeUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('@Linkah:Token');
    if (!token) {
      router.push('/login');
      return;
    }

    async function carregarMatches() {
      try {
        const response = await fetch(`${API_URL}/api/onboarding/matches`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 400) {
            router.push('/onboarding');
            return;
          }
          throw new Error(data.error || 'Erro ao carregar conexões');
        }

        setMatches(data.matches || []);
        setCidadeUser(data.cidade || '');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar conexões');
      } finally {
        setLoading(false);
      }
    }

    carregarMatches();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#fafafe] text-slate-900 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Botão de Voltar para https://linkah.eu */}
        <div className="mb-6">
          <button
            onClick={() => window.location.href = 'https://linkah.eu'}
            className="text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 py-2 px-4 rounded-full transition-colors flex items-center gap-2"
          >
            ← Voltar para o Linkah
          </button>
        </div>

        <div className="flex justify-between items-center mb-8 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Conexões na sua região</h1>
            <p className="text-slate-500 mt-1 text-sm">
              Pessoas com interesses parecidos em <span className="text-orange-600 font-medium">{cidadeUser || 'sua cidade'}</span>
            </p>
          </div>
          <button
            onClick={() => router.push('/onboarding')}
            className="text-xs bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 py-2 px-4 rounded-full transition-colors"
          >
            Refazer Onboarding
          </button>
        </div>

        {loading && (
          <div className="text-center py-20 text-slate-400 animate-pulse">
            Buscando conexões compatíveis...
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-2xl mb-6">
            {error}
          </div>
        )}

        {!loading && matches.length === 0 && (
          <div className="text-center py-20 bg-slate-50 border border-slate-200 rounded-[2rem]">
            <p className="text-slate-500">Nenhum match encontrado no momento.</p>
            <p className="text-slate-400 text-sm mt-1">Volte mais tarde quando mais pessoas entrarem na sua cidade!</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map((match: any) => (
            <div key={match.user_id} className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-orange-300 hover:shadow-sm transition-all">
              <div>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center font-bold text-orange-600 text-lg overflow-hidden">
                    {match.avatar ? (
                      <img src={match.avatar} alt={match.nome} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      match.nome?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900">{match.nome}</h3>
                    <p className="text-xs text-slate-500">{match.setor || 'Membro Linkah'}</p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {match.bio || 'Sem biografia cadastrada.'}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {match.genero_filme && (
                    <span className="text-[11px] bg-slate-50 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-full">
                      🎬 {match.genero_filme}
                    </span>
                  )}
                  {match.personalidade && (
                    <span className="text-[11px] bg-slate-50 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-full">
                      🧠 {match.personalidade}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => router.push(`/matches/chat/${match.user_id}`)}
                className="w-full bg-slate-900 hover:bg-orange-600 text-white text-sm font-medium py-2.5 rounded-full transition-colors shadow-sm"
              >
                Conectar-se (Chat)
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}