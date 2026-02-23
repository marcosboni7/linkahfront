'use client';
import Sidebar from './Sidebar'; // Aqui é só um pontinho porque estão na mesma pasta admin

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F4F5F7]">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}