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
    const user = localStorage.getItem('user');
    setDadosUsuario(user ? JSON.parse(user) : { nome: 'Visitante' });
  }, []);

  const carregarMensagens = async () => {
    if (!id) return;
    try {
      // Forçamos o ID a ser número para evitar lixo na URL
      const idLimpo = parseInt(String(id));
      const res = await fetch(`https://linkah-api.onrender.com/api/comunidade/${idLimpo}`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        console.log("LISTA RECEBIDA:", data);
        setMensagens(data);
      }
    } catch (err) {
      console.error("Erro ao carregar mensagens:", err);
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
    if (!novoTexto.trim()) return;

    const msgTexto = novoTexto;
    setNovoTexto(''); 

    try {
      const res = await fetch('https://linkah-api.onrender.com/api/comunidade/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento_id: parseInt(String(id)),
          usuario_nome: dadosUsuario?.nome || 'Anônimo',
          texto: msgTexto
        })
      });

      if (res.ok) {
        // Delay curto para o banco processar antes de atualizar a lista
        setTimeout(carregarMensagens, 400);
      } else {
        setNovoTexto(msgTexto);
      }
    } catch (err) {
      console.error("Erro no envio:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#e5ddd5]">
      <header className="bg-[#075e54] p-4 flex items-center justify-between text-white shadow-md shrink-0">
        <button onClick={() => router.back()} className="font-bold">← Voltar</button>
        <h1 className="text-sm font-bold">Comunidade #{id}</h1>
        <span className="text-[10px] bg-black/20 px-2 py-1 rounded">{dadosUsuario?.nome}</span>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
        {mensagens.length === 0 ? (
          <div className="text-center mt-10 text-gray-400 text-sm bg-white/50 p-4 rounded">Nenhuma mensagem aqui ainda.</div>
        ) : (
          mensagens.map((msg, idx) => {
            const souEu = msg.usuario_nome === dadosUsuario?.nome;
            return (
              <div key={idx} className={`flex ${souEu ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-2 rounded-lg max-w-[85%] shadow-sm relative ${souEu ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                  {!souEu && <p className="text-[10px] font-bold text-emerald-600 mb-0.5">{msg.usuario_nome}</p>}
                  <p className="text-[14px] leading-tight pr-8">{msg.texto}</p>
                  <p className="text-[9px] text-right text-gray-400 mt-1">
                    {msg.criado_em ? new Date(msg.criado_em).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </main>

      <footer className="p-3 bg-gray-100 border-t shrink-0">
        <form onSubmit={enviarMensagem} className="flex gap-2">
          <input 
            type="text" value={novoTexto} onChange={(e) => setNovoTexto(e.target.value)}
            className="flex-1 p-2 rounded-full outline-none text-sm px-4 bg-white border" placeholder="Digite uma mensagem"
          />
          <button 
            type="submit" 
            disabled={!novoTexto.trim()}
            className="bg-[#075e54] text-white w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
          </button>
        </form>
      </footer>
    </div>
  );
}