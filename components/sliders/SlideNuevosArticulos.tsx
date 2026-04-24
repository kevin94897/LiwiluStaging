import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { FaPencilAlt } from "react-icons/fa";

// Variantes de animación
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0 },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -100 },
  visible: { opacity: 1, x: 0 },
};

const slideInRight = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0 },
};

interface SlidePromocionInviernoProps {
  isActive: boolean;
}

export default function SlidePromocionInvierno({ isActive }: SlidePromocionInviernoProps) {
  return (
    <div className="flex-[0_0_100%] min-w-0 relative h-full">
      <section className="relative text-white overflow-hidden h-[600px] md:h-[520px] flex items-center justify-center">

        {/* Fondo */}
        <motion.div
          className="absolute inset-0 bg-[#0c4331]"
          initial="hidden"
          animate={isActive ? "visible" : "hidden"}
          variants={{
            hidden: { scale: 1.1 },
            visible: { scale: 1 },
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          {/* Opcional: Si el fondo es una imagen */}
          {/* <Image
            src="/images/liwilu_home_banner_bg.png"
            alt="Hero background"
            fill
            sizes="100vw"
            className="object-cover opacity-80"
          /> */}
        </motion.div>

        {/* Vector decorativo derecho */}
        <motion.div
          className="absolute -right-10 md:-right-20 top-1/2 md:top-40 w-32 md:w-auto floating z-0 pointer-events-none"
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
            className="h-auto opacity-50"
          />
        </motion.div>

        {/* Icono bolsa izquierdo */}
        <motion.div
          className="absolute -left-10 md:left-20 top-20 md:top-24 w-16 md:w-auto floating z-0 pointer-events-none opacity-80"
          initial="hidden"
          animate={isActive ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0, x: -100 },
            visible: { opacity: 1, x: 0 },
          }}
          transition={{ duration: 0.8 }}
        >
          <Image
            src="/images/vectores/liwilu_bag_icon.png"
            alt="Vector decoration"
            width={83}
            height={93}
            className="h-auto"
          />
        </motion.div>

        {/* Icono libro */}
        <motion.div
          className="hidden md:block absolute left-1/2 top-1/3 md:top-40 w-16 md:w-auto floating-delayed z-0 pointer-events-none opacity-80"
          initial="hidden"
          animate={isActive ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0, y: -50 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Image
            src="/images/vectores/liwilu_book_icon.png"
            alt="Vector decoration"
            width={73}
            height={83}
            className="h-auto"
          />
        </motion.div>

        {/* Icono regla */}
        <motion.div
          className="hidden md:block absolute left-4 md:left-10 bottom-20 md:bottom-40 w-16 md:w-auto floating z-0 pointer-events-none opacity-80"
          initial="hidden"
          animate={isActive ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0, x: -100 },
            visible: { opacity: 1, x: 0 },
          }}
          transition={{ duration: 0.8 }}
        >
          <Image
            src="/images/vectores/liwilu_rule_icon.png"
            alt="Vector decoration"
            width={83}
            height={93}
            className="h-auto"
          />
        </motion.div>

        {/* Icono tijeras */}
        <motion.div
          className="hidden md:block absolute right-10 md:right-24 bottom-10 md:bottom-20 w-16 md:w-auto floating-delayed z-0 pointer-events-none mr-5 opacity-80"
          initial="hidden"
          animate={isActive ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0, x: 100 },
            visible: { opacity: 1, x: 0 },
          }}
          transition={{ duration: 0.8 }}
        >
          <Image
            src="/images/vectores/liwilu_scissors_icon.png"
            alt="Vector decoration"
            width={83}
            height={93}
            className="h-auto"
          />
        </motion.div>

        <div className="relative max-w-7xl mx-auto w-full h-full flex flex-col-reverse md:flex-row items-center justify-between px-4 md:px-12 z-20">

          {/* Left: Boy (Bottom on Mobile) */}
          <motion.div
            className="relative w-full md:w-5/12 flex justify-center md:justify-start items-end h-[270px] sm:h-[330px] md:h-full overflow-visible z-10 md:z-20 mt-auto md:mt-0"
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
            variants={slideInLeft}
          >
            {/* Pill primero en DOM → queda detrás de la imagen (z-0 < imagen z-10) */}
            <div className="absolute z-20 md:z-0 left-1/2 -translate-x-1/2 bottom-[4%] md:bottom-auto md:left-auto md:translate-x-0 md:-right-52 md:top-1/2 md:-translate-y-1/2 w-[72%] md:w-auto">
              <motion.div
                className="bg-white text-primary px-4 py-1.5 md:px-12 md:py-4 rounded-md shadow-xl flex items-center justify-center gap-2 md:gap-3"
                initial="hidden"
                animate={isActive ? "visible" : "hidden"}
                variants={slideInLeft}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <span className="text-lg sm:text-base md:text-xl font-semibold text-center leading-tight">
                  Nuevos artículos y promociones
                </span>
                <FaPencilAlt className="text-sm sm:text-base md:text-2xl text-[#6ec27c] rotate-90 shrink-0 hidden md:block" />
              </motion.div>
            </div>

            <Image
              src="/images/liwilu_boy_promo_banner_2.png"
              alt="Niños"
              fill
              sizes="(max-width: 768px) 45vw, 30vw"
              className="object-contain object-bottom pointer-events-none z-10"
              priority
            />
          </motion.div>

          {/* Right: Content (Top on Mobile) */}
          <motion.div className="w-full md:w-7/12 flex flex-col items-center md:items-end justify-center gap-2 sm:gap-3 md:gap-3 pt-4 md:pt-6 pb-2 md:pb-6 z-30">

            {/* Title */}
            <motion.h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#6ec27c] uppercase drop-shadow-md text-center w-full z-40"
              initial="hidden"
              animate={isActive ? "visible" : "hidden"}
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Siempre pensando en ti
            </motion.h2>

            {/* Promo Circle */}
            <motion.div
              className="bg-white text-[#3f8c5b] w-[210px] h-[210px] sm:w-[240px] sm:h-[240px] md:w-[300px] md:h-[300px] rounded-full shadow-2xl flex flex-col items-center justify-center p-4 md:p-6 relative z-30 md:self-end md:mr-10 lg:mr-20"
              initial="hidden"
              animate={isActive ? "visible" : "hidden"}
              variants={slideInRight}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <span className="text-xl sm:text-2xl md:text-3xl font-semibold text-center leading-none mt-1">PROMO 80%</span>
              <span className="text-[11px] sm:text-xs md:text-base font-bold mt-0.5 text-center">En 2da. Prenda</span>
              <span className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-widest text-[#0c4331] my-0.5 drop-shadow-sm">LIWGIS91</span>
              <span className="text-[8px] sm:text-[9px] md:text-xs font-semibold text-center text-black mb-1 uppercase px-2 md:px-3 leading-tight">Prendas y tallas seleccionadas</span>

              {/* Grid de pastillas */}
              <div className="flex flex-wrap justify-center gap-1 md:gap-2 text-[7.5px] sm:text-[8px] md:text-[11px] px-1 md:px-2 w-full">
                <span className="bg-[#e2f5e8] text-[#0c4331] font-bold py-0.5 px-1.5 md:py-1 md:px-3 rounded-full border border-[#b2e2c6] shadow-sm">Falda (L)</span>
                <span className="bg-[#e2f5e8] text-[#0c4331] font-bold py-0.5 px-1.5 md:py-1 md:px-3 rounded-full border border-[#b2e2c6] shadow-sm">Blusa (M-L)</span>
                <span className="bg-[#e2f5e8] text-[#0c4331] font-bold py-0.5 px-1.5 md:py-1 md:px-3 rounded-full border border-[#b2e2c6] shadow-sm">Pantalón AP (10)</span>
                <span className="bg-[#e2f5e8] text-[#0c4331] font-bold py-0.5 px-1.5 md:py-1 md:px-3 rounded-full border border-[#b2e2c6] shadow-sm">Short AP (4)</span>
                <span className="bg-[#e2f5e8] text-[#0c4331] font-bold py-0.5 px-1.5 md:py-1 md:px-3 rounded-full border border-[#b2e2c6] shadow-sm">Pantaloneta AP (4-6)</span>
              </div>
            </motion.div>

            {/* Bottom Pill */}
            <motion.div
              className="bg-white px-4 py-1.5 md:px-8 md:py-2 rounded-md shadow-[0_10px_30px_rgba(0,0,0,0.15)] cursor-pointer mt-1 z-40"
              initial="hidden"
              animate={isActive ? "visible" : "hidden"}
              variants={fadeInUp}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <p className="text-[#0c4331] font-bold text-[10px] sm:text-xs md:text-xl lg:text-2xl text-center uppercase drop-shadow-sm">
                Todo lo que necesitas a un clic
              </p>
            </motion.div>

          </motion.div>

        </div>
      </section>
    </div>
  );
}
