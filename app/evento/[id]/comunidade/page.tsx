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

  // 1. Carregar usuário logado
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('user');
    if (usuarioSalvo) {
      setDadosUsuario(JSON.parse(usuarioSalvo));
    } else {
      setDadosUsuario({ nome: 'Visitante' });
    }
  }, []);

  // 2. Buscar mensagens (Forçando conversão de ID)
  const carregarMensagens = async () => {
    if (!id) return;
    try {
      const idNumerico = parseInt(String(id));
      const res = await fetch(`https://linkah-api.onrender.com/api/comunidade/${idNumerico}`);
      
      if (res.ok) {
        const data = await res.json();
        console.log("Mensagens carregadas:", data); // Olhe isso no F12
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

  // 3. Enviar Mensagem com confirmação
  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTexto.trim() || !dadosUsuario) return;

    const textoEnviar = novoTexto;
    const idEvento = parseInt(String(id));
    setNovoTexto(''); 

    console.log("Enviando para ID:", idEvento);

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
        console.log("Mensagem enviada com sucesso!");
        await carregarMensagens(); // Busca a lista atualizada imediatamente
      } else {
        const erro = await res.json();
        alert("Erro no banco: " + (erro.error || "Falha ao salvar"));
        setNovoTexto(textoEnviar);
      }
    } catch (err) {
      console.error("Erro na conexão:", err);
      alert("Falha na conexão com o servidor.");
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#e5ddd5] text-black">
      <header className="bg-[#075e54] p-4 shadow-md flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1 hover:bg-black/10 rounded-full">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
          <div>
            <h1 className="font-bold text-md leading-none">Chat da Comunidade</h1>
            <p className="text-[10px] opacity-75">Evento #{id}</p>
          </div>
        </div>
        <p className="text-sm font-medium">{dadosUsuario?.nome}</p>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
        {mensagens.length === 0 ? (
          <div className="flex justify-center mt-10">
            <p className="bg-white/80 px-4 py-2 rounded-lg text-sm text-gray-500 shadow-sm border border-gray-200">
              Nenhuma mensagem por enquanto...
            </p>
          </div>
        ) : (
          mensagens.map((msg, index) => {
            const souEu = msg.usuario_nome === dadosUsuario?.nome;
            return (
              <div key={index} className={`flex ${souEu ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-1.5 rounded-lg shadow-sm relative ${
                  souEu ? 'bg-[#dcf8c6] rounded-tr-none' : 'bg-white rounded-tl-none'
                }`}>
                  {!souEu && <p className="text-[10px] font-bold text-purple-600 mb-0.5">{msg.usuario_nome}</p>}
                  <p className="text-[14.5px] leading-tight pr-10">{msg.texto}</p>
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
            type="text"
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
            placeholder="Digite sua mensagem"
            className="flex-1 bg-white border-none rounded-full px-5 py-2.5 focus:ring-1 focus:ring-green-500 outline-none text-sm shadow-sm"
          />
          <button 
            type="submit" 
            disabled={!novoTexto.trim()}
            className="bg-[#075e54] text-white p-3 rounded-full hover:bg-[#128c7e] transition-colors disabled:opacity-50 shadow-md"
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