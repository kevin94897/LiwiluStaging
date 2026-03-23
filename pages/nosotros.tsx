// pages/nosotros.tsx
"use client";

import Layout from "@/components/Layout";
import Button from "@/components/ui/Button";
import Image from "next/image";

export default function Nosotros() {
  return (
    <Layout
      title="Nosotros - Liwilu"
      description="Conoce más sobre Liwilu"
      background={true}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="relative md:h-[200px] h-[150px] z-10">
          <Image
            src="/images/liwilu-nosotros-banner.png"
            alt="Políticas de envío y recojo de productos"
            width={1438}
            height={201}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative py-16 px-4 overflow-hidden">
          {/* Decoración de fondo con círculos */}
          <div className="absolute top-10 right-10 w-32 h-32 border-2 border-green-200 rounded-full opacity-50"></div>
          <div className="absolute top-32 right-32 w-20 h-20 border-2 border-green-200 rounded-full opacity-30"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 border-2 border-green-200 rounded-full opacity-40"></div>

          <div className="max-w-6xl mx-auto relative z-10">
            <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 text-center mb-8">
              ¿Quiénes somos?
            </h1>

            <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
              <p>
                LIWILU es una distribuidora especializada en soluciones
                integrales para empresas, instituciones y hogares.
                Comercializamos uniformes, libros, útiles de escritorio,
                productos de limpieza, equipos de protección personal, artículos
                de aseo y productos para el hogar. Nuestra fortaleza radica en
                la calidad, puntualidad y atención personalizada, construyendo
                relaciones de confianza con cada cliente.
              </p>
              <p>
                Desarrollamos soluciones adaptadas a las necesidades
                particulares de cada organización, reduciendo tiempos, costos y
                riesgos operativos para nuestros clientes. Nos impulsa la
                innovación constante y la mejora continua, siendo flexibles y
                competitivos con la determinación de consolidarnos como una
                alternativa confiable en el mercado nacional.{" "}
              </p>

              <p>
                Elegir LIWILU significa optar por un socio estratégico que
                entiende sus necesidades, cumple sus promesas y trabaja para
                agregar valor a su organización.
              </p>

              <p className="font-semibold">
                En LIWILU, más que vender productos, construimos relaciones de
                confianza que generan valor a largo plazo.
              </p>
            </div>
          </div>
        </div>

        {/* Misión y Visión Section */}
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Imagen del equipo */}
            <div className="relative rounded-2xl">
              <Image
                src="/images/liwilu-nosotros-image.png"
                alt="Equipo Liwilu"
                width={584}
                height={597}
                className="object-cover rounded-2xl"
                unoptimized
              />
            </div>

            {/* Misión y Visión */}
            <div className="space-y-10">
              {/* Misión */}
              <div id="mision">
                <div className="mb-4">
                  <h2 className="text-3xl md:text-4xl font-semibold text-primary-dark relative inline-block">
                    Nuestra Misión
                    <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary-dark"></span>
                  </h2>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Brindamos soluciones integrales en venta de uniformes, libros,
                  útiles, productos para el hogar y limpieza, ofreciendo
                  calidad, puntualidad y atención personalizada que generan
                  confianza y satisfacción en cada cliente.
                </p>
              </div>

              {/* Visión */}
              <div id="vision">
                <div className="mb-4">
                  <h2 className="text-3xl md:text-4xl font-semibold text-primary-dark relative inline-block">
                    Nuestra Visión
                    <span className="absolute -bottom-2 left-0 w-full h-1 bg-primary-dark"></span>
                  </h2>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Ser reconocidos como un socio estratégico líder a nivel
                  nacional, destacado por su atención oportuna, eficiencia,
                  confiabilidad y capacidad de adaptación a las necesidades de
                  nuestros clientes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Valores Section */}
        <div className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 text-center mb-12">
              Nuestros Valores
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Valor 1 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">
                  Compromiso
                </h3>
                <p className="text-gray-700 text-center">
                  Trabajamos arduamente con esfuerzo, dedicación y puntualidad,
                  cumpliendo las políticas de nuestra organización. Actuamos de
                  manera colaborativa, con respeto y transparencia, tanto dentro
                  del equipo como con nuestros clientes y proveedores.
                </p>
              </div>

              {/* Valor 2 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">
                  Excelencia
                </h3>
                <p className="text-gray-700 text-center">
                  Nos trazamos metas que representan un desafío por cumplir con
                  las necesidades de nuestros clientes. Con profesionalismo y
                  responsabilidad les hacemos llegar productos que superen sus
                  expectativas de calidad.
                </p>
              </div>

              {/* Valor 3 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">
                  Innovación
                </h3>
                <p className="text-gray-700 text-center">
                  Nuestra tecnología, desarrollo y gestión del talento humano,
                  son los pilares que nos hace una organización con altas
                  expectativas de crecimiento.
                </p>
              </div>

              {/* Valor 4 */}
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">
                  Mejora continua
                </h3>
                <p className="text-gray-700 text-center">
                  Generamos ideas y soluciones que agregan valor a nuestra
                  organización y a nuestros clientes. Somos flexibles y
                  competitivos, comprendiendo las necesidades desde su
                  perspectiva para desarrollar soluciones que realmente
                  facilitan su día a día, siempre mirando hacia el futuro y
                  apuntando al posicionamiento en el mercado.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="bg-primary rounded-3xl p-8 md:p-12 text-center shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
              ¿Listo para trabajar con nosotros?
            </h2>
            <p className="text-green-50 text-lg mb-8 max-w-2xl mx-auto">
              Únete a los cientos de clientes satisfechos que confían en LIWILU
              para sus necesidades de uniformes, EPPs y artículos escolares.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="md" href="/trabajemos-juntos">
                Contáctanos
              </Button>
              <Button variant="secondary" size="md" href="/productos">
                Ver catálogo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
