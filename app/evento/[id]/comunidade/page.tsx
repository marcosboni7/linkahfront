'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function SalaComunidade() {
  const { id } = useParams();
  const router = useRouter();
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [novoTexto, setNovoTexto] = useState('');
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('user');
    if (usuarioSalvo) {
      setDadosUsuario(JSON.parse(usuarioSalvo));
    } else {
      setDadosUsuario({ nome: 'Visitante' });
    }
  }, []);

  const carregarMensagens = async () => {
    try {
      const res = await fetch(`https://linkah-api.onrender.com/api/comunidade/${id}`);
      if (res.ok) {
        const data = await res.json();
        setMensagens(data);
      }
    } catch (err) {
      console.error("Erro ao carregar mensagens:", err);
    }
  };

  useEffect(() => {
    carregarMensagens();
    const interval = setInterval(carregarMensagens, 4000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTexto.trim() || !dadosUsuario) return;

    // 1. Criamos a mensagem localmente para aparecer instantaneamente
    const mensagemOtimista = {
      usuario_nome: dadosUsuario.nome,
      texto: novoTexto,
      criado_at: new Date().toISOString(),
      enviando: true // Marcador visual opcional
    };

    setMensagens((prev) => [...prev, mensagemOtimista]);
    const textoParaEnviar = novoTexto;
    setNovoTexto('');

    const payload = {
      evento_id: Number(id), // CONVERSÃO PARA NÚMERO (Importante!)
      usuario_nome: dadosUsuario.nome,
      texto: textoParaEnviar
    };

    try {
      const res = await fetch('https://linkah-api.onrender.com/api/comunidade/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const erro = await res.json();
        alert(`Erro do servidor: ${erro.error || 'Falha ao salvar'}`);
        // Remove a mensagem otimista se der erro
        carregarMensagens();
      } else {
        carregarMensagens(); // Sincroniza com o banco
      }
    } catch (err) {
      console.error("Erro na conexão:", err);
      alert("Erro de conexão com o servidor!");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f0f2f5] text-black">
      <header className="bg-white p-4 shadow-sm border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-purple-600 font-bold">← Voltar</button>
          <h1 className="font-bold text-lg">Comunidade do Evento</h1>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">ID #{id}</p>
          <p className="text-sm font-medium text-gray-700">{dadosUsuario?.nome}</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {mensagens.map((msg, index) => {
          const souEu = msg.usuario_nome === dadosUsuario?.nome;
          return (
            <div key={index} className={`flex flex-col ${souEu ? 'items-end' : 'items-start'}`}>
              <span className="text-[11px] text-gray-500 mb-1 px-2">{msg.usuario_nome}</span>
              <div className={`max-w-[80%] px-4 py-2 rounded-2xl shadow-sm ${
                souEu 
                  ? 'bg-purple-600 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
              } ${msg.enviando ? 'opacity-70' : ''}`}>
                <p className="text-[15px] leading-relaxed">{msg.texto}</p>
                <p className={`text-[9px] mt-1 text-right ${souEu ? 'text-purple-200' : 'text-gray-400'}`}>
                  {msg.criado_at ? new Date(msg.criado_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </p>
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
            placeholder="Escreva uma mensagem..."
            className="flex-1 bg-gray-100 border-none rounded-full px-6 py-3 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
          />
          <button 
            type="submit" 
            disabled={!novoTexto.trim()}
            className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 transition-all disabled:opacity-50 shadow-md"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
}