import { FaBoxes, FaTimes } from 'react-icons/fa';
import { useMayorista } from '@/context/MayoristaContext';
import { useRouter } from 'next/router';

export default function MayoristaBanner() {
  const { isMayorista, disableMayorista } = useMayorista();
  const router = useRouter();

  if (!isMayorista) return null;

  return (
    <div className="bg-[#105656] border-b border-primary/30 text-xs py-2 px-4 flex items-center justify-center gap-2">
      <span className="font-semibold text-primary">Modo Mayorista Activo</span>
      <span className="text-white/50">·</span>
      <span className="text-white/70">Mínimo 3 unidades por producto</span>
      <button onClick={() => router.push('/productos?mayorista=true')} className="ml-4 text-primary hover:bg-primary hover:text-white font-medium transition shrink-0 bg-white px-4 py-1 rounded-full">Ver tienda</button>
      <button
        onClick={() => {
          disableMayorista();
          const { mayorista, ...rest } = router.query;
          router.replace({ pathname: router.pathname, query: rest }, undefined, { scroll: false });
        }}
        className="flex items-center gap-1 text-primary hover:bg-primary hover:text-white font-medium transition shrink-0 rounded-full bg-white px-4 py-1"
      >
        {/* <FaTimes size={11} /> */}
        Salir
      </button>
    </div>
  );
}
