import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

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

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

interface SlideNuevasPromocionesProps {
  isActive: boolean;
}

export default function SlideNuevasPromociones({ isActive }: SlideNuevasPromocionesProps) {
  return (
    <div className="flex-[0_0_100%] min-w-0 relative h-full">
      <section className="relative text-white overflow-hidden h-[600px] md:h-[520px] bg-gradient-to-br from-[#0a2f20] to-[#041a10] flex items-center">

        {/* ── Elementos decorativos de fondo ── */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute -right-10 md:-right-16 top-1/3 md:top-28 w-36 md:w-auto floating"
            initial="hidden" animate={isActive ? "visible" : "hidden"}
            variants={{ hidden: { opacity: 0, x: 100 }, visible: { opacity: 0.6, x: 0 } }}
            transition={{ duration: 0.8 }}
          >
            <Image src="/images/vectores/liwilu_banner_productos_vector.png" alt="" width={295} height={218} className="h-auto" />
          </motion.div>

          <motion.div
            className="absolute left-4 md:left-12 top-10 md:top-14 w-10 md:w-auto floating opacity-80"
            initial="hidden" animate={isActive ? "visible" : "hidden"}
            variants={{ hidden: { opacity: 0, x: -60 }, visible: { opacity: 0.8, x: 0 } }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <Image src="/images/vectores/liwilu_bag_icon.png" alt="" width={83} height={93} className="h-auto" />
          </motion.div>

          <motion.div
            className="hidden md:block absolute left-1/2 top-10 floating-delayed opacity-70"
            initial="hidden" animate={isActive ? "visible" : "hidden"}
            variants={{ hidden: { opacity: 0, y: -40 }, visible: { opacity: 0.7, y: 0 } }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Image src="/images/vectores/liwilu_book_icon.png" alt="" width={73} height={83} className="h-auto" />
          </motion.div>

          <motion.div
            className="hidden md:block absolute left-8 bottom-16 floating opacity-80"
            initial="hidden" animate={isActive ? "visible" : "hidden"}
            variants={{ hidden: { opacity: 0, x: -60 }, visible: { opacity: 0.8, x: 0 } }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <Image src="/images/vectores/liwilu_rule_icon.png" alt="" width={83} height={93} className="h-auto" />
          </motion.div>

          <motion.div
            className="hidden md:block absolute right-1/4 bottom-12 floating-delayed opacity-80"
            initial="hidden" animate={isActive ? "visible" : "hidden"}
            variants={{ hidden: { opacity: 0, x: 60 }, visible: { opacity: 0.8, x: 0 } }}
            transition={{ duration: 0.8, delay: 0.25 }}
          >
            <Image src="/images/vectores/liwilu_scissors_icon.png" alt="" width={83} height={93} className="h-auto" />
          </motion.div>
        </div>

        {/* ── Layout principal ──
            Mobile  (flex-col): fila-1=[círculo+título+pill] | fila-2=[QR+textos]
            Desktop (flex-row): [QR] | [título+pill+validez] | [círculo]
        */}
        <div className="relative max-w-7xl mx-auto w-full h-full flex flex-col md:flex-row items-center justify-center md:justify-between px-5 md:px-12 z-20 gap-10 md:gap-8 py-6 md:py-0">

          {/* ── Fila 1 mobile / Columna centro desktop: Título + contenido ── */}
          <motion.div
            className="order-1 md:order-2 md:flex-1 w-full flex flex-row md:flex-col items-center md:items-start justify-center gap-4 md:gap-4"
            initial="hidden" animate={isActive ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Círculo — solo mobile, inline con el título */}
            <motion.div
              className="md:hidden shrink-0"
              variants={scaleIn}
              transition={{ duration: 0.6, delay: 0.35 }}
            >
              <div className="bg-white text-[#3f8c5b] w-[118px] h-[118px] sm:w-[134px] sm:h-[134px] rounded-full shadow-2xl flex flex-col items-center justify-center border-[4px] border-[#3f8c5b] text-center p-2">
                <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide text-[#0c4331]">Hasta un</span>
                <span className="text-4xl sm:text-5xl font-semibold text-[#6ec27c] leading-none">80%</span>
                <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wide text-[#0c4331] leading-tight mt-0.5">Prendas<br />seleccionadas</span>
              </div>
            </motion.div>

            {/* Texto — título + subtítulo + pills */}
            <div className="flex flex-col items-center md:items-start gap-2 md:gap-4">
              <motion.h2
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold uppercase text-[#6ec27c] leading-none text-center md:text-left drop-shadow-md"
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Nuevas<br />Promociones
              </motion.h2>

              <motion.p
                className="text-sm sm:text-base md:text-3xl lg:text-4xl font-bold text-center md:text-left leading-tight"
                style={{ fontStyle: "italic" }}
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <span className="text-white">Códigos por </span>
                <span className="text-[#6ec27c]">tiempo limitado</span>
              </motion.p>

              {/* Pill borde — visible en mobile y desktop */}
              <motion.div
                className="border-2 border-white rounded-sm px-3 py-1 md:px-8 md:py-3"
                variants={scaleIn}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <p className="text-white font-semibold text-[10px] sm:text-xs md:text-xl text-center uppercase">
                  Super descuentos<br />ahora en la web
                </p>
              </motion.div>

              {/* Validez — solo desktop */}
              <motion.div
                className="hidden md:block text-left"
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.55 }}
              >
                <p className="text-white font-bold text-base uppercase tracking-wide">Válido hasta agotar stock</p>
                <p className="text-[#6ec27c] font-bold text-base uppercase tracking-wide">Prendas seleccionadas</p>
              </motion.div>

              <motion.p
                className="hidden md:block text-white font-semibold text-sm uppercase tracking-widest mt-1 opacity-80 text-left"
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                Promoción no válida para devolución
              </motion.p>
            </div>
          </motion.div>

          {/* ── Círculo desktop — oculto en mobile (ya está inline arriba) ── */}
          <motion.div
            className="hidden md:flex order-3 shrink-0 items-center justify-center"
            initial="hidden" animate={isActive ? "visible" : "hidden"}
            variants={slideInRight}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <div className="bg-white text-[#3f8c5b] w-[200px] h-[200px] lg:w-[300px] lg:h-[300px] rounded-full shadow-2xl flex flex-col items-center justify-center border-[6px] lg:border-[7px] border-[#3f8c5b] text-center p-3">
              <span className="text-lg font-semibold uppercase tracking-wide text-[#0c4331]">Hasta un</span>
              <span className="text-5xl lg:text-7xl font-semibold text-[#6ec27c] leading-none">80%</span>
              <span className="text-sm font-semibold uppercase tracking-wide text-[#0c4331] leading-tight mt-0.5">Prendas<br />seleccionadas</span>
            </div>
          </motion.div>

          {/* ── Fila 2 mobile / Columna izq desktop: QR ── */}
          <motion.div
            className="order-2 md:order-1 flex flex-col items-center justify-center gap-3 md:gap-4 w-auto md:w-[180px] lg:w-[260px] shrink-0"
            initial="hidden" animate={isActive ? "visible" : "hidden"}
            variants={slideInLeft}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {/* Tarjeta QR */}
            <div className="bg-white rounded-md md:rounded-2xl p-2 md:p-4 lg:p-5 shadow-2xl flex flex-col items-center gap-1 md:gap-2 w-[200px] sm:w-[115px] md:w-full shrink-0">
              <p className="text-[#0c4331] text-[7px] sm:text-[8px] md:text-xs font-bold text-center leading-tight">
                Escanea nuestro<br />QR y descubre
              </p>
              <Image
                src="/images/liwilu_qr.png"
                alt="QR Liwilu comunidad"
                width={208}
                height={208}
                className="w-18 h-18 sm:w-20 sm:h-20 md:w-full md:h-auto rounded-lg object-contain"
              />
              <p className="text-[#0c4331] text-[6px] sm:text-[7px] md:text-[10px] font-semibold text-center leading-tight">
                Nuestras promociones<br />y novedades<br />en nuestra<br />comunidad oficial
              </p>
            </div>

            {/* Mobile: validez + disclaimer al lado del QR */}
            <div className="flex flex-col md:gap-1.5 md:hidden">
              <p className="text-white font-bold text-sm sm:text-[10px] uppercase tracking-wide text-center">
                Válido hasta agotar stock
              </p>
              <p className="text-[#6ec27c] font-bold text-sm sm:text-[10px] uppercase tracking-wide text-center">
                Prendas seleccionadas
              </p>
              <p className="text-white font-semibold text-sm sm:text-[9px] uppercase tracking-widest opacity-70 text-center">
                Promo no válida para devolución
              </p>
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
}
