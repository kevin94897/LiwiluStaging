import Image from "next/image";
import Link from "next/link";
import { FaInstagram, FaFacebook, FaYoutube, FaTiktok } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#032d2b] to-[#0a4742] text-white py-10 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 border-b border-white/20 pb-10">

        {/* Columna 1: Logo + contacto */}
        <div className="space-y-3">
          <Image
            src="/images/liwilu_logo.png"
            alt="Liwilu"
            width={140}
            height={40}
            className="object-contain"
          />
          <p className="text-sm text-gray-200">
            Calle Santa Lucía 359 <br />
            Urbanización La Aurora - Ate
          </p>
          <p className="text-sm text-gray-200">
            Call center (01) 7028086
          </p>
          <div className="text-sm">
            <p><strong>Opción 1:</strong> Consultas y reclamos</p>
            <p><strong>Opción 2:</strong> Compras y asesor de ventas</p>
          </div>
        </div>

        {/* Columna 2: Enlaces */}
        <div>
          <h3 className="font-semibold mb-4 text-white">Tiendas campañas 2026</h3>
          <ul className="space-y-2 text-sm text-gray-200">
            <li><Link href="#">Políticas de cookies</Link></li>
            <li><Link href="#">Políticas de privacidad y manejo de datos personales</Link></li>
            <li><Link href="#">Políticas de aceptación de envío publicidad y promociones</Link></li>
            <li><Link href="#">Políticas de cambios y devoluciones</Link></li>
            <li><Link href="#">Políticas de envíos y recojo en tienda</Link></li>
          </ul>
        </div>

        {/* Columna 3: Suscripción y redes */}
        <div className="space-y-4">
          <Image
            src="/images/liwilu_libro_reclamaciones.png"
            alt="Libro de reclamaciones"
            width={90}
            height={90}
          />
          <div className="flex items-center gap-3">
            <div>
              <h4 className="text-white font-semibold text-sm mb-2">
                ¡Entérate de las últimas novedades!
              </h4>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Dirección de correo electrónico"
                  className="px-4 py-2 rounded-l-md text-black text-sm w-full"
                />
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 px-4 rounded-r-md text-sm font-semibold"
                >
                  Registrarse
                </button>
              </form>
            </div>
          </div>

          {/* Redes sociales */}
          <div className="flex items-center gap-4 mt-6">
            <Link href="#" className="hover:opacity-80">
              <FaFacebook className="w-6 h-6 hover:text-blue-400 transition" />
            </Link>
            <Link href="#" className="hover:opacity-80">
              <FaInstagram className="w-6 h-6 hover:text-pink-400 transition" />
            </Link>
            <Link href="#" className="hover:opacity-80">
              <FaTiktok className="w-6 h-6 hover:text-gray-300 transition" />
            </Link>
          </div>

          {/* Medios de pago */}
          <div className="flex gap-2 mt-4">
            <Image src="/images/payments/visa.svg" alt="Visa" width={40} height={20} />
            <Image src="/images/payments/mastercard.svg" alt="Mastercard" width={40} height={20} />
            <Image src="/images/payments/amex.svg" alt="Amex" width={40} height={20} />
            <Image src="/images/payments/yape.svg" alt="Yape" width={40} height={20} />
            <Image src="/images/payments/plin.svg" alt="Plin" width={40} height={20} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Liwilu. Todos los derechos reservados.
      </div>
    </footer>
  );
}
