import React from "react";
import { motion } from "framer-motion";

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
      <section className="relative overflow-hidden h-[750px] md:h-[520px] bg-gradient-to-br from-[#0a2f20] to-[#041a10] flex items-center justify-center">
        
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Left Decorative Pills */}
          <motion.div 
            className="absolute -left-20 top-40 flex flex-col gap-4 rotate-[-25deg] opacity-80"
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0, x: -50 },
              visible: { opacity: 1, x: 0 },
            }}
            transition={{ duration: 1 }}
          >
            <div className="w-64 h-16 bg-[#168850] rounded-full"></div>
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-[#168850] rounded-full"></div>
              <div className="w-48 h-16 bg-[#168850] rounded-full"></div>
            </div>
            <div className="w-56 h-16 bg-[#168850] rounded-full ml-12"></div>
          </motion.div>

          {/* Right Decorative Pills */}
          <motion.div 
            className="absolute -right-20 top-20 flex flex-col gap-4 rotate-[155deg] opacity-80"
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0, x: 50 },
              visible: { opacity: 1, x: 0 },
            }}
            transition={{ duration: 1 }}
          >
            <div className="w-40 h-16 bg-[#168850] rounded-full ml-20"></div>
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-[#168850] rounded-full"></div>
              <div className="w-64 h-16 bg-[#168850] rounded-full"></div>
            </div>
            <div className="w-48 h-16 bg-[#168850] rounded-full"></div>
          </motion.div>
        </div>

        {/* Main Content Container */}
        <div className="relative max-w-7xl mx-auto w-full h-full flex flex-col items-center justify-center px-4 md:px-12 z-20 py-8 md:py-12">
          
          {/* Title */}
          <motion.h2
            className="text-4xl md:text-6xl lg:text-7xl font-black uppercase text-center mb-8 md:mb-12 tracking-wide"
            style={{ color: "#6ec27c" }}
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            CANJEA TUS CUPONES
          </motion.h2>

          {/* Cards Container */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 w-full max-w-4xl">
            
            {/* Card 1: Varón */}
            <motion.div
              className="bg-white rounded-[2rem] p-6 md:p-8 flex flex-col items-center justify-center w-full sm:w-[80%] md:w-1/2 shadow-2xl"
              initial="hidden"
              animate={isActive ? "visible" : "hidden"}
              variants={scaleIn}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 
                className="text-3xl md:text-4xl font-black text-center mb-1"
                style={{ WebkitTextStroke: '1.5px #0c4331', color: '#6ec27c' }}
              >
                PROMO 30%
              </h3>
              <p className="text-[#3f8c5b] text-xl md:text-2xl font-bold text-center leading-tight mb-2">
                Promo estudiante<br />Varón
              </p>
              <h4 
                className="text-4xl md:text-5xl font-black text-center mb-1 tracking-wider"
                style={{ WebkitTextStroke: '1.5px #0c4331', color: '#6ec27c' }}
              >
                FYMUSZ71
              </h4>
              <p className="text-black text-[10px] md:text-xs font-black uppercase text-center mb-3">
                Prendas y tallas seleccionadas
              </p>
              
              <div className="flex flex-col items-center justify-center text-sm md:text-base font-black text-center leading-snug">
                <p>
                  Short AP <span className="text-[#3f8c5b]">(Talla 4)</span>
                </p>
                <p className="text-xl">+</p>
                <p>
                  Polo Helico <span className="text-[#3f8c5b]">(Talla 4)</span>
                </p>
              </div>
            </motion.div>

            {/* Card 2: Señorita */}
            <motion.div
              className="bg-white rounded-[2rem] p-6 md:p-8 flex flex-col items-center justify-center w-full sm:w-[80%] md:w-1/2 shadow-2xl"
              initial="hidden"
              animate={isActive ? "visible" : "hidden"}
              variants={scaleIn}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h3 
                className="text-3xl md:text-4xl font-black text-center mb-1"
                style={{ color: '#6ec27c' }}
              >
                PROMO 30%
              </h3>
              <p className="text-[#3f8c5b] text-xl md:text-2xl font-bold text-center leading-tight mb-2">
                Promo estudiante<br />Señorita
              </p>
              <h4 
                className="text-4xl md:text-5xl font-black text-center mb-1 tracking-wider"
                style={{color: '#6ec27c' }}
              >
                FYMUSZ71
              </h4>
              <p className="text-black text-[10px] md:text-xs font-black uppercase text-center mb-3">
                Prendas y tallas seleccionadas
              </p>
              
              <div className="flex flex-col items-center justify-center text-sm md:text-base font-black text-center leading-snug">
                <p>
                  Pantaloneta AP <span className="text-[#3f8c5b]">(Talla 4 - 6)</span>
                </p>
                <p className="text-xl">+</p>
                <p>
                  Polo Helico <span className="text-[#3f8c5b]">(Talla 4)</span>
                </p>
              </div>
            </motion.div>

          </div>

          {/* Bottom Text */}
          <motion.div
            className="mt-8 md:mt-12 text-white font-bold text-sm md:text-xl text-center uppercase tracking-wide"
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
