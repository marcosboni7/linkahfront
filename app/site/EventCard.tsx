'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Calendar, ArrowUpRight } from 'lucide-react'; // Mantidos os seus ícones originais
import { useLanguage } from '@/app/context/LanguageContext';

const API_URL_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://api-linkah.onrender.com';

const CLOUDINARY_CLOUD_NAME = 'dj32txsol';

export function EventCard({ evento }: { evento: any }) {
  const { language, t }: any = useLanguage();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const locale = language === 'PT' ? 'pt-BR' : 'en-US';

  useEffect(() => {
    if (isMounted && evento) {
      console.log(`--- DEBUG EVENTO: ${evento.nome} ---`);
      console.log('Data Raw da API:', evento.data_inicio || evento.data);
      console.log('Preço Mínimo:', evento.preco_minimo);
      console.log('Imagem Raw:', evento.imagem_capa || evento.imagem);
    }
  }, [isMounted, evento]);

  const renderImagem = () => {
    const img = evento?.imagem_capa || evento?.imagem;

    if (!img || img === 'null' || img === 'undefined') {
      return 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4';
    }

    const valor = String(img).trim();

    // URL completa
    if (valor.startsWith('http://') || valor.startsWith('https://')) {
      return valor;
    }

    // Public ID da Cloudinary
    if (valor.startsWith('linkah/eventos/')) {
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${valor}`;
    }

    // Imagens antigas locais
    return `${API_URL_BASE}/uploads/${valor.replace(/^\/+/, '')}`;
  };

  const getCurrencySymbol = () => {
    const m = String(evento?.moeda || evento?.currency || '').toUpperCase();

    if (m === 'EUR') return '€';
    if (m === 'USD') return '$';
    if (m === 'BRL') return 'R$';

    return language === 'PT' ? 'R$' : '$';
  };

  const formatarDataVitrine = () => {
    if (!isMounted) {
      return { diaSemana: '', dia: '', mes: '', hora: '' };
    }

    const dataRaw = evento?.data_inicio || evento?.data;
    if (!dataRaw) {
      return { diaSemana: '', dia: '', mes: '', hora: '' };
    }

    try {
      const apenasData = String(dataRaw).split('T')[0];
      const partes = apenasData.split('-');

      if (partes.length !== 3) {
        return { diaSemana: '', dia: '', mes: '', hora: '' };
      }

      const ano = Number(partes[0]);
      const mesNum = Number(partes[1]);
      const diaNum = Number(partes[2]);

      if (!ano || !mesNum || !diaNum) {
        return { diaSemana: '', dia: '', mes: '', hora: '' };
      }

      const dataUTC = new Date(Date.UTC(ano, mesNum - 1, diaNum));

      if (isNaN(dataUTC.getTime())) {
        return { diaSemana: '', dia: '', mes: '', hora: '' };
      }

      const diasSemanaPt = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
      const diasSemanaEn = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

      const mesesPt = [
        'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
        'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'
      ];

      const mesesEn = [
        'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
        'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
      ];

      const diaSemana =
        locale === 'pt-BR'
          ? diasSemanaPt[dataUTC.getUTCDay()]
          : diasSemanaEn[dataUTC.getUTCDay()];

      const dia = String(diaNum).padStart(2, '0');

      const mes =
        locale === 'pt-BR'
          ? mesesPt[mesNum - 1]
          : mesesEn[mesNum - 1];

      const horaRaw = String(evento?.horario || evento?.hora_inicio || '');
      let horaFormatada = horaRaw.slice(0, 5);

      if (horaFormatada === '00:00' || !horaFormatada) {
        horaFormatada = '';
      }

      console.log(`Data Processada (${evento.nome}):`, {
        dataRaw,
        apenasData,
        diaSemana,
        dia,
        mes,
        horaFormatada
      });

      return {
        diaSemana,
        dia,
        mes,
        hora: horaFormatada
      };
    } catch (e) {
      console.error('Erro ao formatar data:', e);
      return { diaSemana: '', dia: '', mes: '', hora: '' };
    }
  };

  const { diaSemana, dia, mes, hora } = formatarDataVitrine();

  const traduzirCategoria = (cat: string) => {
    if (!isMounted || !t) return cat;

    const categorias: Record<string, string> = {
      'Arte & Cultura': t?.catArt || 'Arte & Cultura',
      'Entretenimento': t?.catEnt || 'Entretenimento',
      'Negócios': t?.catBiz || 'Negócios',
      'Educação & Desenvolvimento': t?.catEdu || 'Educação',
      'Esportes & Bem-estar': t?.catHealth || 'Bem-estar',
      'Experiências & Lifestyle': t?.catLife || 'Lifestyle',
      'Família & Comunidade': t?.catFamily || 'Comunidade',
    };

    return categorias[cat] || cat;
  };

  if (!isMounted) {
    return (
      <div className="w-full aspect-[4/5] bg-slate-50 rounded-[2.5rem] animate-pulse border border-gray-100" />
    );
  }

  return (
    <Link
      href={`/evento/${evento?.id || ''}`}
      className="group block w-full bg-white rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-violet-200/50 transition-all duration-500 border border-slate-100 flex flex-col h-full"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
        <img
          src={renderImagem()}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          alt={String(evento?.nome || 'Evento')}
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4';
          }}
        />

        <div className="absolute top-5 left-5">
          <span className="bg-white/80 backdrop-blur-md text-slate-900 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl shadow-sm border border-white/20">
            {traduzirCategoria(String(evento?.categoria || 'Evento'))}
          </span>
        </div>
      </div>

      <div className="p-8 flex flex-col flex-grow">
        <div className="flex items-center gap-2 text-violet-600 text-[11px] font-black uppercase tracking-[0.2em] mb-4">
          <Calendar size={14} strokeWidth={3} />
          <span>
            {diaSemana ? `${diaSemana}, ${dia} ${mes}` : 'Data a definir'}
            {hora && ` • ${hora}`}
          </span>
        </div>

        <h3 className="text-slate-950 font-black text-xl leading-[1.2] mb-4 group-hover:text-violet-600 transition-colors line-clamp-2 min-h-[48px]">
          {String(evento?.nome || 'Evento sem nome')}
        </h3>

        <div className="flex items-center gap-1.5 text-slate-400 mb-8">
          <MapPin size={14} strokeWidth={2.5} className="flex-shrink-0 text-slate-300" />
          <span className="text-xs font-bold uppercase tracking-tight truncate">
            {String(evento?.local_nome || 'Local')}, {String(evento?.cidade || '')}
          </span>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1">
              {String(t?.from || 'A partir de')}
            </p>

            <p className="text-2xl font-black text-slate-950 tracking-tighter">
              <span className="text-sm font-black mr-0.5">{getCurrencySymbol()}</span>
              {evento?.preco_minimo
                ? Number(evento.preco_minimo).toLocaleString(locale, {
                    minimumFractionDigits: 2
                  })
                : '0.00'}
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-violet-600 group-hover:text-white group-hover:rotate-45 transition-all duration-500 shadow-sm">
            <ArrowUpRight size={24} strokeWidth={3} />
          </div>
        </div>
      </div>
    </Link>
  );
}