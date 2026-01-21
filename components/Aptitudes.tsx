"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

export default function Aptitudes() {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      skipSnaps: false,
      dragFree: false,
      containScroll: "trimSnaps",
    },
    [Autoplay({ delay: 3500, stopOnInteraction: false })],
  );

  const features = [
    {
      icon: "/images/vectores/liwilu_aptitud_01.svg",
      alt: "Clientes satisfechos",
      text: "Más de 10 000 clientes satisfechos con nosotros",
    },
    {
      icon: "/images/vectores/liwilu_aptitud_02.svg",
      alt: "Despacho rápido",
      text: "Despacho rápido y entregas puntuales en todo Lima Metropolitana",
    },
    {
      icon: "/images/vectores/liwilu_aptitud_03.svg",
      alt: "Experiencia",
      text: "Catorce años de experiencia ofreciendo calidad y compromiso",
    },
    {
      icon: "/images/vectores/liwilu_aptitud_04.svg",
      alt: "Responsabilidad ambiental",
      text: "Comprometidos con la responsabilidad ambiental y social",
    },
  ];

  return (
    <section className="bg-gray-50 py-8 sm:py-12 lg:py-16">
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-center mb-6 sm:mb-8 lg:mb-12 text-primary-dark px-4 sm:px-6">
        Tu confianza, nuestro compromiso
      </h2>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y touch-pinch-zoom -ml-4 sm:-ml-6 lg:-ml-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex-[0_0_85%] min-w-0 pl-4 sm:flex-[0_0_50%] sm:pl-6 lg:flex-[0_0_25%] lg:pl-8"
              >
                <div className="flex flex-col items-center text-center space-y-4 sm:space-y-6 px-2 sm:px-4 lg:px-6">
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
                    <Image
                      src={feature.icon}
                      alt={feature.alt}
                      width={128}
                      height={128}
                      className="w-full h-full object-contain"
                      priority={index < 2}
                      loading={index < 2 ? "eager" : "lazy"}
                    />
                  </div>
                  <p className="text-gray-500 text-sm sm:text-base max-w-[200px] font-semibold mx-auto leading-relaxed">
                    {feature.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS personalizado */}
      <style jsx>{`
        .embla {
          overflow: hidden;
        }
        .embla__container {
          display: flex;
        }
        .embla__slide {
          position: relative;
          min-width: 0;
        }
      `}</style>
    </section>
  );
}
