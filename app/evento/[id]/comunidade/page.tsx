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
    if (usuarioSalvo) setDadosUsuario(JSON.parse(usuarioSalvo));
    else setDadosUsuario({ nome: 'Visitante' });
  }, []);

  const carregarMensagens = async () => {
    if (!id) return;
    try {
      const idNumerico = Number(id);
      const res = await fetch(`https://linkah-api.onrender.com/api/comunidade/${idNumerico}`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        console.log("MENSAGENS DO BANCO:", data);
        setMensagens(data);
      }
    } catch (err) {
      console.error("Erro ao carregar:", err);
    }
  };

  useEffect(() => {
    carregarMensagens();
    const interval = setInterval(carregarMensagens, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTexto.trim() || !dadosUsuario) return;

    const textoParaEnviar = novoTexto;
    const idEvento = Number(id);
    setNovoTexto(''); 

    try {
      const res = await fetch('https://linkah-api.onrender.com/api/comunidade/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento_id: idEvento,
          usuario_nome: dadosUsuario.nome,
          texto: textoParaEnviar
        })
      });

      const confirmacao = await res.json();
      console.log("RESPOSTA DO SERVIDOR APÓS ENVIAR:", confirmacao);

      if (res.ok) {
        // Aguarda 600ms para o banco processar e busca a lista
        setTimeout(() => carregarMensagens(), 600);
      } else {
        alert("Erro no servidor: " + confirmacao.error);
        setNovoTexto(textoParaEnviar);
      }
    } catch (err) {
      console.error("Erro de conexão:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#e5ddd5]">
      <header className="bg-[#075e54] p-4 flex items-center justify-between text-white shrink-0 shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1 hover:bg-white/10 rounded-full">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
          </button>
          <h1 className="font-bold">Chat do Evento #{id}</h1>
        </div>
        <span className="text-xs opacity-80">{dadosUsuario?.nome}</span>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
        {mensagens.length === 0 ? (
          <div className="text-center mt-10 text-gray-500 bg-white/60 p-4 rounded-lg">Nada por aqui ainda...</div>
        ) : (
          mensagens.map((msg, idx) => {
            const souEu = msg.usuario_nome === dadosUsuario?.nome;
            return (
              <div key={idx} className={`flex ${souEu ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-1.5 rounded-lg shadow-sm relative ${souEu ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                  {!souEu && <p className="text-[10px] font-bold text-emerald-600">{msg.usuario_nome}</p>}
                  <p className="text-sm text-gray-800 pr-8">{msg.texto}</p>
                  <span className="text-[9px] text-gray-400 absolute bottom-1 right-2">
                    {msg.criado_at ? new Date(msg.criado_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </main>

      <footer className="p-3 bg-[#f0f0f0] border-t shrink-0">
        <form onSubmit={enviarMensagem} className="flex gap-2 max-w-5xl mx-auto">
          <input 
            type="text" value={novoTexto} onChange={(e) => setNovoTexto(e.target.value)}
            placeholder="Mensagem" className="flex-1 rounded-full px-4 py-2 outline-none text-sm shadow-inner"
          />
          <button type="submit" disabled={!novoTexto.trim()} className="bg-[#075e54] text-white p-2.5 rounded-full hover:scale-105 disabled:opacity-50 transition-all">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
          </button>
        </form>
      </footer>
    </div>
  );
}