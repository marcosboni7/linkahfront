// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  // O Next.js identifica que esta é a página raiz e joga o usuário para /login
  redirect('/login');
}