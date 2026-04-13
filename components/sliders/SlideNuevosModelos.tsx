import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FaShoppingCart } from "react-icons/fa";
import { Product } from "@/lib/catalog";
import {
  formatPrice,
  getProductName,
  getRegularPrice,
  getSalePrice,
  hasDiscount,
  getEffectivePrice,
} from "@/lib/utils";

// Variantes de animación
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0 },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -100 },
  visible: { opacity: 1, x: 0 },
};

interface SlideNuevosModelosProps {
  isActive: boolean;
  latestProducts: Product[];
}

function HeroProductCard({ product }: { product: Product }) {
  const imageUrl =
    product.coverImage ||
    (product.associations?.images?.[0]?.id
      ? `/api/images/products/${product.id}/${product.associations.images[0].id}`
      : "/images/productos/placeholder_liwilu.png");

  return (
    <Link href={`/tienda/${product.linkRewrite || product.id}`}>
      <div className="bg-white rounded-[15px] shadow-[0_4px_20px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-300 hover:scale-[1.02] w-[140px] md:w-[220px]">
        <div className="relative aspect-square">
          <div className="relative w-full h-full bg-white overflow-hidden">
            <Image
              src={imageUrl}
              alt={getProductName(product)}
              width={300}
              height={300}
              sizes="300px"
              className="object-contain"
            />
          </div>
        </div>
        <div className="p-3 md:p-4 bg-primary text-white">
          <h3 className="text-[10px] md:text-sm font-medium line-clamp-1 opacity-90 mb-1">
            {getProductName(product)}
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              {hasDiscount(product) && (
                <span className="text-[8px] md:text-xs line-through opacity-70">
                  {formatPrice(getRegularPrice(product))}
                </span>
              )}
              <span className="text-xs md:text-lg font-semibold">
                {formatPrice(getEffectivePrice(product))}
              </span>
            </div>
            <div className="bg-white/20 p-1.5 rounded-full">
              <FaShoppingCart className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function SlideNuevosModelos({
  isActive,
  latestProducts,
}: SlideNuevosModelosProps) {
  return (
    <div className="flex-[0_0_100%] min-w-0 relative h-full">
      <section className="relative h-[600px] md:h-[520px] overflow-hidden bg-gradient-to-r from-[#002D24] to-[#004D40] flex flex-col justify-center">
        <motion.div
          className="absolute -right-10 md:-right-20 top-16 md:top-48 w-32 md:w-auto floating z-10"
          initial="hidden"
          animate={isActive ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0, x: 100 },
            visible: { opacity: 1, x: 0 },
          }}
          transition={{ duration: 0.8 }}
        >
          <Image
            src="/images/vectores/liwilu_banner_productos_vector.png"
            alt="Vector decoration"
            width={295}
            height={218}
            quality={100}
            className="h-auto"
          />
        </motion.div>

        <div className="relative z-20 max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between w-full">
          <motion.div
            className="w-full md:w-1/4 mb-4 md:mb-0 text-center md:text-left self-start"
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
            variants={slideInLeft}
          >
            <motion.div
              className="flex z-20 self-center justify-center text-center md:hidden block mb-4"
              variants={fadeInUp}
            >
              <Image
                src="/images/liwilu_logo-xl.png"
                alt="Liwilu Logo"
                width={120}
                height={60}
                className="h-auto"
              />
            </motion.div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 text-primary-light uppercase">
              NUEVAS PROMOCIONES
            </h2>
            <p className="text-xl md:text-3xl text-white md:mt-4 font-medium">
              Calidad que nos distingue
            </p>
          </motion.div>

          <div className="relative z-10 flex-1 w-full h-[350px] md:h-full flex items-center justify-center pb-12">
            <motion.div
              className="relative w-[300px] h-[300px] md:w-[350px] md:h-[350px] z-20"
              initial="hidden"
              animate={isActive ? "visible" : "hidden"}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.8 }}
            >
              <Image
                src="/images/liwilu_banner_nuevos_modelos_img.png"
                alt="Niña sentada"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
              />
            </motion.div>

            {latestProducts.length > 0 && (
              <div className="absolute inset-0 z-50 flex pointer-events-none">
                <div className="absolute left-[0%] md:left-[10%] top-[10%] -translate-y-[10%] pointer-events-auto z-40">
                  <motion.div
                    initial="hidden"
                    animate={isActive ? "visible" : "hidden"}
                    variants={{
                      hidden: { opacity: 0, x: -50 },
                      visible: { opacity: 1, x: 0 },
                    }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <HeroProductCard product={latestProducts[0]} />
                  </motion.div>
                </div>
                {latestProducts.length > 1 && (
                  <div className="absolute right-[0%] md:right-[10%] top-[10%] -translate-y-[10%] pointer-events-auto z-40">
                    <motion.div
                      initial="hidden"
                      animate={isActive ? "visible" : "hidden"}
                      variants={{
                        hidden: { opacity: 0, x: 50 },
                        visible: { opacity: 1, x: 0 },
                      }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                    >
                      <HeroProductCard product={latestProducts[1]} />
                    </motion.div>
                  </div>
                )}
              </div>
            )}

            <div className="absolute inset-0 flex items-end justify-center z-40 mb-2 md:-mb-2">
              <Link
                href="/tienda"
                className="bg-[#002D24] text-white px-12 py-2 md:px-20 md:py-4 rounded-full text-lg md:text-xl font-semibold shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform"
              >
                Descubre más
              </Link>
            </div>
          </div>

          <motion.div
            className="md:top-12 md:right-12 z-20 self-start md:block hidden"
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0, y: -20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Image
              src="/images/liwilu_logo-xl.png"
              alt="Liwilu Logo"
              width={180}
              height={60}
              className="w-24 md:w-48 h-auto"
            />
          </motion.div>
        </div>

        <div className="absolute bottom-8 w-full bg-white h-20 md:h-24 flex items-center overflow-hidden z-10">
          <div className="flex whitespace-nowrap animate-marquee">
            {[...Array(30)].map((_, i) => (
              <span
                key={`a-${i}`}
                className="text-4xl md:text-7xl text-gray-400 mx-4 select-none"
              >
                %
              </span>
            ))}

            {[...Array(30)].map((_, i) => (
              <span
                key={`b-${i}`}
                className="text-4xl md:text-7xl text-gray-400 mx-4 select-none"
              >
                %
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
