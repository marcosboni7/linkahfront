import Navbar from './components/Navbar';
import Banner from './components/Banner';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Banner />
      {/* Aqui entrarão as próximas seções que você quiser */}
    </main>
  );
}