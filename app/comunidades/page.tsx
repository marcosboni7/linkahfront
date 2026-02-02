'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ListaComunidades() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    // Usando a rota de vitrine que confirmamos que funciona
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
        setErro("O servidor está acordando... tente atualizar em alguns segundos.");
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xl text-purple-600 font-medium">Buscando comunidades...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-white text-black">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
          Comunidades Linkah 💬
        </h1>
        <p className="text-gray-500 text-lg">
          Converse com a galera e fique por dentro dos eventos!
        </p>
      </div>

      {erro && (
        <div className="bg-amber-50 text-amber-700 p-4 rounded-xl text-center mb-6 border border-amber-200">
          {erro}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventos.map((evento: any) => (
          <div key={evento.id} className="group border rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 bg-white border-gray-100 flex flex-col justify-between">
            <div>
              {evento.imagem_capa && (
                <img 
                  src={evento.imagem_capa} 
                  alt={evento.nome} 
                  className="w-full h-44 object-cover rounded-xl mb-4"
                />
              )}
              <h2 className="text-2xl font-bold mb-2 group-hover:text-purple-600 transition-colors">
                {evento.nome}
              </h2>
              <p className="text-gray-500 text-sm mb-6 line-clamp-2">
                {evento.descricao || "Participe da conversa oficial deste evento e tire suas dúvidas."}
              </p>
            </div>
            
            <Link 
              href={`/evento/${evento.id}/comunidade`}
              className="flex items-center justify-center w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-purple-600 transition-all shadow-lg hover:shadow-purple-200"
            >
              Entrar na Sala
            </Link>
          </div>
        ))}
      </div>

      {eventos.length === 0 && !loading && !erro && (
        <div className="text-center p-20 border-2 border-dashed rounded-3xl text-gray-400">
          Nenhuma comunidade aberta no momento. Que tal criar um evento?
        </div>
      )}
    </div>
  );
}