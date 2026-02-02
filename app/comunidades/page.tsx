'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ListaComunidades() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    // Chamando a API que acabamos de ajustar
    fetch('https://linkah-api.onrender.com/api/eventos/vitrine')
      .then(res => {
        if (!res.ok) throw new Error('Erro ao carregar comunidades');
        return res.json();
      })
      .then(data => {
        setEventos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro no fetch:", err);
        setErro("Não foi possível carregar as comunidades agora.");
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-white">
      <p className="text-xl text-purple-600 animate-pulse">Buscando comunidades ativas...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-white text-black">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
          Comunidades Linkah 💬
        </h1>
        <p className="text-gray-500 text-lg">
          Entre nos chats dos eventos e conheça a galera antes mesmo de começar!
        </p>
      </div>

      {erro && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center mb-6">
          {erro}
        </div>
      )}

      {eventos.length === 0 && !erro ? (
        <div className="text-center p-20 border-2 border-dashed rounded-3xl text-gray-400">
          Nenhuma comunidade aberta no momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventos.map((evento: any) => (
            <div key={evento.id} className="group border rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 bg-white border-gray-100">
              {evento.imagem_capa && (
                <img 
                  src={evento.imagem_capa} 
                  alt={evento.nome} 
                  className="w-full h-40 object-cover rounded-xl mb-4"
                />
              )}
              <h2 className="text-2xl font-bold mb-2 group-hover:text-purple-600 transition-colors">
                {evento.nome}
              </h2>
              <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                {evento.descricao || "Participe da conversa oficial deste evento."}
              </p>
              
              <Link 
                href={`/evento/${evento.id}/comunidade`}
                className="flex items-center justify-center w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-purple-600 transition-all"
              >
                Entrar na Conversa
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}