'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';

export default function SalaComunidade() {
  const { id } = useParams();
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [novoTexto, setNovoTexto] = useState('');
  const [nomeUsuario, setNomeUsuario] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Verificar se o usuário já tem um nome salvo localmente
  useEffect(() => {
    const salvo = localStorage.getItem('linkah_nome');
    if (salvo) {
      setNomeUsuario(salvo);
    } else {
      const nome = prompt('Qual o seu nome para entrar no chat?') || 'Anônimo';
      localStorage.setItem('linkah_nome', nome);
      setNomeUsuario(nome);
    }
  }, []);

  // 2. Buscar mensagens reais do Banco de Dados
  const carregarMensagens = async () => {
    try {
      const res = await fetch(`https://linkah-api.onrender.com/api/comunidade/${id}`);
      const data = await res.json();
      setMensagens(data);
    } catch (err) {
      console.error("Erro ao carregar chat:", err);
    }
  };

  useEffect(() => {
    carregarMensagens();
    const interval = setInterval(carregarMensagens, 3000); // Atualiza a cada 3s (enquanto não usamos socket)
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  // 3. Enviar mensagem para o Backend
  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTexto.trim()) return;

    const payload = {
      evento_id: id,
      usuario_nome: nomeUsuario,
      texto: novoTexto
    };

    try {
      const res = await fetch('https://linkah-api.onrender.com/api/comunidade/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setNovoTexto('');
        carregarMensagens(); // Recarrega para mostrar a sua
      }
    } catch (err) {
      alert("Erro ao enviar mensagem!");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-black">
      <header className="bg-white p-4 shadow-sm border-b flex items-center justify-between">
        <h1 className="font-bold text-lg text-purple-600">Comunidade Linkah</h1>
        <div className="text-right">
            <p className="text-xs text-gray-400 font-mono">Evento #{id}</p>
            <p className="text-xs font-bold text-gray-600">Olá, {nomeUsuario}!</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {mensagens.map((msg, index) => {
          const souEu = msg.usuario_nome === nomeUsuario;
          return (
            <div key={index} className={`flex flex-col ${souEu ? 'items-end' : 'items-start'}`}>
              <span className="text-[10px] text-gray-400 mb-1 px-2">{msg.usuario_nome}</span>
              <div className={`max-w-[75%] p-3 rounded-2xl shadow-sm ${
                souEu ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
              }`}>
                {msg.texto}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </main>

      <footer className="p-4 bg-white border-t">
        <form onSubmit={enviarMensagem} className="flex gap-2 max-w-5xl mx-auto">
          <input 
            type="text"
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
            placeholder="Diga algo para a galera..."
            className="flex-1 bg-gray-100 border-none rounded-full px-5 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <button type="submit" className="bg-purple-600 text-white p-3 rounded-full hover:scale-105 transition-transform shadow-lg shadow-purple-200">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
}