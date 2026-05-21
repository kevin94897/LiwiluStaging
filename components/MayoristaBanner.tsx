import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaBoxes, FaStore, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { useMayorista } from '@/context/MayoristaContext';
import { useRouter } from 'next/router';

function FloatingButton() {
  const { disableMayorista } = useMayorista();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return createPortal(
    <>
      <div
        ref={ref}
        style={{ position: 'fixed', right: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 9999 }}
        className="font-sans flex flex-col items-end gap-2"
      >
        {/* Panel de opciones */}
        {open && (
          <div className="bg-[#0c4848] border border-primary/40 rounded-lg shadow-2xl p-3 flex flex-col gap-2 min-w-[160px] animate-mayorista-panel">
            {/* <p className="text-[10px] text-white/50 uppercase tracking-widest px-1 mb-1">Modo Mayorista</p> */}
            <button
              onClick={() => { router.push('/productos?mayorista=true'); setOpen(false); }}
              className="flex items-center gap-2 text-[13px] font-semibold text-white bg-primary hover:brightness-110 px-3 py-2 rounded-lg transition-all duration-200 w-full"
            >
              {/* <FaStore size={12} /> */}
              Ver tienda
            </button>
            <button
              onClick={() => {
                disableMayorista();
                const { mayorista, ...rest } = router.query;
                router.replace({ pathname: router.pathname, query: rest }, undefined, { scroll: false });
                setOpen(false);
              }}
              className="flex items-center gap-2 text-[13px] font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg transition-all duration-200 w-full"
            >
              {/* <FaTimes size={12} /> */}
              Salir del modo
            </button>
          </div>
        )}

        {/* Botón trigger vertical */}
        <button
          onClick={() => setOpen(v => !v)}
          className="font-sans flex flex-col items-center gap-2 bg-[#0c4848] text-white px-4 py-5 rounded-full shadow-2xl hover:brightness-110 transition-all duration-200"
        >
          {open ? <FaChevronDown size={12} /> : <FaChevronUp size={12} />}
          <span className="md:text-[15px] text-[11px] font-bold tracking-widest [writing-mode:vertical-rl] rotate-180 uppercase">
            Mayorista
          </span>

          <FaBoxes size={20} />
        </button>
      </div>

      <style jsx global>{`
        @keyframes mayorista-panel-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-mayorista-panel {
          animation: mayorista-panel-in 0.18s ease forwards;
        }
      `}</style>
    </>,
    document.body
  );
}

export default function MayoristaBanner() {
  const { isMayorista } = useMayorista();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!isMayorista) return null;

  return (
    <>
      {/* Marquesina superior */}
      <div className="bg-[#0c4848] border-b border-primary/30 overflow-hidden whitespace-nowrap py-1.5">
        <div className="inline-block animate-marquee text-xs font-semibold text-primary tracking-wide">
          {Array(6).fill(null).map((_, i) => (
            <span key={i}>
              ✦ MODO MAYORISTA ACTIVO &nbsp;&nbsp;&nbsp; Mínimo 3 unidades por producto &nbsp;&nbsp;&nbsp; Precios especiales al por mayor &nbsp;&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* Botón flotante via portal (evita herencia de transform del header) */}
      {mounted && <FloatingButton />}

      <style jsx>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 18s linear infinite;
        }
      `}</style>
    </>
  );
}
