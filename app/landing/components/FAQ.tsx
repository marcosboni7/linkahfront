'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQ() {
  const faqs = [
    { q: "Como funciona a segurança dos perfis?", a: "Todos os perfis passam por uma validação de dados e redes sociais antes de entrarem nas comunidades exclusivas." },
    { q: "Preciso pagar para criar uma comunidade?", a: "Não! Criar eventos e comunidades é gratuito. Cobramos apenas uma pequena taxa por ingresso vendido." },
    { q: "A Linkah organiza o transporte?", a: "Nós facilitamos a conexão entre participantes para que vocês organizem caronas ou grupos de viagem com segurança dentro da plataforma." },
    { q: "Posso usar a Linkah para eventos online?", a: "Sim! A Linkah funciona perfeitamente para networking em workshops e mentorias digitais." },
  ];

  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-32 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-5xl font-black text-center mb-16 tracking-tighter text-slate-900">FAQ</h2>
        
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="border border-slate-100 rounded-3xl overflow-hidden">
              <button 
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-8 text-left hover:bg-slate-50 transition-colors"
              >
                <span className="font-black text-slate-800 uppercase tracking-tighter">{f.q}</span>
                {open === i ? <ChevronUp className="text-pink-600" /> : <ChevronDown className="text-slate-400" />}
              </button>
              {open === i && (
                <div className="p-8 pt-0 text-slate-500 font-medium leading-relaxed bg-slate-50/30">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}