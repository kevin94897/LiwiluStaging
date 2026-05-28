import { useEffect, useState } from 'react';
import { FaWhatsapp, FaCircleNotch } from 'react-icons/fa';

interface WhatsAppData {
  numero_whatsapp: string | number;
  mensaje_predeterminado: string;
}

export const WhatsAppFloatButton = () => {
  const [data, setData] = useState<WhatsAppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWhatsAppData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/acf/values?group=whatsapp`
        );
        const result = await response.json();

        if (result.success && result.data?.contacto_whatsapp) {
          setData(result.data.contacto_whatsapp);
        } else {
          setError('No se pudo obtener datos de WhatsApp');
        }
      } catch (err) {
        console.error('Error fetching WhatsApp data:', err);
        setError('Error al conectar con el servidor');
      } finally {
        setLoading(false);
      }
    };

    fetchWhatsAppData();
  }, []);

  if (loading || error || !data) {
    return null;
  }

  const whatsappNumber = String(data.numero_whatsapp).replace(/\D/g, '');
  const message = encodeURIComponent(data.mensaje_predeterminado);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
        title="Contáctanos por WhatsApp"
      >
        <FaWhatsapp size={28} />
      </a>

      {/* Tooltip opcional */}
      <div className="absolute bottom-20 right-0 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        Contáctanos por WhatsApp
      </div>
    </div>
  );
};
