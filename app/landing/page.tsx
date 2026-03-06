import Navbar from './components/Navbar';
import Banner from './components/Banner';
import PainPoints from './components/PainPoints';
import CommunityJourney from './components/CommunityJourney';
import DarkFeatures from './components/DarkFeatures';
import WhoIsItFor from './components/WhoIsItFor';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* 1. Navegação fixa no topo */}
      <Navbar />
      
      {/* 2. Hero principal (Banner) */}
      <Banner />
      
      {/* 3. Dores do usuário (O que te trava?) */}
      <PainPoints />
      
      {/* 4. Fluxo da comunidade (Mais que um ingresso) */}
      <CommunityJourney />
      
      {/* 5. Seção de Segurança e Networking (Preta) */}
      <DarkFeatures />
      
      {/* 6. Para quem é o site + Comparativo Com/Sem Linkah */}
      <WhoIsItFor />
      
      {/* 7. Passo a passo Participante vs Organizador */}
      <HowItWorks />
      
      {/* 8. Depoimentos de usuários reais */}
      <Testimonials />
      
      {/* 9. Perguntas Frequentes */}
      <FAQ />
      
      {/* 10. Rodapé com links e redes sociais */}
      <Footer />
    </main>
  );
}