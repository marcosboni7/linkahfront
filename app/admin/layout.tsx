import Sidebar from './Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-white font-sans">
      {/* Sidebar única e fixa */}
      <Sidebar /> 
      
      {/* Área de conteúdo que muda conforme a página */}
      <main className="flex-1 bg-[#F4F5F7] rounded-tl-[3.5rem] my-2 ml-2 overflow-y-auto text-slate-900 shadow-2xl">
        {children}
      </main>
    </div>
  );
}