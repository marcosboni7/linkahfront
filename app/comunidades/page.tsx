'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ListaComunidades() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca os eventos da sua API existente no Render
    fetch('https://linkah-api.onrender.com/api/eventos')
      .then(res => res.json())
      .then(data => {
        setEventos(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center">Carregando salas...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Comunidades Ativas 💬</h1>
      <p className="text-gray-600 mb-8">Escolha um evento e entre na conversa!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {eventos.map((evento: any) => (
          <div key={evento.id} className="border rounded-xl p-4 shadow-sm hover:shadow-md transition">
            <h2 className="text-xl font-semibold mb-1">{evento.titulo}</h2>
            <p className="text-sm text-gray-500 mb-4">📍 {evento.local || 'Online'}</p>
            
            <Link 
              href={`/evento/${evento.id}/comunidade`}
              className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition"
            >
              Acessar Comunidade
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}