import { Star } from 'lucide-react';

export default function Testimonials() {
  const stats = [
    { value: "100%", label: "completaram o fluxo" },
    { value: "100%", label: "repetiriam a experiência" },
    { value: "100%", label: "matches bem sucedidos" },
  ];

  const reviews = [
    {
      name: "Rafael Melo",
      role: "Participante",
      text: "A Linkah mudou minha forma de ir a eventos. Pela primeira vez, me senti seguro e conectado antes mesmo de chegar."
    },
    {
      name: "Camila Reis",
      role: "Participante",
      text: "Encontrei não só companhia de viagem, mas amigos para a vida. A plataforma é incrível!"
    },
    {
      name: "Andrea Araujo",
      role: "Organizadora",
      text: "Como organizadora, vi o engajamento triplicar. Os participantes chegam prontos para viver o evento."
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Seção de Estatísticas (Stats) baseada na imagem */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20 text-center">
          {stats.map((stat, i) => (
            <div key={i} className="flex flex-col gap-2">
              <span className="text-[64px] font-bold text-[#ff4d6d] leading-none tracking-tighter">
                {stat.value}
              </span>
              <span className="text-slate-500 text-sm font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Grid de Depoimentos (Reviews) */}
        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <div key={i} className="bg-white p-8 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
              <div>
                {/* Estrelas laranjas conforme a imagem */}
                <div className="flex gap-1 text-[#ff8c66] mb-6">
                  {[...Array(5)].map((_, starIdx) => (
                    <Star key={starIdx} fill="currentColor" size={16} strokeWidth={0} />
                  ))}
                </div>
                
                <p className="text-slate-600 text-[15px] leading-relaxed mb-8 italic">
                  "{r.text}"
                </p>
              </div>
              
              <div>
                <h4 className="font-bold text-[#1a1a1a] text-sm">
                  {r.name}
                </h4>
                <span className="text-[11px] text-slate-400 font-medium">
                  {r.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}