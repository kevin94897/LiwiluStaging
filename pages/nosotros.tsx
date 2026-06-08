// pages/nosotros.tsx
import { GetServerSideProps } from "next";
import Layout from "@/components/Layout";
import Button from "@/components/ui/Button";
import Image from "next/image";

interface ValorItem {
  lista_valores_titulo?: string;
  lista_valores_descrip?: string;
  lista_valores_imagen?: string;
}

interface NosotrosData {
  nosotros_banner?: string;
  nosotros_titulo?: string;
  nosotros_contenido?: string;
  mision?: {
    mision_titulo?: string;
    mision_contenido?: string;
  };
  vision?: {
    vision_titulo?: string;
    vision_contenido?: string;
  };
  valores?: {
    valores_titulo?: string;
    lista_valores?: ValorItem[];
  };
  cta_trabaja?: {
    cta_trabaja_titulo?: string;
    cta_trabaja_descrip?: string;
    cta_trabaja_contacto?: string | { url?: string; text?: string };
    cta_ver_catalogo?: string | { url?: string; text?: string };
  };
}

interface NosotrosProps {
  data: NosotrosData;
}

export const getServerSideProps: GetServerSideProps = async () => {
  let acfData: NosotrosData = {};
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const res = await fetch(`${apiUrl}/acf/values?group=nosotros`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        acfData = json.data;
      }
    }
  } catch (error) {
    console.error("Error fetching nosotros ACF data:", error);
  }

  return {
    props: {
      data: acfData,
    },
  };
};

export default function Nosotros({ data }: NosotrosProps) {
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

  // Sección intro
  const bannerUrl = data?.nosotros_banner
    ? getImageUrl(data.nosotros_banner)
    : "/images/liwilu-nosotros-banner.png";
  const title = data?.nosotros_titulo;
  const content = data?.nosotros_contenido;
  const hasIntro = !!(title || content);

  // Sección misión
  const misionTitulo = data?.mision?.mision_titulo;
  const misionContenido = data?.mision?.mision_contenido;
  const hasMision = !!(misionTitulo || misionContenido);

  // Sección visión
  const visionTitulo = data?.vision?.vision_titulo;
  const visionContenido = data?.vision?.vision_contenido;
  const hasVision = !!(visionTitulo || visionContenido);

  const hasMisionVision = hasMision || hasVision;

  // Sección valores
  const valoresTitulo = data?.valores?.valores_titulo;
  const listaValores = data?.valores?.lista_valores?.filter(
    (v) => v.lista_valores_titulo || v.lista_valores_descrip || v.lista_valores_imagen
  ) ?? [];
  const hasValores = listaValores.length > 0;

  // Sección CTA
  const ctaTitulo = data?.cta_trabaja?.cta_trabaja_titulo;
  const ctaDescrip = data?.cta_trabaja?.cta_trabaja_descrip;
  const ctaContacto = resolveLink(data?.cta_trabaja?.cta_trabaja_contacto);
  const ctaCatalogo = resolveLink(data?.cta_trabaja?.cta_ver_catalogo);
  const hasCta = !!(ctaTitulo || ctaDescrip || ctaContacto || ctaCatalogo);

  return (
    <Layout
      title="Nosotros - Liwilu"
      description="Conoce más sobre Liwilu"
      background={true}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Banner */}
        <div className="relative md:h-[200px] h-[150px] z-10">
          <Image
            src={bannerUrl}
            alt="Nosotros Liwilu Banner"
            fill
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>

        {/* Título y contenido */}
        {hasIntro && (
          <div className="relative py-16 px-4 overflow-hidden">
            <div className="absolute top-10 right-10 w-32 h-32 border-2 border-green-200 rounded-full opacity-50"></div>
            <div className="absolute top-32 right-32 w-20 h-20 border-2 border-green-200 rounded-full opacity-30"></div>
            <div className="absolute bottom-20 right-20 w-40 h-40 border-2 border-green-200 rounded-full opacity-40"></div>

            <div className="max-w-6xl mx-auto relative z-10">
              {title && (
                <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 text-center mb-8">
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

        {/* Misión y Visión */}
        {hasMisionVision && (
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div className="relative rounded-2xl aspect-square md:aspect-auto md:h-full min-h-[400px]">
                <Image
                  src="/images/liwilu-nosotros-image.png"
                  alt="Equipo Liwilu"
                  fill
                  className="object-cover rounded-2xl"
                  unoptimized
                />
              </div>

              <div className="space-y-10">
                {hasMision && (
                  <div id="mision">
                    {misionTitulo && (
                      <div className="mb-4">
                        <h2 className="text-3xl md:text-4xl font-semibold text-primary-dark relative inline-block">
                          {misionTitulo}
                          <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary-dark"></span>
                        </h2>
                      </div>
                    )}
                    {misionContenido && (
                      <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                        {misionContenido}
                      </p>
                    )}
                  </div>
                )}

                {hasVision && (
                  <div id="vision">
                    {visionTitulo && (
                      <div className="mb-4">
                        <h2 className="text-3xl md:text-4xl font-semibold text-primary-dark relative inline-block">
                          {visionTitulo}
                          <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary-dark"></span>
                        </h2>
                      </div>
                    )}
                    {visionContenido && (
                      <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                        {visionContenido}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Valores */}
        {hasValores && (
          <div className="py-16 px-4">
            <div className="max-w-6xl mx-auto">
              {valoresTitulo && (
                <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 text-center mb-12">
                  {valoresTitulo}
                </h2>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {listaValores.map((valor, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                      {valor.lista_valores_imagen ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getImageUrl(valor.lista_valores_imagen)}
                          alt={valor.lista_valores_titulo || `Valor ${idx + 1}`}
                          className="w-6 h-6 object-contain"
                        />
                      ) : (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    {valor.lista_valores_titulo && (
                      <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">
                        {valor.lista_valores_titulo}
                      </h3>
                    )}
                    {valor.lista_valores_descrip && (
                      <p className="text-gray-700 text-center whitespace-pre-wrap">
                        {valor.lista_valores_descrip}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
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
              {(ctaContacto || ctaCatalogo) && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {ctaContacto && (
                    <Button variant="secondary" size="md" href={ctaContacto}>
                      Contáctanos
                    </Button>
                  )}
                  {ctaCatalogo && (
                    <Button variant="secondary" size="md" href={ctaCatalogo}>
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
