"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

interface BeneficiosProps {
  items?: Array<{ imagen?: string; texto?: string }>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function resolveUrl(url?: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function Beneficios({ items }: BeneficiosProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      skipSnaps: false,
      dragFree: false,
      containScroll: "trimSnaps",
    },
    [Autoplay({ delay: 3500, stopOnInteraction: false })],
  );

  const features = items
    ? items.map((item) => ({ icon: resolveUrl(item.imagen), alt: item.texto || '', text: item.texto || '' })).filter((f) => f.icon || f.text)
    : [];

  if (features.length === 0) return null;

  return (
    <section className="py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
        {/* Slider */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex touch-pan-y touch-pinch-zoom -ml-4 sm:-ml-6 lg:-ml-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex-[0_0_85%] min-w-0 pl-4 sm:flex-[0_0_50%] sm:pl-6 lg:flex-[0_0_25%] lg:pl-8"
                >
                  <div className="rounded-2xl p-6 sm:p-8 transition-shadow duration-300 h-full">
                    <div className="flex flex-col items-center space-y-4 sm:space-y-6">
                      {/* Icono */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex items-center justify-center">
                        <Image
                          src={feature.icon}
                          alt={feature.alt}
                          width={112}
                          height={112}
                          className="w-full h-full object-contain"
                          priority={index < 2}
                          loading={index < 2 ? "eager" : "lazy"}
                        />
                      </div>

                      {/* Texto */}
                      <p className="text-gray-700 text-sm sm:text-base font-semibold uppercase text-center leading-relaxed min-h-[2.5rem] sm:min-h-[3rem] flex items-center max-w-[200px]">
                        {feature.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
