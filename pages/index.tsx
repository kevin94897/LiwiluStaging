import Head from 'next/head';
import Link from 'next/link';
import { GetServerSideProps } from 'next';
import Image from 'next/image'
import { getFeaturedProducts, formatPrice, Product } from '../lib/prestashop';

interface HomeProps {
  featuredProducts: Product[];
  error?: string;
}

export default function Home({ featuredProducts, error }: HomeProps) {

  return (
    <>
      <Head>
        <title>Liwilu - Compra por MAYOR</title>
        <meta name="description" content="Liwilu - Tienda por mayor" />
      </Head>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-teal-900 to-teal-700 text-white py-3 px-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="text-2xl font-bold">Liwilu</div>
            <nav className="hidden md:flex gap-6">
              <Link href="/">Inicio</Link>
              <Link href="/productos">Productos</Link>
              <Link href="/contacto">Contacto</Link>
            </nav>
            <div className="flex items-center gap-4">
              <input
                type="search"
                placeholder="Buscar productos..."
                className="px-4 py-2 rounded-full text-black w-64"
              />
              <div className="relative">
                <span className="text-xl">🛒</span>
                <span className="absolute -top-2 -right-2 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center text-xs">0</span>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Slider */}
        <section className="relative text-white overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/images/liwilu_home_banner_bg.png"
              alt="Hero background"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-6 py-16 flex items-center justify-between">
            <div className="w-1/2">
              <h1 className="text-5xl font-bold mb-4">Macbook PRO</h1>
              <p className="text-3xl mb-2">de 14 pulgadas M4</p>
              <p className="text-xl mb-6">Compra desde: <span className="text-3xl font-bold">S/ 3,500</span></p>
              <button className="bg-green-500 hover:bg-green-600 px-8 py-3 rounded-lg text-lg font-semibold">
                Comprar ahora
              </button>
            </div>
            <div className="w-1/2">
              <Image
                src="/images/liwilu_home_laptop_img.png"
                alt="Descripción de la imagen"
                width={500}
                height={300}
              />
            </div>
          </div>
        </section>

        {/* Categorías */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'UNIFORMES', img: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=300&h=200&fit=crop' },
              { name: 'LIBROS', img: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&h=200&fit=crop' },
              { name: 'HOGAR Y LIMPIEZA', img: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=300&h=200&fit=crop' },
              { name: 'TECNOLOGÍA', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=200&fit=crop' }
            ].map((cat, i) => (
              <Link href={`/productos?categoria=${cat.name}`} key={i}>
                <div className="relative rounded-xl overflow-hidden h-32 cursor-pointer hover:scale-105 transition">
                  <Image 
                    src={cat.img} 
                    alt={cat.name} 
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <h3 className="text-white font-bold text-lg">{cat.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Productos Destacados */}
        <section className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-3xl font-bold text-center mb-8">Productos destacados</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}

          {featuredProducts.length === 0 ? (
            <div className="text-center py-12 bg-gray-100 rounded-xl">
              <p className="text-xl text-gray-600 mb-4">
                No se pudieron cargar los productos de PrestaShop
              </p>
              <Link href="/api/test-prestashop" target="_blank">
                <button className="bg-blue-500 text-white px-6 py-2 rounded-lg">
                  🔍 Probar Conexión API
                </button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                    <div className="relative">
                      <span className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                        OFERTA
                      </span>
                      <div className="relative w-full h-48">
                        <Image
                          src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop"
                          alt={product.name?.[0]?.value || "Producto"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button className="absolute top-2 right-2 bg-white rounded-full p-2 hover:bg-gray-100 z-10">
                        ❤️
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2 h-10">
                        {product.name?.[0]?.value || 'Producto sin nombre'}
                      </h3>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm line-through">
                          {formatPrice(parseFloat(product.price || '0') * 1.2)}
                        </span>
                        <span className="text-green-600 font-bold text-lg">
                          {formatPrice(product.price || '0')}
                        </span>
                      </div>
                      <button className="w-full mt-3 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
                        <span>+</span>
                        <span>Agregar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-8">
                {/* <p className="text-sm text-gray-600 mb-2">
                  ✅ Mostrando {featuredProducts.length} productos desde PrestaShop
                </p> */}
                <Link href="/productos">
                  <button className="bg-teal-800 hover:bg-teal-900 text-white px-8 py-3 rounded-lg font-semibold">
                    Ver todos los productos →
                  </button>
                </Link>
              </div>
            </>
          )}
        </section>

        {/* Footer */}
        <footer className="bg-teal-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Liwilu</h3>
              <p className="text-sm">Donde la calidad y el precio se unen para ti.</p>
            </div>
            <div>
              <h4 className="font-bold mb-3">Tienda</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/productos">Productos</Link></li>
                <li><Link href="/ofertas">Ofertas</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Ayuda</h4>
              <ul className="space-y-2 text-sm">
                <li>Política de devolución</li>
                <li>Términos y condiciones</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Contacto</h4>
              <p className="text-sm">Call center: (01) 7010100</p>
              <p className="text-sm">Email: contacto@liwilu.com</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

// Obtener datos en el servidor
export const getServerSideProps: GetServerSideProps = async () => {
  try {
    console.log('🔄 Cargando productos desde PrestaShop...');
    const featuredProducts = await getFeaturedProducts();

    return {
      props: {
        featuredProducts,
      },
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    console.error('💥 Error al cargar productos:', errorMessage);
    return {
      props: {
        featuredProducts: [],
        error: errorMessage,
      },
    };
  }
};