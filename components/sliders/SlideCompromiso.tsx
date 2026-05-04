import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

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

interface SlideCompromisoProps {
  isActive: boolean;
}

export default function SlideCompromiso({ isActive }: SlideCompromisoProps) {
  return (
    <div className="flex-[0_0_100%] min-w-0 relative h-full">
      <section className="relative text-white overflow-hidden h-[600px] md:h-[520px] flex items-center">

        {/* Fondo */}
        <motion.div
          className="absolute inset-0"
          initial="hidden"
          animate={isActive ? "visible" : "hidden"}
          variants={{
            hidden: { scale: 1.1 },
            visible: { scale: 1 },
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <Image
            src="/images/liwilu_home_banner_bg.png"
            alt="Hero background"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>

        {/* Vector decorativo */}
        <motion.div
          className="absolute -right-10 md:-right-20 top-1/2 md:top-40 w-32 md:w-auto floating z-10"
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
            className="h-auto"
          />
        </motion.div>

        <div className="relative max-w-7xl mx-auto md:px-6 w-full h-full flex items-center justify-between md:flex-row flex-col-reverse md:gap-12">

          {/* Imagen izquierda */}
          <motion.div
            className="relative w-full md:w-1/2 flex justify-end items-end md:min-h-[520px] overflow-visible"
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
            variants={slideInLeft}
          >
            <div className="relative w-full h-[240px] sm:h-[300px] md:hidden overflow-visible">
              <Image
                src="/images/liwilu_banner_compromiso_img-mob.png"
                alt="Niños"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain object-left"
              />
            </div>
            <div className="relative w-full h-full hidden md:absolute md:inset-y-0 md:right-0 md:block md:w-[110%]">
              <Image
                src="/images/liwilu_banner_compromiso_img.png"
                alt="Familia"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-right xl:object-left"
              />
            </div>
          </motion.div>

          {/* Contenido de texto */}
          <motion.div
            className="w-full md:w-1/2"
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
            variants={slideInRight}
          >
            <div className="py-10 md:py-12 mx-auto max-w-md md:max-w-full px-4 md:px-0">

              {/* Logo móvil */}
              <motion.div
                className="md:hidden block mb-4"
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Image
                  src="/images/liwilu_logo-xl.png"
                  alt="Liwilu Logo"
                  width={120}
                  height={60}
                  className="h-auto"
                />
              </motion.div>

              <motion.h2
                className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 text-primary-light uppercase"
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Tu compra nuestro compromiso
              </motion.h2>

              <motion.div
                className="flex flex-row gap-2 pt-4"
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Image
                  src="/images/liwilu_banner_home_icono-01.png"
                  width={63}
                  height={63}
                  alt="Icon"
                  className="w-12 h-12 md:w-16 md:h-16"
                />
                <Image
                  src="/images/liwilu_banner_home_icono-02.png"
                  width={63}
                  height={63}
                  alt="Icon"
                  className="w-12 h-12 md:w-16 md:h-16"
                />
                <Image
                  src="/images/liwilu_banner_home_icono-03.png"
                  width={63}
                  height={63}
                  alt="Icon"
                  className="w-12 h-12 md:w-16 md:h-16"
                />
              </motion.div>

              {/* Logo desktop */}
              <motion.div
                className="absolute bottom-0 right-0 z-20 self-center justify-center text-center md:block hidden mb-10"
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <Image
                  src="/images/liwilu_logo-xl.png"
                  alt="Liwilu Logo"
                  width={180}
                  height={60}
                  className="h-auto"
                />
              </motion.div>

            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
}
