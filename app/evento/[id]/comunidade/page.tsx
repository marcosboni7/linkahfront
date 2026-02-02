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

  // 1. Carregar usuário logado do localStorage
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('user');
    if (usuarioSalvo) {
      setDadosUsuario(JSON.parse(usuarioSalvo));
    } else {
      setDadosUsuario({ nome: 'Visitante' });
    }
  }, []);

  // 2. Buscar mensagens (Ajustado para garantir que o ID vá limpo)
  const carregarMensagens = async () => {
    if (!id) return;
    try {
      // Forçamos o ID a ser apenas o número para evitar bugs de rota
      const idLimpo = String(id).split('-')[0]; 
      const res = await fetch(`https://linkah-api.onrender.com/api/comunidade/${idLimpo}`);
      
      if (res.ok) {
        const data = await res.json();
        console.log("Mensagens recebidas do banco:", data); // Log para ver no F12
        setMensagens(data);
      }
    } catch (err) {
      console.error("Erro ao carregar chat:", err);
    }
  };

  // 3. Intervalo de atualização (3 segundos)
  useEffect(() => {
    carregarMensagens();
    const interval = setInterval(carregarMensagens, 3000);
    return () => clearInterval(interval);
  }, [id]);

  // 4. Scroll automático
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  // 5. Enviar Mensagem (Ajustado)
  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTexto.trim() || !dadosUsuario) return;

    const textoEnviar = novoTexto;
    const idEvento = Number(id); // Garante que é número

    try {
      const res = await fetch('https://linkah-api.onrender.com/api/comunidade/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento_id: idEvento,
          usuario_nome: dadosUsuario.nome,
          texto: textoEnviar
        })
      });

      if (res.ok) {
        setNovoTexto('');
        await carregarMensagens(); // Força a recarga após salvar
      } else {
        const erro = await res.json();
        alert("Erro no servidor: " + erro.error);
      }
    } catch (err) {
      console.error("Erro ao enviar:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#e5ddd5] text-black">
      <header className="bg-[#075e54] p-4 shadow-md flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
          </button>
          <div>
            <h1 className="font-bold">Comunidade</h1>
            <p className="text-[10px] opacity-70">ID #{id}</p>
          </div>
        </div>
        <p className="text-sm font-bold">{dadosUsuario?.nome}</p>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')]">
        {mensagens.length === 0 ? (
          <div className="text-center text-gray-500 mt-10 bg-white/50 p-4 rounded-lg">
            Nenhuma mensagem ainda. Comece a conversa!
          </div>
        ) : (
          mensagens.map((msg, index) => {
            const souEu = msg.usuario_nome === dadosUsuario?.nome;
            return (
              <div key={index} className={`flex ${souEu ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-1.5 rounded-lg shadow-sm relative ${souEu ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'}`}>
                  {!souEu && <p className="text-[10px] font-bold text-purple-600 mb-0.5">{msg.usuario_nome}</p>}
                  <p className="text-[14.5px] leading-tight pr-10">{msg.texto}</p>
                  <span className="text-[9px] text-gray-400 absolute bottom-1 right-2">
                    {msg.criado_at ? new Date(msg.criado_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </main>

      <footer className="p-3 bg-[#f0f0f0]">
        <form onSubmit={enviarMensagem} className="flex gap-2 max-w-5xl mx-auto">
          <input 
            type="text" 
            value={novoTexto} 
            onChange={(e) => setNovoTexto(e.target.value)} 
            placeholder="Escreva uma mensagem..." 
            className="flex-1 bg-white border-none rounded-full px-5 py-2.5 outline-none text-sm"
          />
          <button type="submit" disabled={!novoTexto.trim()} className="bg-[#075e54] text-white p-3 rounded-full">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
          </button>
        </form>
      </footer>
    </div>
  );
}