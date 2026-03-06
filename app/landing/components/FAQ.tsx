'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FAQ() {
  const faqs = [
    { 
      q: "O que é a Linkah?", 
      a: "A Linkah é uma plataforma de conexão para eventos que une bilhética, comunidade pré-evento e matching por afinidade. Nosso objetivo é transformar a experiência de ir a eventos, antes, durante e depois." 
    },
    { 
      q: "Como funciona o matching por afinidade?", 
      a: "Utilizamos inteligência para conectar pessoas com interesses comuns, garantindo que você encontre a companhia ideal ou o melhor grupo de networking para o seu perfil." 
    },
    { 
      q: "Os perfis são verificados?", 
      a: "Sim! Todos os participantes passam por um processo de verificação de identidade para garantir a segurança e a confiança de toda a comunidade." 
    },
    { 
      q: "Posso usar a Linkah apenas para vender ingressos?", 
      a: "Sim! Organizadores podem usar a bilhética da Linkah, mas o grande diferencial é a comunidade pré-evento que aumenta o engajamento, a retenção e a experiência dos participantes." 
    },
    { 
      q: "A Linkah é para qualquer tipo de evento?", 
      a: "Sim. A Linkah foi criada para todos os tipos de eventos: shows, festivais, conferências, retiros, workshops e muito mais. Qualquer evento que queira oferecer uma experiência de conexão real pode usar a plataforma." 
    },
    { 
      q: "Como a Linkah garante a segurança dos participantes?", 
      a: "A Linkah combina perfis verificados, comunidades fechadas por evento, matching por afinidade e ambiente moderado para criar uma experiência segura e confiável do início ao fim." 
    },
  ];

  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        {/* Título com a tipografia e degradê exatos da imagem */}
        <h2 className="text-[42px] font-bold text-center mb-16 tracking-tight text-[#1a1a1a]">
          Perguntas <span className="text-[#ff4d6d]">frequentes</span>
        </h2>
        
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div 
              key={i} 
              className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm transition-all"
            >
              <button 
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-slate-50/50 transition-colors"
              >
                <span className="font-bold text-[#1a1a1a] text-[15px] tracking-tight">{f.q}</span>
                {open === i ? (
                  <ChevronUp size={18} className="text-slate-400" />
                ) : (
                  <ChevronDown size={18} className="text-slate-400" />
                )}
              </button>
              
              <div 
                className={`grid transition-all duration-300 ease-in-out ${
                  open === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="p-6 pt-0 text-slate-500 text-[14px] leading-relaxed">
                    {f.a}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}