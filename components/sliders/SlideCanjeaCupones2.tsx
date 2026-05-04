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
            initial="hidden" animate={isActive ? "visible" : "hidden"}
            variants={{ hidden: { opacity: 0, x: 100 }, visible: { opacity: 1, x: 0 } }}
            transition={{ duration: 0.8 }}
          >
            <Image src="/images/vectores/liwilu_banner_productos_vector.png" alt="" width={295} height={218} className="h-auto opacity-50" />
          </motion.div>
          <motion.div
            className="absolute -right-10 md:-right-20 top-1/2 md:top-40 w-32 md:w-auto floating z-0 pointer-events-none"
            initial="hidden" animate={isActive ? "visible" : "hidden"}
            variants={{ hidden: { opacity: 0, x: 100 }, visible: { opacity: 1, x: 0 } }}
            transition={{ duration: 0.8 }}
          >
            <Image src="/images/vectores/liwilu_banner_productos_vector.png" alt="" width={295} height={218} className="h-auto opacity-50" />
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="relative max-w-7xl mx-auto w-full h-full flex flex-col items-center justify-center px-3 md:px-12 z-20 py-4 md:py-10">

          {/* Title */}
          <motion.h2
            className="text-lg sm:text-xl md:text-4xl lg:text-5xl font-semibold uppercase text-center mb-3 md:mb-6 tracking-wide"
            style={{ color: "#6ec27c" }}
            initial="hidden" animate={isActive ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            CANJEA TUS CUPONES
          </motion.h2>

          {/* 3 Cards */}
          <div className="flex flex-row items-stretch justify-center gap-2 md:gap-6 w-full">

            {/* Card 1: PROMO 80% */}
            <motion.div
              className="bg-white rounded-lg md:rounded-[2rem] p-2 md:p-7 flex flex-col items-center justify-start w-1/3 shadow-2xl"
              initial="hidden" animate={isActive ? "visible" : "hidden"}
              variants={scaleIn}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="text-[11px] sm:text-sm md:text-3xl font-semibold text-center mb-0.5 md:mb-1" style={{ color: '#6ec27c' }}>
                PROMO 80%
              </h3>
              <p className="text-[#3f8c5b] text-[9px] sm:text-xs md:text-xl font-bold text-center leading-tight mb-0.5 md:mb-2">
                En 2da. Prenda
              </p>
              <h4 className="text-sm sm:text-base md:text-4xl font-semibold text-center mb-0.5 md:mb-1 tracking-wider" style={{ color: '#6ec27c' }}>
                LIWGIS91
              </h4>
              <p className="text-black text-[7px] sm:text-[8px] md:text-xs font-semibold uppercase text-center mb-1 md:mb-3">
                Prendas y tallas seleccionadas
              </p>
              <div className="flex flex-col items-start w-full gap-0 md:gap-0.5 text-[7px] sm:text-[8px] md:text-sm font-semibold leading-snug">
                <p>Falda <span className="text-[#3f8c5b] font-normal">(talla L)</span></p>
                <p>Blusa <span className="text-[#3f8c5b] font-normal">(talla M - L)</span></p>
                <p>Pantalón AP <span className="text-[#3f8c5b] font-normal">(talla 10)</span></p>
                <p>Short AP <span className="text-[#3f8c5b] font-normal">(Talla 4)</span></p>
                <p>Pantaloneta AP <span className="text-[#3f8c5b] font-normal">(Talla 4-6)</span></p>
              </div>
            </motion.div>

            {/* Card 2: PROMO 30% Varón */}
            <motion.div
              className="bg-white rounded-lg md:rounded-[2rem] p-2 md:p-7 flex flex-col items-center justify-start w-1/3 shadow-2xl"
              initial="hidden" animate={isActive ? "visible" : "hidden"}
              variants={scaleIn}
              transition={{ duration: 0.6, delay: 0.45 }}
            >
              <h3 className="text-[11px] sm:text-sm md:text-3xl font-semibold text-center mb-0.5 md:mb-1" style={{ color: '#6ec27c' }}>
                PROMO 30%
              </h3>
              <p className="text-[#3f8c5b] text-[9px] sm:text-xs md:text-xl font-bold text-center leading-tight mb-0.5 md:mb-2">
                Promo estudiante<br />Varón
              </p>
              <h4 className="text-sm sm:text-base md:text-4xl font-semibold text-center mb-0.5 md:mb-1 tracking-wider" style={{ color: '#6ec27c' }}>
                FYMUSZ71
              </h4>
              <p className="text-black text-[7px] sm:text-[8px] md:text-xs font-semibold uppercase text-center mb-1 md:mb-3">
                Prendas y tallas seleccionadas
              </p>
              <div className="flex flex-col items-center w-full gap-0.5 md:gap-1 text-[7px] sm:text-[8px] md:text-sm font-semibold text-center leading-snug">
                <p>Camisa <span className="text-[#3f8c5b] font-normal">(6-8-10-12-14-16 / S-M-L-XL-XXL)</span></p>
                <p className="text-xs md:text-lg font-bold">+</p>
                <p>Pantalón <span className="text-[#3f8c5b] font-normal">(6-8-10-12-14-16 / S-M-L-XL-XXL)</span></p>
              </div>
            </motion.div>

            {/* Card 3: PROMO 30% Señorita */}
            <motion.div
              className="bg-white rounded-lg md:rounded-[2rem] p-2 md:p-7 flex flex-col items-center justify-start w-1/3 shadow-2xl"
              initial="hidden" animate={isActive ? "visible" : "hidden"}
              variants={scaleIn}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h3 className="text-[11px] sm:text-sm md:text-3xl font-semibold text-center mb-0.5 md:mb-1" style={{ color: '#6ec27c' }}>
                PROMO 30%
              </h3>
              <p className="text-[#3f8c5b] text-[9px] sm:text-xs md:text-xl font-bold text-center leading-tight mb-0.5 md:mb-2">
                Promo estudiante<br />Señorita
              </p>
              <h4 className="text-sm sm:text-base md:text-4xl font-semibold text-center mb-0.5 md:mb-1 tracking-wider" style={{ color: '#6ec27c' }}>
                FYMUSZ71
              </h4>
              <p className="text-black text-[7px] sm:text-[8px] md:text-xs font-semibold uppercase text-center mb-1 md:mb-3">
                Prendas y tallas seleccionadas
              </p>
              <div className="flex flex-col items-center w-full gap-0.5 md:gap-1 text-[7px] sm:text-[8px] md:text-sm font-semibold text-center leading-snug">
                <p>Falda <span className="text-[#3f8c5b] font-normal">(6-8-10-12-14-16 / S-M-L-XL-XXL)</span></p>
                <p className="text-xs md:text-lg font-bold">+</p>
                <p>Blusa <span className="text-[#3f8c5b] font-normal">(6-8-10-12-14-16 / S-M-L-XL-XXL)</span></p>
                <p className="text-xs md:text-lg font-bold">+</p>
                <p>Falda Short <span className="text-[#3f8c5b] font-normal">(6-8-10-12-14)</span></p>
              </div>
            </motion.div>

          </div>

          {/* Bottom Text */}
          <motion.div
            className="mt-3 md:mt-8 text-white font-bold text-[10px] sm:text-xs md:text-xl text-center uppercase tracking-wide"
            initial="hidden" animate={isActive ? "visible" : "hidden"}
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
