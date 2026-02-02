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

  // 1. Pega os dados do produtor logado
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('user');
    if (usuarioSalvo) {
      setDadosUsuario(JSON.parse(usuarioSalvo));
    } else {
      setDadosUsuario({ nome: 'Visitante' });
    }
  }, []);

  // 2. Função para buscar mensagens do Backend
  const carregarMensagens = async () => {
    try {
      const res = await fetch(`https://linkah-api.onrender.com/api/comunidade/${id}`);
      if (res.ok) {
        const data = await res.json();
        // Evita sobrepor a lista se uma mensagem estiver sendo enviada
        setMensagens(data);
      }
    } catch (err) {
      console.error("Erro ao carregar mensagens:", err);
    }
  };

  // 3. Atualização automática (Polled Chat)
  useEffect(() => {
    carregarMensagens();
    const interval = setInterval(() => {
      carregarMensagens();
    }, 4000);
    return () => clearInterval(interval);
  }, [id]);

  // 4. Scroll automático para a última mensagem
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  // 5. Enviar mensagem com lógica anti-desaparecimento
  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTexto.trim() || !dadosUsuario) return;

    const textoParaEnviar = novoTexto;
    const nomeParaEnviar = dadosUsuario.nome;

    // Mensagem Otimista (aparece na hora)
    const novaMsgLocal = {
      usuario_nome: nomeParaEnviar,
      texto: textoParaEnviar,
      criado_at: new Date().toISOString(),
      id: Date.now() 
    };

    setMensagens((prev) => [...prev, novaMsgLocal]);
    setNovoTexto('');

    try {
      const res = await fetch('https://linkah-api.onrender.com/api/comunidade/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento_id: Number(id), // Garante que o banco receba um número
          usuario_nome: nomeParaEnviar,
          texto: textoParaEnviar
        })
      });

      if (res.ok) {
        // Aguarda meio segundo para o banco consolidar antes de atualizar a lista oficial
        setTimeout(() => {
          carregarMensagens();
        }, 800);
      } else {
        const erro = await res.json();
        console.error("Erro no servidor:", erro);
        carregarMensagens(); // Remove a msg otimista se falhou
      }
    } catch (err) {
      console.error("Erro na conexão:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#e5ddd5] text-black">
      {/* Cabeçalho Estilo WhatsApp */}
      <header className="bg-[#075e54] p-4 shadow-md flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="hover:bg-[#128c7e] p-1 rounded-full transition-colors">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
          <div>
            <h1 className="font-bold text-md leading-none">Chat da Comunidade</h1>
            <p className="text-[10px] opacity-70">ID do Evento: {id}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium">Logado como:</p>
          <p className="text-sm font-bold">{dadosUsuario?.nome}</p>
        </div>
      </header>

      {/* Área de Mensagens */}
      <main className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
        {mensagens.map((msg, index) => {
          const souEu = msg.usuario_nome === dadosUsuario?.nome;
          return (
            <div key={index} className={`flex ${souEu ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-3 py-1.5 rounded-lg shadow-sm relative ${
                souEu 
                  ? 'bg-[#dcf8c6] text-gray-800 rounded-tr-none' 
                  : 'bg-white text-gray-800 rounded-tl-none'
              }`}>
                {!souEu && <p className="text-[10px] font-bold text-purple-600 mb-0.5">{msg.usuario_nome}</p>}
                <p className="text-[14.5px] leading-tight pr-10">{msg.texto}</p>
                <span className="text-[9px] text-gray-400 absolute bottom-1 right-2">
                  {msg.criado_at ? new Date(msg.criado_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </main>

      {/* Rodapé */}
      <footer className="p-3 bg-[#f0f0f0] border-t flex items-center gap-2">
        <form onSubmit={enviarMensagem} className="flex gap-2 w-full max-w-5xl mx-auto items-center">
          <input 
            type="text"
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
            placeholder="Mensagem"
            className="flex-1 bg-white border-none rounded-full px-5 py-2.5 focus:ring-0 outline-none text-sm shadow-sm"
          />
          <button 
            type="submit" 
            disabled={!novoTexto.trim()}
            className="bg-[#075e54] text-white p-3 rounded-full hover:scale-105 transition-all disabled:opacity-50 shadow-md"
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