import { Ticket, Users, Heart, MapPin, Sparkles } from 'lucide-react';

const steps = [
  { icon: <Ticket size={28} />, label: "Compra o bilhete" },
  { icon: <Users size={28} />, label: "Entra na comunidade" },
  { icon: <Heart size={28} />, label: "Conecta por afinidade" },
  { icon: <MapPin size={28} />, label: "Organiza com segurança" },
  { icon: <Sparkles size={28} />, label: "Vive o evento conectada" },
];

export default function CommunityJourney() {
  return (
    <section className="py-24 bg-white text-center">
      <div className="max-w-7xl mx-auto px-6">
        {/* Título com cores e fontes fiéis */}
        <h2 className="text-[42px] leading-tight font-bold text-[#1a1a1a] mb-2 tracking-tight">
          Mais do que um ingresso.
        </h2>
        <h3 className="text-[42px] leading-tight font-bold text-[#ff4d6d] mb-20 tracking-tight">
          Uma comunidade segura.
        </h3>
        
        <div className="flex flex-col md:flex-row items-start justify-center gap-12 md:gap-0">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center group">
              <div className="flex flex-col items-center gap-6">
                {/* Container do Ícone com o degradê exato da imagem */}
                <div className="w-24 h-24 bg-gradient-to-br from-[#ff4d6d] via-[#ff5e4d] to-[#ff8c66] rounded-[2rem] flex items-center justify-center text-white shadow-lg shadow-orange-500/20 transform transition-transform group-hover:scale-105">
                  {step.icon}
                </div>
                
                {/* Label com tipografia ajustada */}
                <span className="text-sm font-bold text-[#1a1a1a] max-w-[140px] leading-snug tracking-tight">
                  {step.label}
                </span>
              </div>

              {/* Linha conectora vermelha sutil entre os passos */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block w-24 h-[1.5px] bg-[#ff4d6d]/30 mx-4 mt-[-45px]" />
              )}
            </div>
          ))}
        </div>
        
        {/* Texto final em itálico e fonte serifada */}
        <p className="mt-24 text-[#ff5e4d] text-[32px] font-serif italic tracking-tight">
          A experiência começa antes do evento.
        </p>
      </div>
    </section>
  );
}