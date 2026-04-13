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

interface SlidePromocionInviernoProps {
  isActive: boolean;
}

export default function SlidePromocionInvierno({ isActive }: SlidePromocionInviernoProps) {
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
            className="h-auto"
          />
        </motion.div>

        <div className="relative max-w-7xl mx-auto md:px-6 w-full h-full flex items-center justify-between md:flex-row flex-col-reverse md:gap-12">

          {/* Imagen de niños */}
          <motion.div
            className="relative w-full md:w-2/6 flex justify-center items-end md:min-h-[520px] overflow-visible"
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
            variants={slideInLeft}
          >
            <div className="relative w-full h-[300px] sm:h-[300px] md:hidden">
              <Image
                src="/images/liwilu_children_cortado.png"
                alt="Niños"
                fill
                sizes="100vw"
                className="object-contain object-bottom"
              />
            </div>

            <div className="relative w-full h-[520px] hidden md:block lg:hidden">
              <Image
                src="/images/liwilu_children_2.png"
                alt="Niños"
                fill
                sizes="50vw"
                className="object-contain object-bottom scale-110"
              />
            </div>

            <div className="relative w-full h-[480px] hidden lg:block">
              <Image
                src="/images/liwilu_children_2.png"
                alt="Niños"
                fill
                sizes="40vw"
                className="object-contain object-bottom"
                priority
              />
            </div>
          </motion.div>

          {/* Icono bolsa izquierdo */}
          <motion.div
            className="absolute -left-10 md:-left-10 top-1/2 md:top-20 w-32 md:w-auto floating z-0 pointer-events-none"
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0, x: 100 },
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

          {/* Icono regla */}
          <motion.div
            className="hidden md:block absolute -left-10 md:-left-10 top-1/2 md:bottom-40 w-32 md:w-auto floating z-0 pointer-events-none"
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0, x: 100 },
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
            className="hidden md:block absolute -left-10 md:left-3/4 top-1/2 md:bottom-40 w-32 md:w-auto floating z-0 pointer-events-none mr-5"
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

          {/* Contenido de texto */}
          <motion.div
            className="w-full md:w-4/6"
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
                className="text-4xl md:text-5xl lg:text-7xl font-bold mb-1 md:mb-4 text-primary-light uppercase z-30"
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Promoción por invierno
              </motion.h2>

              <motion.h3
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-primary-light uppercase"
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Casaca NBA
              </motion.h3>

              <motion.div
                className="flex flex-row gap-2 pt-4"
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Image src="/images/liwilu_banner_home_icono-01.png" width={63} height={63} alt="Icon" className="w-12 h-12 md:w-16 md:h-16" />
                <Image src="/images/liwilu_banner_home_icono-02.png" width={63} height={63} alt="Icon" className="w-12 h-12 md:w-16 md:h-16" />
                <Image src="/images/liwilu_banner_home_icono-03.png" width={63} height={63} alt="Icon" className="w-12 h-12 md:w-16 md:h-16" />
              </motion.div>

              {/* Badge de descuento */}
              <motion.div
                className="
                  absolute
                  bottom-1/2 right-0 translate-x-1/2 md:bottom-6 md:right-[-3rem] md:translate-x-0 z-20 flex items-center justify-center
                "
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <div className="border-2 md:border-4 border-dashed rounded-full p-1">
                  <div className="
                    bg-white text-primary
                    px-6 py-6 md:px-10 md:py-12
                    rounded-full shadow-lg
                    border-4 md:border-8 border-primary
                    text-center
                  ">
                    <span className="block text-2xl md:text-5xl font-extrabold tracking-wide">
                      PROMO
                    </span>
                    <span className="block text-4xl md:text-7xl font-extrabold leading-none">
                      40%
                    </span>
                    <span className="block text-2xl md:text-5xl font-extrabold tracking-wide">
                      DSCTO
                    </span>
                  </div>
                </div>
              </motion.div>

            </div>
          </motion.div>

          {/* Franja inferior */}
          <div className="absolute bottom-2 left-0 w-full py-2 lg:py-4 text-center z-10 bg-white md:rounded-sm">
            <p className="text-primary font-bold text-lg md:text-2xl lg:text-3xl ml-10">
              Tu compra, nuestro compromiso
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}
