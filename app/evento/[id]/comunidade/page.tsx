'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';

export default function SalaComunidade() {
  const { id } = useParams();
  const [mensagens, setMensagens] = useState([
    { id: 1, usuario: 'Linkah Bot', texto: 'Bem-vindo à comunidade! Pode começar a conversar.', eu: false }
  ]);
  const [novoTexto, setNovoTexto] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Efeito para sempre rolar o chat para a última mensagem
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const enviarMensagem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTexto.trim()) return;

    // Aqui simulamos o envio. No próximo passo conectamos o Socket.io/Banco
    const novaMsg = {
      id: Date.now(),
      usuario: 'Você',
      texto: novoTexto,
      eu: true
    };

    setMensagens([...mensagens, novaMsg]);
    setNovoTexto('');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 text-black">
      {/* Header da Sala */}
      <header className="bg-white p-4 shadow-sm border-b flex items-center justify-between">
        <h1 className="font-bold text-lg">Chat do Evento #{id}</h1>
        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full animate-pulse">Online</span>
      </header>

      {/* Área de Mensagens */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {mensagens.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.eu ? 'items-end' : 'items-start'}`}>
            <span className="text-xs text-gray-500 mb-1 ml-1 mr-1">{msg.usuario}</span>
            <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
              msg.eu 
                ? 'bg-purple-600 text-white rounded-tr-none' 
                : 'bg-white text-black rounded-tl-none'
            }`}>
              {msg.texto}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </main>

      {/* Input de Mensagem */}
      <footer className="p-4 bg-white border-t">
        <form onSubmit={enviarMensagem} className="flex gap-2 max-w-4xl mx-auto">
          <input 
            type="text"
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 bg-gray-100 border-none rounded-full px-4 py-3 focus:ring-2 focus:ring-purple-600 outline-none"
          />
          <button 
            type="submit"
            className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 transition-colors"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
}