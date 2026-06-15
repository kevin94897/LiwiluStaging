// pages/terminos-y-condiciones.tsx
import { GetServerSideProps } from "next";
import Layout from "@/components/Layout";
import Button from "@/components/ui/Button";
import Image from "next/image";

interface TerminoItem {
  tyc_lista_titulo?: string;
  tyc_lista_descripcion?: string;
}

interface TerminosData {
  tyc_banner?: string;
  tyc_titulo?: string;
  tyc_descrip?: string;
  tyc_lista?: TerminoItem[];
  cta_dudas?: {
    cta_dudas_titulo?: string;
    cta_dudas_descrip?: string;
    cta_dudas_btn_01?: string | { url?: string; text?: string };
    cta_dudas_btn_02?: string | { url?: string; text?: string };
  };
}

interface TerminosProps {
  data: TerminosData;
}

export const getServerSideProps: GetServerSideProps = async () => {
  let acfData: TerminosData = {};
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${apiUrl}/acf/values?group=terminos_condiciones`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        acfData = json.data;
      }
    }
  } catch (error) {
    console.error("Error fetching terminos_condiciones ACF data:", error);
  }

  return {
    props: {
      data: acfData,
    },
  };
};

export default function TerminosyCondiciones({ data }: TerminosProps) {
  const getImageUrl = (url?: string): string => {
    if (!url) return "";
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const resolveLink = (val: any): string | null => {
    if (!val) return null;
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val.url) return val.url;
    return null;
  };

  // Section Intro
  const bannerUrl = data?.tyc_banner
    ? getImageUrl(data.tyc_banner)
    : "/images/liwilu-politicas-banner.png";
  const title = data?.tyc_titulo;
  const content = data?.tyc_descrip;
  const hasIntro = !!(title || content);

  // Section Lista
  const listaTerminos = data?.tyc_lista?.filter(
    (item) => item.tyc_lista_titulo || item.tyc_lista_descripcion
  ) ?? [];
  const hasLista = listaTerminos.length > 0;

  // Section CTA
  const ctaTitulo = data?.cta_dudas?.cta_dudas_titulo;
  const ctaDescrip = data?.cta_dudas?.cta_dudas_descrip;
  
  const ctaBtn1 = resolveLink(data?.cta_dudas?.cta_dudas_btn_01);
  const ctaBtn2 = resolveLink(data?.cta_dudas?.cta_dudas_btn_02);

  const hasCta = !!(ctaTitulo || ctaDescrip || ctaBtn1 || ctaBtn2);

  return (
    <Layout
      title="Términos y Condiciones - Liwilu"
      description="Términos y Condiciones de envío y recojo de productos"
      background={true}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="relative md:h-[200px] h-[150px] z-10">
          <Image
            src={bannerUrl}
            alt="Políticas de envío y recojo de productos"
            fill
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
        
        {hasIntro && (
          <div className="relative py-16 px-4 overflow-hidden">
            <div className="max-w-6xl mx-auto relative z-10">
              {title && (
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 text-center mb-8">
                  {title}
                </h1>
              )}

              {content && (
                <div 
                  className="richtext-content space-y-6 text-gray-700 text-lg leading-relaxed [&_p]:mb-4 [&_strong]:font-semibold"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              )}
            </div>
          </div>
        )}

        {/* Políticas Section */}
        {hasLista && (
          <div className="max-w-6xl mx-auto z-10 relative px-4">
            <div className="space-y-6">
              {listaTerminos.map((item, idx) => (
                <div key={idx} className="bg-white rounded-md p-6 md:p-8 shadow-lg">
                  {item.tyc_lista_titulo && (
                    <div className="mb-4">
                      <h2 className="text-xl md:text-2xl font-semibold relative inline-block">
                        {idx + 1}. {item.tyc_lista_titulo}
                      </h2>
                    </div>
                  )}
                  {item.tyc_lista_descripcion && (
                    <p className="text-gray-700 md:text-lg whitespace-pre-wrap">
                      {item.tyc_lista_descripcion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Section */}
        {hasCta && (
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="bg-primary rounded-3xl p-8 md:p-12 text-center shadow-2xl">
              {ctaTitulo && (
                <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                  {ctaTitulo}
                </h2>
              )}
              {ctaDescrip && (
                <p className="text-green-50 text-lg mb-8 max-w-2xl mx-auto whitespace-pre-wrap">
                  {ctaDescrip}
                </p>
              )}
              {(ctaBtn1 || ctaBtn2) && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {ctaBtn1 && (
                    <Button href={ctaBtn1} variant="secondary" size="md">
                      Contáctanos
                    </Button>
                  )}
                  {ctaBtn2 && (
                    <Button href={ctaBtn2} variant="outline_white" size="md">
                      Ver catálogo
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
