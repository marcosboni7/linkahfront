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
      const res = await fetch(`https://linkah-api.onrender.com/api/comunidade/${id}`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        console.log("LISTA ATUALIZADA:", data);
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
    if (!novoTexto.trim()) return;

    const textoOld = novoTexto;
    setNovoTexto(''); 

    try {
      const res = await fetch('https://linkah-api.onrender.com/api/comunidade/enviar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          evento_id: Number(id),
          usuario_nome: dadosUsuario?.nome || 'Anônimo',
          texto: textoOld
        })
      });

      if (res.ok) {
        setTimeout(carregarMensagens, 500);
      } else {
        setNovoTexto(textoOld);
      }
    } catch (err) {
      console.error("Erro no envio:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#e5ddd5]">
      <header className="bg-[#075e54] p-4 flex items-center justify-between text-white shadow-md">
        <button onClick={() => router.back()} className="font-bold">← Voltar</button>
        <h1 className="text-sm">Evento #{id}</h1>
        <span className="text-xs">{dadosUsuario?.nome}</span>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-2">
        {mensagens.map((msg, idx) => {
          const souEu = msg.usuario_nome === dadosUsuario?.nome;
          return (
            <div key={idx} className={`flex ${souEu ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-2 rounded-lg max-w-[80%] shadow-sm ${souEu ? 'bg-[#dcf8c6]' : 'bg-white'}`}>
                {!souEu && <p className="text-[10px] font-bold text-green-700">{msg.usuario_nome}</p>}
                <p className="text-sm">{msg.texto}</p>
                <p className="text-[9px] text-right text-gray-400">
                  {msg.criado_em ? new Date(msg.criado_em).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </main>

      <footer className="p-3 bg-gray-100">
        <form onSubmit={enviarMensagem} className="flex gap-2">
          <input 
            type="text" value={novoTexto} onChange={(e) => setNovoTexto(e.target.value)}
            className="flex-1 p-2 rounded-full outline-none text-sm px-4" placeholder="Mensagem"
          />
          <button type="submit" className="bg-[#075e54] text-white px-4 rounded-full font-bold"></button>
        </form>
      </footer>
    </div>
  );
}