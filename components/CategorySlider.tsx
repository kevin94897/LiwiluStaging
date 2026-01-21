import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { CategoryLevelTwo } from "@/lib/catalog";

interface CategorySliderProps {
  levelTwoCategories: CategoryLevelTwo[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

export default function CategorySlider({
  levelTwoCategories,
  selectedCategory,
  onCategorySelect,
}: CategorySliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
      skipSnaps: false,
      dragFree: false,
    },
    [
      Autoplay({
        delay: 4000,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
      }),
    ],
  );

  const getCategoryEmoji = (name: string): string => {
    if (name.includes("Libro")) return "📚";
    if (name.includes("Hogar") || name.includes("Limpieza")) return "🧹";
    if (name.includes("Uniforme")) return "👕";
    if (name.includes("Útil")) return "✏️";
    if (name.includes("Tecnolog")) return "💻";
    if (name.includes("Deporte")) return "⚽";
    if (name.includes("Arte")) return "🎨";
    if (name.includes("Música")) return "🎵";
    return "🏷️";
  };

  return (
    <section className="py-6 relative overflow-hidden bg-gradient-to-r from-primary to-primary">
      <div className="absolute -left-10 md:-left-60 -bottom-18 md:-bottom-80 w-32 md:w-full z-0 pointer-events-none">
        <Image
          src="/images/vectores/liwilu_banner_productos_vector_03.png"
          alt="Decoración"
          width={654}
          height={499}
          quality={100}
          className="h-auto"
          priority
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Breadcrumb */}
        <div className="text-white text-sm mb-4 animate-fade-in">
          <Link href="/" className="hover:underline transition-colors">
            Inicio
          </Link>
          <span className="mx-2">|</span>
          <span className="font-medium">Tienda virtual</span>
        </div>

        {/* Slider Container */}
        <div className="relative max-w-6xl mx-auto group">
          {/* Embla Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex -ml-3">
              {levelTwoCategories.map((cat) => {
                const emoji = getCategoryEmoji(cat.name);
                const isSelected = selectedCategory === cat.id.toString();

                return (
                  <div
                    key={cat.id}
                    className="flex-[0_0_50%] min-w-0 sm:flex-[0_0_33.33%] md:flex-[0_0_25%] lg:flex-[0_0_20%] xl:flex-[0_0_16.66%] pl-3"
                  >
                    <div
                      onClick={() => onCategorySelect(cat.id.toString())}
                      className={`flex flex-col items-center cursor-pointer py-3 px-2 rounded-xl transition-all duration-300`}
                    >
                      {/* Category Image/Icon */}
                      <div
                        className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden shadow-lg mb-3 mx-auto transition-all duration-300 bg-white`}
                      >
                        {cat.coverImage ? (
                          <Image
                            src={cat.coverImage}
                            alt={cat.name}
                            fill
                            sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, (max-width: 1024px) 112px, 128px"
                            className="object-cover"
                            priority={false}
                          />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center text-3xl sm:text-4xl md:text-5xl">
                            {emoji}
                          </span>
                        )}
                      </div>

                      {/* Category Name */}
                      <span
                        className={`text-white text-xs sm:text-sm md:text-base lg:text-lg text-center block w-full px-1 !leading-tight transition-all duration-300`}
                      >
                        {cat.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
