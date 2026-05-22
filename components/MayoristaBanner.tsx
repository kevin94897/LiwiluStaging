import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaBoxes, FaStore } from 'react-icons/fa';
import { useMayorista } from '@/context/MayoristaContext';
import { useRouter } from 'next/router';

function FloatingButton() {
  const { disableMayorista } = useMayorista();
  const router = useRouter();

  return createPortal(
    <div
      style={{ position: 'fixed', right: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 9999 }}
      className="font-sans flex items-center gap-1 md:gap-2 flex-col"
    >
      {/* Botones de acción en vertical */}
      <div className="flex flex-col gap-1.5 md:gap-2">
        <button
          onClick={() => router.push('/productos?mayorista=true')}
          title="Ver tienda"
          className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 text-white bg-[#0c4848] border border-white/10 hover:brightness-110 rounded-full shadow-2xl transition-all duration-200 hover:scale-110"
        >
          <FaStore className="w-[16px] h-[16px] md:w-[18px] md:h-[18px]" />
        </button>
        <button
          onClick={() => {
            disableMayorista();
            const { mayorista, ...rest } = router.query;
            router.replace({ pathname: router.pathname, query: rest }, undefined, { scroll: false });
          }}
          title="Salir del modo mayorista"
          className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 text-white bg-red-600 hover:bg-red-700 rounded-full shadow-2xl transition-all duration-200 hover:scale-110"
        >
          <FaTimes className="w-[16px] h-[16px] md:w-[18px] md:h-[18px]" />
        </button>
      </div>

      {/* Botón Mayorista (Etiqueta indicadora) */}
      <div className="font-sans flex flex-col items-center gap-2 bg-[#0c4848] text-white w-10 md:w-12 py-3 md:py-5 rounded-full shadow-2xl">
        <span className="md:text-[15px] text-[11px] font-bold tracking-widest [writing-mode:vertical-rl] rotate-180 uppercase">
          Mayorista
        </span>
        <FaBoxes className="w-[16px] h-[16px] md:w-5 md:h-5" />
      </div>
    </div>,
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
      {/* {mounted && <FloatingButton />} */}

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
