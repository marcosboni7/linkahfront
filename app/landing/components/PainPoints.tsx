import { MapPin, Home, Users, Link } from 'lucide-react';

const pains = [
  { 
    icon: <MapPin size={20} />, 
    title: "Medo de ir sozinho", 
    desc: "Sem saber como chegar, onde ficar ou com quem contar." 
  },
  { 
    icon: <Home size={20} />, 
    title: "Insegurança ao dividir logística", 
    desc: "Dividir hospedagem ou transporte com desconhecidos gera ansiedade e riscos." 
  },
  { 
    icon: <Users size={20} />, 
    title: "Dificuldade de conexão", 
    desc: "Encontrar pessoas com interesses em comum parece impossível." 
  },
  { 
    icon: <Link size={20} />, 
    title: "Eventos sem networking real", 
    desc: "O evento acaba e você não criou nenhuma conexão real." 
  },
];

export default function PainPoints() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Título com as cores exatas da imagem */}
        <h2 className="text-[42px] leading-tight font-bold text-center mb-20 text-[#1a1a1a]">
          Queres ir ao evento... <span className="text-[#ff4d6d]">mas algo</span><br />
          <span className="text-[#ff8c66]">ainda te trava?</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {pains.map((item, idx) => (
            <div key={idx} className="p-8 rounded-[20px] border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
              {/* Ícone com degradê circular */}
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br from-[#ff4d6d] to-[#ff8c66] text-white">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-3 leading-tight">
                {item.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Botões com o estilo fiel à imagem */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          <button className="min-w-[240px] py-4 bg-gradient-to-r from-[#7a37f5] via-[#ff4d6d] to-[#ff8c66] text-white rounded-full font-bold text-lg shadow-lg hover:opacity-90 transition-opacity">
            Comprar Ingresso
          </button>
          
          <button className="min-w-[240px] py-4 border-2 border-transparent bg-origin-border bg-clip-content bg-gradient-to-r from-[#7a37f5] via-[#ff4d6d] to-[#ff8c66] rounded-full relative group">
             <div className="absolute inset-0 bg-white rounded-full m-[2px] transition-colors group-hover:bg-slate-50"></div>
             <span className="relative z-10 font-bold text-lg text-[#1a1a1a]">Criar Evento</span>
          </button>
        </div>
      </div>
    </section>
  );
}