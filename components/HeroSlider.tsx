import React, { useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Product } from "@/lib/catalog";
import SlideRegresoClases from "./sliders/SlideRegresoClases";
import SlideNuevosModelos from "./sliders/SlideNuevosModelos";
// import SlideCompromiso from "./sliders/SlideCompromiso";
import SlidePromocionInvierno from "./sliders/SlidePromocionInvierno";

interface HeroSliderProps {
  latestProducts: Product[];
}

export default function HeroSlider({ latestProducts }: HeroSliderProps) {
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
        <SlidePromocionInvierno isActive={selectedIndex === 0} />

        {/* Slide 2: Nuevas promociones */}
        <SlideNuevosModelos isActive={selectedIndex === 1} latestProducts={latestProducts} />

        {/* Slide 3: Tu compra nuestro compromiso */}
        {/* <SlideCompromiso isActive={selectedIndex === 2} /> */}

        {/* Slide 4: Promoción invierno - Casaca NBA */}
        <SlideRegresoClases isActive={selectedIndex === 2} />
      </div>
    </div>
  );
}
