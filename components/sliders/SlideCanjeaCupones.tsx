import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface SlideCanjeaCuponesProps {
  isActive: boolean;
}

export default function SlideCanjeaCupones({ isActive }: SlideCanjeaCuponesProps) {
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <div className="flex-[0_0_100%] min-w-0">
      <section className="relative overflow-hidden h-[600px] md:h-[520px] bg-gradient-to-br from-[#0a2f20] to-[#041a10] flex items-center justify-center">

        {/* Decorative Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute -left-10 md:-left-20 top-1/2 md:top-40 w-32 md:w-auto floating z-0 pointer-events-none"
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
            variants={{ hidden: { opacity: 0, x: 100 }, visible: { opacity: 1, x: 0 } }}
            transition={{ duration: 0.8 }}
          >
            <Image src="/images/vectores/liwilu_banner_productos_vector.png" alt="Vector decoration" width={295} height={218} className="h-auto opacity-50" />
          </motion.div>

          <motion.div
            className="absolute -right-10 md:-right-20 top-1/2 md:top-40 w-32 md:w-auto floating z-0 pointer-events-none"
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
            variants={{ hidden: { opacity: 0, x: 100 }, visible: { opacity: 1, x: 0 } }}
            transition={{ duration: 0.8 }}
          >
            <Image src="/images/vectores/liwilu_banner_productos_vector.png" alt="Vector decoration" width={295} height={218} className="h-auto opacity-50" />
          </motion.div>
        </div>

        {/* Main Content Container */}
        <div className="relative max-w-7xl mx-auto w-full h-full flex flex-col items-center justify-center px-4 md:px-12 z-20 py-4 md:py-12">

          {/* Title */}
          <motion.h2
            className="text-xl md:text-4xl lg:text-5xl font-semibold uppercase text-center my-2 md:my-6 tracking-wide"
            style={{ color: "#6ec27c" }}
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            CANJEA TUS CUPONES
          </motion.h2>

          {/* Cards — flex-row en mobile para no superar el alto */}
          <div className="flex flex-row md:flex-row items-stretch justify-center gap-3 md:gap-12 w-full max-w-4xl">

            {/* Card 1: Varón */}
            <motion.div
              className="bg-white rounded-xl md:rounded-[2rem] p-3 md:p-8 flex flex-col items-center justify-center w-1/2 md:w-1/2 shadow-2xl"
              initial="hidden"
              animate={isActive ? "visible" : "hidden"}
              variants={scaleIn}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="text-base md:text-4xl font-semibold text-center mb-0.5 md:mb-1" style={{ color: '#6ec27c' }}>
                PROMO 30%
              </h3>
              <p className="text-[#3f8c5b] text-xs md:text-2xl font-bold text-center leading-tight mb-1 md:mb-2">
                Promo estudiante<br />Varón
              </p>
              <h4 className="text-xl md:text-5xl font-semibold text-center mb-0.5 md:mb-1 tracking-wider" style={{ color: '#6ec27c' }}>
                FYMUSZ71
              </h4>
              <p className="text-black text-[8px] md:text-xs font-semibold uppercase text-center mb-1.5 md:mb-3">
                Prendas y tallas seleccionadas
              </p>
              <div className="flex flex-col items-center justify-center text-[10px] md:text-base font-semibold text-center leading-snug">
                <p>Short AP <span className="text-[#3f8c5b]">(Talla 4)</span></p>
                <p className="text-sm md:text-xl">+</p>
                <p>Polo Helico <span className="text-[#3f8c5b]">(Talla 4)</span></p>
              </div>
            </motion.div>

            {/* Card 2: Señorita */}
            <motion.div
              className="bg-white rounded-xl md:rounded-[2rem] p-3 md:p-8 flex flex-col items-center justify-center w-1/2 md:w-1/2 shadow-2xl"
              initial="hidden"
              animate={isActive ? "visible" : "hidden"}
              variants={scaleIn}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h3 className="text-base md:text-4xl font-semibold text-center mb-0.5 md:mb-1" style={{ color: '#6ec27c' }}>
                PROMO 30%
              </h3>
              <p className="text-[#3f8c5b] text-xs md:text-2xl font-bold text-center leading-tight mb-1 md:mb-2">
                Promo estudiante<br />Señorita
              </p>
              <h4 className="text-xl md:text-5xl font-semibold text-center mb-0.5 md:mb-1 tracking-wider" style={{ color: '#6ec27c' }}>
                FYMUSZ71
              </h4>
              <p className="text-black text-[8px] md:text-xs font-semibold uppercase text-center mb-1.5 md:mb-3">
                Prendas y tallas seleccionadas
              </p>
              <div className="flex flex-col items-center justify-center text-[10px] md:text-base font-semibold text-center leading-snug">
                <p>Pantaloneta AP <span className="text-[#3f8c5b]">(Talla 4-6)</span></p>
                <p className="text-sm md:text-xl">+</p>
                <p>Polo Helico <span className="text-[#3f8c5b]">(Talla 4)</span></p>
              </div>
            </motion.div>

          </div>

          {/* Bottom Text */}
          <motion.div
            className="mt-3 md:mt-12 text-white font-bold text-xs md:text-xl text-center uppercase tracking-wide"
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            Promoción no válida para devolución
          </motion.div>

        </div>
      </section>
    </div>
  );
}
