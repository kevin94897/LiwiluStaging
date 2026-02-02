// components/Footer.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";
import { PiWarningCircleFill } from "react-icons/pi";
import StoresModal from "@/components/StoresModal";
import { apiPost } from "@/lib/auth/apiClient";
import { newsletterSchema, NewsletterSchemaType } from "@/lib/newsletterSchema";

export default function Footer() {
  const [newsletterData, setNewsletterData] = useState<NewsletterSchemaType>({
    email: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof NewsletterSchemaType, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewsletterData({ email: e.target.value });
    setErrors({});
    setSuccessMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage("");

    // Validación con Zod
    const result = newsletterSchema.safeParse(newsletterData);

    if (!result.success) {
      const formattedErrors = result.error.flatten().fieldErrors;
      const newErrors: Partial<Record<keyof NewsletterSchemaType, string>> = {};

      for (const key in formattedErrors) {
        const errorArray = formattedErrors[key as keyof typeof formattedErrors];
        if (errorArray && errorArray.length > 0) {
          newErrors[key as keyof NewsletterSchemaType] = errorArray[0];
        }
      }

      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    // Si es válido
    setErrors({});
    console.log("Newsletter suscripción:", newsletterData);

    try {
      await apiPost("/general/newsletter", newsletterData, { skipAuth: true });

      setSuccessMessage("¡Suscripción exitosa! 🎉");
      setNewsletterData({ email: "" });

      // Limpiar mensaje de éxito después de 5 segundos
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      console.error("Error al suscribirse:", error);
      setErrors({ email: "Hubo un error al suscribirse. Intenta nuevamente." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="text-white py-10 px-6 relative">
      <div className="absolute inset-0">
        <Image
          src="/images/liwilu_footer.png"
          alt="Banner"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 border-b border-white/20 pb-10 relative z-10">
        {/* Columna 1 → 1/3 */}
        <div className="md:col-span-2 md:border-r border-white/50 md:pr-8">
          {/* Columna 1: Logo + contacto */}
          <div className="space-y-3">
            <Image
              src="/images/liwilu_logo.png"
              alt="Liwilu"
              width={140}
              height={40}
              className="object-contain"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-200">
                  Calle Santa Lucía 359 <br />
                  Urbanización La Aurora - Ate
                </p>
                <p className="text-sm text-gray-200">
                  Call center (01) 7028086
                </p>
                <div className="text-sm">
                  <p>
                    <strong>Opción 1:</strong> Consultas y reclamos
                  </p>
                  <p>
                    <strong>Opción 2:</strong> Compras y asesor de ventas
                  </p>
                </div>
                <ul>
                  <li>
                    <Link href="/nosotros">Nosotros</Link>
                  </li>
                  <li>
                    <Link href="/nosotros#mision">Misión</Link>
                  </li>
                  <li>
                    <Link href="/nosotros#vision">Visión</Link>
                  </li>
                  <li>
                    <Link href="#">Valores</Link>
                  </li>
                  <li>
                    <Link href="/trabajemos-juntos">
                      Trabaja con nosotros
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Columna 2: Enlaces */}
              <div>
                <StoresModal />
                <ul className="space-y-2 text-sm text-gray-200">
                  <li>
                    <Link href="/politicas/politica-de-cookies">
                      Políticas de cookies
                    </Link>
                  </li>
                  <li>
                    <Link href="/politicas/politica-de-privacidad">
                      Políticas de privacidad y manejo de datos personales
                    </Link>
                  </li>
                  <li>
                    <Link href="/politicas/politica-de-publicidad">
                      Políticas de aceptación de envío publicidad y promociones
                    </Link>
                  </li>
                  <li>
                    <Link href="/politicas/politica-de-devoluciones">
                      Políticas de cambios y devoluciones
                    </Link>
                  </li>
                  <li>
                    <Link href="/politicas/politica-de-envio-y-recojo-pedidos">
                      Políticas de envíos y recojo en tienda
                    </Link>
                  </li>
                  <li>
                    <Link href="/terminos-y-condiciones">
                      Términos y Condiciones
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Columna 2 → 2/3 */}
        <div className="md:col-span-1">
          {/* Columna 3: Suscripción y redes */}
          <div className="space-y-4">
            <Link href="/libro-reclamaciones">
              <Image
                src="/images/liwilu_libro_reclamaciones.png"
                alt="Libro de reclamaciones"
                width={90}
                height={90}
              />
            </Link>
            <div>
              <h4 className="text-white font-semibold text-sm mb-2">
                ¡Entérate de las últimas novedades!
              </h4>
              <form onSubmit={handleSubmit} className="space-y-2">
                <div className="flex">
                  <input
                    type="email"
                    name="email"
                    value={newsletterData.email}
                    onChange={handleChange}
                    placeholder="Dirección de correo electrónico"
                    className={`px-4 py-2 rounded-l-sm text-primary-dark text-sm w-full focus:outline-none focus:ring-2 transition ${errors.email
                      ? "ring-2 ring-red-400"
                      : "focus:ring-white/50"
                      }`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary-dark px-4 rounded-r-sm text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-1">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      </span>
                    ) : (
                      "Registrarse"
                    )}
                  </button>
                </div>

                {/* Mensaje de error */}
                {errors.email && (
                  <p className="text-red-300 text-xs flex items-center gap-1 bg-red-500/20 px-2 py-1 rounded">
                    <PiWarningCircleFill size={14} /> {errors.email}
                  </p>
                )}

                {/* Mensaje de éxito */}
                {successMessage && (
                  <p className="text-green-300 text-xs flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded animate-fade-in">
                    ✓ {successMessage}
                  </p>
                )}
              </form>
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
            <div className="gap-3 mt-4">
              {[
                "apple-pay",
                "google-pay",
                "visa",
                "mastercard",
                "amex",
                "yape",
                "plin",
              ].map((brand) => (
                <Image
                  key={brand}
                  src={`/images/vectores/payments/${brand}.svg`}
                  alt={brand}
                  width={120}
                  height={80}
                  className="h-5 w-auto object-contain inline-block ml-2"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 text-center text-sm text-gray-400 relative z-10">
        © {new Date().getFullYear()} Liwilu. Todos los derechos reservados.
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </footer>
  );
}
