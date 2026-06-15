import React, { useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { Product } from "@/lib/catalog";
import { HomeBanner } from "@/lib/acf-home";
import SlideNuevasPromociones from "./sliders/SlideNuevasPromociones";
import SlideCanjeaCupones2 from "./sliders/SlideCanjeaCupones2";
import SlideCanjeaCupones from "./sliders/SlideCanjeaCupones2";
import SlideNuevosArticulos from "./sliders/SlideNuevosArticulos";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
function resolveUrl(url?: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

interface HeroSliderProps {
  latestProducts: Product[];
  banners?: HomeBanner[];
}

export default function HeroSlider({ latestProducts: _latestProducts, banners }: HeroSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);

  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const onSelect = useCallback((api: any) => {
    setSelectedIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex">
        {/* Slide 1: Regreso a clases */}
        {/* <SlidePromocionInvierno isActive={selectedIndex === 0} /> */}

        {/* Slide 2: Nuevas promociones */}
        {/* <SlideNuevosModelos isActive={selectedIndex === 1} latestProducts={latestProducts} /> */}

        {/* Slide 3: Tu compra nuestro compromiso */}
        {/* <SlideCompromiso isActive={selectedIndex === 2} /> */}

        {/* Slide 4: Promoción invierno - Casaca NBA */}
        {/* <SlideRegresoClases isActive={selectedIndex === 2} /> */}

        {/* Slide 1: Nuevas promociones */}
        {/* <SlideNuevasPromociones isActive={selectedIndex === 0} /> */}

        {/* Slide 2: Canjea Cupones 2 */}
        {/* <SlideCanjeaCupones2 isActive={selectedIndex === 1} /> */}

        {/* Slide 3: Canjea Cupones */}
        {/* <SlideCanjeaCupones isActive={selectedIndex === 2} /> */}

        {/* Slide 4: Nuevos Artículos */}
        {/* <SlideNuevosArticulos isActive={selectedIndex === 3} /> */}

        {/* Slide 5: Regreso a clases */}
        {/* <SlidePromocionInvierno isActive={selectedIndex === 4} /> */}

        {(banners ?? []).map((banner, i) => {
          const content = (
            <>
              {banner.mobile && (
                <Image
                  src={resolveUrl(banner.mobile)}
                  alt={banner.alt || ''}
                  width={768}
                  height={400}
                  className="w-full object-cover block md:hidden"
                  priority={i === 0}
                  unoptimized
                />
              )}
              {banner.tablet && (
                <Image
                  src={resolveUrl(banner.tablet)}
                  alt={banner.alt || ''}
                  width={1024}
                  height={400}
                  className="w-full object-cover hidden md:block lg:hidden"
                  priority={i === 0}
                  unoptimized
                />
              )}
              {banner.desktop && (
                <Image
                  src={resolveUrl(banner.desktop)}
                  alt={banner.alt || ''}
                  width={1440}
                  height={500}
                  className="w-full object-cover hidden lg:block"
                  priority={i === 0}
                  unoptimized
                />
              )}
            </>
          );
          return (
            <div key={i} className="flex-[0_0_100%] min-w-0 relative">
              {banner.url ? (
                <a href={banner.url} target="_blank" rel="noopener noreferrer" className="block">
                  {content}
                </a>
              ) : content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
