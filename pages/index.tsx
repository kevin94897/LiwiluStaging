import Image from "next/image";
import { GetServerSideProps } from "next";
import Layout from "@/components/Layout";
import Link from "next/link";
// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';
import { motion } from "framer-motion";

import Contacto from "@/components/Contacto";
import Aptitudes from "@/components/Aptitudes";
import ProductosDestacados from "@/components/ProductosDestacados";
import Beneficios from "@/components/Beneficios";
import ComoComprar from "@/components/ComoComprar";
import NuestrosProductos from "@/components/NuestrosProductos";

import { Product } from "@/lib/catalog";
import {
  getFeaturedProducts,
  searchProducts,
  getLevelTwoCategories,
  CategoryLevelTwo,
} from "@/lib/catalog";
import HeroSlider from "@/components/HeroSlider";

interface HomeProps {
  featuredProducts: Product[];
  allProducts?: Product[];
  categories: CategoryLevelTwo[];
  error?: string;
}

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    const [featuredProducts, searchResponse, categories] = await Promise.all([
      getFeaturedProducts(),
      searchProducts({ limit: 8 }),
      getLevelTwoCategories(),
    ]);

    const allProducts = searchResponse.data || [];

    return {
      props: {
        featuredProducts,
        allProducts,
        categories: categories.slice(0, 7), // Fetch more just in case, but we will limit to 5 in UI
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";
    return {
      props: {
        featuredProducts: [],
        allProducts: [],
        categories: [],
        error: message,
      },
    };
  }
};

// Variantes de animación
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
  },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -100 },
  visible: {
    opacity: 1,
    x: 0,
  },
};

const slideInRight = {
  hidden: { opacity: 0, x: 100 },
  visible: {
    opacity: 1,
    x: 0,
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
  },
};

export default function Home({
  featuredProducts,
  allProducts = [],
  categories = [],
  error,
}: HomeProps) {
  // Obtener los 2 últimos productos ingresados (asumiendo que el ID mayor es el más reciente)
  const latestProducts = [...allProducts]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, 2);

  // Procesar categorías: Buscar la de posición 0 para el slot grande, y otras 4 para el grid
  const mainCategory = categories.find((c) => c.position === 0) || categories[0];
  const otherCategories = categories
    .filter((c) => c.id !== mainCategory?.id)
    .slice(0, 4);

  return (
    <Layout
      title="Liwilu - Tu compra, nuestro compromiso"
      description="Uniformes, útiles y más"
    >
      <HeroSlider latestProducts={latestProducts} />

      {/* Categorías */}
      <motion.section
        className="max-w-7xl mx-auto px-6 pt-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
          {/* Columna izquierda (1 imagen grande - Categoría posición 0) */}
          {mainCategory && (
            <Link href={`/productos?categoryIds=${mainCategory.id}`}>
              <motion.div
                className="relative aspect-video md:aspect-square cursor-pointer"
                variants={scaleIn}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <Image
                  src={
                    mainCategory.coverImage ||
                    "/images/placeholder_liwilu_cat.png"
                  }
                  alt={mainCategory.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover rounded-md md:rounded-xl shadow-lg"
                />

                <div className="absolute bottom-2 right-2 text-white text-2xl md:text-4xl px-4 py-2 rounded-tl-lg font-semibold uppercase">
                  {mainCategory.name}
                </div>
              </motion.div>
            </Link>
          )}

          {/* Columna derecha (4 imágenes pequeñas) */}
          <motion.div
            className="grid grid-cols-2 grid-rows-2 gap-2 md:gap-4"
            variants={staggerContainer}
          >
            {otherCategories.map((category) => (
              <Link
                key={category.id}
                href={`/productos?categoryIds=${category.id}`}
              >
                <motion.div
                  className="relative h-40 md:h-auto md:aspect-square cursor-pointer"
                  variants={scaleIn}
                  whileHover={{ scale: 1.05 }}
                >
                  <Image
                    src={
                      category.coverImage ||
                      "/images/placeholder_liwilu_cat.png"
                    }
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover rounded-md md:rounded-xl shadow-md"
                  />
                  <div className="absolute bottom-1 left-1 text-white text-lg md:text-xl px-4 py-2 rounded-tl-lg font-semibold uppercase">
                    {category.name}
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Productos Destacados */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <ProductosDestacados
          featuredProducts={featuredProducts}
          error={error}
        />
      </motion.div>

      {/* Beneficios */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Beneficios />
      </motion.div>

      {/* Contacto */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
        transition={{ duration: 0.8 }}
      >
        <Contacto />
      </motion.div>

      {/* Cómo Comprar */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <ComoComprar />
      </motion.div>

      {/* Nuestros Productos */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <NuestrosProductos productos={allProducts} />
      </motion.div>

      {/* Aptitudes */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeInUp}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Aptitudes />
      </motion.div>
    </Layout>
  );
}
