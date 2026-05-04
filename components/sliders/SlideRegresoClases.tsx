import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// Variantes de animación
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0 },
};

const slideInRight = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0 },
};

interface SlideRegresoClasesProps {
  isActive: boolean;
}

export default function SlideRegresoClases({ isActive }: SlideRegresoClasesProps) {
  return (
    <div className="flex-[0_0_100%] min-w-0 relative h-full">
      <section className="relative text-white overflow-hidden h-[600px] md:h-[520px] flex items-center">
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
            priority
          />
        </motion.div>

        <motion.div
          className="absolute -right-10 md:-right-20 top-32 md:top-40 w-32 md:w-auto z-10"
          initial="hidden"
          animate={isActive ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0, x: 50 },
            visible: { opacity: 1, x: 0 },
          }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Image
            src="/images/vectores/liwilu_banner_productos_vector.png"
            alt="Vector decoration"
            width={295}
            height={218}
            quality={100}
            className="h-auto"
            priority
          />
        </motion.div>

        <div className="relative max-w-7xl mx-auto md:px-6 w-full flex items-center justify-between md:flex-row flex-col z-20">
          <motion.div
            className="w-full md:w-1/2"
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="py-10 md:py-12 mx-auto max-w-md md:max-w-full px-4 md:px-0">
              <motion.h2
                className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 text-primary-light uppercase"
                initial="hidden"
                animate={isActive ? "visible" : "hidden"}
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                ¿Estás listo para el regreso a clases?
              </motion.h2>

              <motion.div
                className="flex flex-row gap-4 pt-4"
                initial="hidden"
                animate={isActive ? "visible" : "hidden"}
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1 },
                }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                {[1, 2, 3].map((num, index) => (
                  <motion.div
                    key={num}
                    variants={{
                      hidden: { opacity: 0, scale: 0.5 },
                      visible: { opacity: 1, scale: 1 },
                    }}
                    transition={{
                      duration: 0.4,
                      delay: 0.7 + index * 0.1,
                    }}
                  >
                    <Image
                      src={`/images/liwilu_banner_home_icono-0${num}.png`}
                      width={63}
                      height={63}
                      alt="Icon"
                      className="w-12 h-12 md:w-16 md:h-16"
                    />
                  </motion.div>
                ))}
              </motion.div>

              <motion.p
                className="text-lg md:text-xl lg:text-2xl my-6 mr-12"
                variants={fadeInUp}
              >
                ¡Encuentra todo lo que necesitas con nosotros!
              </motion.p>

              <motion.div variants={fadeInUp}>
                <Link
                  href="/productos"
                  className="md:!px-12 bg-primary text-white py-2 md:py-4 px-6 rounded-full font-medium hover:bg-primary-light/80 transition-colors duration-300 md:text-lg text-base"
                >
                  Ir a tienda
                </Link>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="relative w-full md:w-1/2 flex justify-end items-end md:min-h-[520px] overflow-visible"
            initial="hidden"
            animate={isActive ? "visible" : "hidden"}
            variants={slideInRight}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="relative w-full h-[240px] sm:h-[300px] md:hidden overflow-visible">
              <Image
                src="/images/liwilu_banner_regreso_clases_img-mob.png"
                alt="Niños"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain absolute bottom-0 left-0"
              />
            </div>

            <div className="relative w-full h-full hidden md:absolute md:inset-y-0 md:right-0 md:block md:w-[110%]">
              <Image
                src="/images/liwilu_banner_regreso_clases_img.png"
                alt="Niños"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-left"
              />
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
