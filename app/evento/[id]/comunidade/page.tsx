'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Função para gerar uma cor específica baseada no nome do usuário
const gerarCorNome = (nome: string) => {
  const cores = [
    'text-blue-600', 'text-pink-600', 'text-emerald-600', 
    'text-orange-600', 'text-purple-600', 'text-red-600', 'text-cyan-600'
  ];
  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    hash = nome.charCodeAt(i) + ((hash << 5) - hash);
  }
  return cores[Math.abs(hash) % cores.length];
};

export default function SalaComunidade() {
  const { id } = useParams();
  const router = useRouter();
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [novoTexto, setNovoTexto] = useState('');
  const [dadosUsuario, setDadosUsuario] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Carregar dados do usuário logado
  useEffect(() => {
    const user = localStorage.getItem('user');
    setDadosUsuario(user ? JSON.parse(user) : { nome: 'Visitante' });
  }, []);

  // Função para buscar mensagens no banco
  const carregarMensagens = async () => {
    if (!id) return;
    try {
      const idLimpo = parseInt(String(id));
      // Usamos timestamp (?t=) para evitar que o navegador cacheie a lista vazia
      const res = await fetch(`https://linkah-api.onrender.com/api/comunidade/${idLimpo}?t=${Date.now()}`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        setMensagens(data);
      }
    } catch (err) {
      console.error("Erro ao carregar mensagens:", err);
    }
  };

  // Polling: Atualiza a cada 3 segundos
  useEffect(() => {
    carregarMensagens();
    const interval = setInterval(carregarMensagens, 3000);
    return () => clearInterval(interval);
  }, [id]);

  // Scroll automático para a última mensagem
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  // Enviar nova mensagem
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
        setTimeout(carregarMensagens, 400);
      } else {
        setNovoTexto(msgTexto); // Devolve o texto se falhar
      }
    } catch (err) {
      console.error("Erro no envio:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#e5ddd5]">
      {/* Header Estilo WhatsApp */}
      <header className="bg-[#075e54] p-4 flex items-center justify-between text-white shadow-md shrink-0">
        <button onClick={() => router.back()} className="hover:opacity-70 transition-opacity">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-sm font-bold uppercase tracking-wide">Comunidade</h1>
          <span className="text-[10px] opacity-80">Evento #{id}</span>
        </div>
        <div className="text-[10px] bg-black/20 px-2 py-1 rounded italic">
          {dadosUsuario?.nome}
        </div>
      </header>

      {/* Área de Mensagens com Fundo de Chat */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
        {mensagens.length === 0 ? (
          <div className="text-center mt-10 text-gray-500 text-xs bg-white/80 p-3 rounded-lg mx-10 shadow-sm">
            Seja o primeiro a enviar uma mensagem nesta comunidade! ✨
          </div>
        ) : (
          mensagens.map((msg, idx) => {
            const souEu = msg.usuario_nome === dadosUsuario?.nome;
            return (
              <div key={idx} className={`flex ${souEu ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-2 rounded-xl max-w-[85%] shadow-sm relative border ${
                  souEu 
                    ? 'bg-[#dcf8c6] border-[#c7e9b0] rounded-tr-none' 
                    : 'bg-white border-gray-100 rounded-tl-none'
                }`}>
                  {!souEu && (
                    <p className={`text-[11px] font-bold mb-0.5 ${gerarCorNome(msg.usuario_nome)}`}>
                      {msg.usuario_nome}
                    </p>
                  )}
                  <p className="text-[14px] leading-tight pr-10 text-gray-800">{msg.texto}</p>
                  <p className="text-[9px] text-right text-gray-400 mt-1 absolute bottom-1 right-2">
                    {msg.criado_em ? new Date(msg.criado_em).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </main>

      {/* Rodapé de Envio */}
      <footer className="p-3 bg-gray-100 border-t shrink-0">
        <form onSubmit={enviarMensagem} className="flex gap-2 items-center">
          <input 
            type="text" 
            value={novoTexto} 
            onChange={(e) => setNovoTexto(e.target.value)}
            className="flex-1 p-2.5 rounded-full outline-none text-sm px-4 bg-white border border-gray-300 shadow-inner" 
            placeholder="Digite uma mensagem..."
          />
          <button 
            type="submit" 
            disabled={!novoTexto.trim()}
            className="bg-[#075e54] text-white w-11 h-11 rounded-full flex items-center justify-center shadow-lg hover:brightness-110 active:scale-90 transition-all disabled:opacity-50 disabled:grayscale"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" className="ml-1">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
}