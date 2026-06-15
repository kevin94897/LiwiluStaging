// components/Footer.tsx
"use client";

import { useState, useEffect } from "react";
import logger from "@/lib/logger";
import Image from "next/image";
import Link from "next/link";
import { FaInstagram, FaFacebook, FaTiktok } from "react-icons/fa";
import { PiWarningCircleFill } from "react-icons/pi";
import StoresModal from "@/components/StoresModal";
import { apiPost } from "@/lib/auth/apiClient";
import { newsletterSchema, NewsletterSchemaType } from "@/lib/newsletterSchema";
import { fetchFooterAcf, FooterAcfData } from "@/lib/acf-home";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
function resolveUrl(url?: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function Footer() {
  const [acf, setAcf] = useState<FooterAcfData>({});

  useEffect(() => {
    fetchFooterAcf().then(setAcf).catch(() => {});
  }, []);
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
    logger.log("Newsletter suscripción:", newsletterData);

    try {
      const response = await apiPost("/general/newsletter", newsletterData, {
        skipAuth: true,
      });
      const data = await response.json();

      if (data.alreadySubscribed) {
        setErrors({ email: "Este correo ya está suscrito." });
        return;
      }

      if (data.success) {
        setSuccessMessage(data.message || "¡Suscripción exitosa! 🎉");
        setNewsletterData({ email: "" });

        // Limpiar mensaje de éxito después de 5 segundos
        setTimeout(() => setSuccessMessage(""), 5000);
      } else {
        throw new Error(data.message || "Error al suscribirse");
      }
    } catch (error) {
      logger.error("Error al suscribirse:", error);
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
        {/* Columna 1 */}
        <div className="md:col-span-2 md:border-r border-white/50 md:pr-8">
          <div className="space-y-3">
            {acf.columna1?.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resolveUrl(acf.columna1.logo)} alt="Liwilu" className="h-10 object-contain" />
            ) : null}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Col 1: info + enlaces */}
              <div className="space-y-2">
                {acf.columna1?.info && (
                  <div
                    className="richtext-content text-sm text-gray-200"
                    dangerouslySetInnerHTML={{ __html: acf.columna1.info }}
                  />
                )}
                {acf.columna1?.enlaces && acf.columna1.enlaces.length > 0 && (
                  <ul className="space-y-1 text-sm text-gray-200">
                    {acf.columna1.enlaces.map((link, i) => (
                      <li key={i}>
                        <Link href={link.url} className="hover:underline">
                          {link.text || link.url}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Col 2: tiendas modal + enlaces */}
              <div className="space-y-2">
                {acf.columna2?.modalTiendas && <StoresModal />}
                {acf.columna2?.enlaces && acf.columna2.enlaces.length > 0 && (
                  <ul className="space-y-2 text-sm text-gray-200">
                    {acf.columna2.enlaces.map((link, i) => (
                      <li key={i}>
                        <Link href={link.url} className="hover:underline">
                          {link.text || link.url}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Columna 3 */}
        <div className="md:col-span-1">
          <div className="space-y-4">
            {acf.columna3?.libroUrl && (
              <Link target="_blank" href={acf.columna3.libroUrl}>
                <Image
                  src="/images/liwilu_libro_reclamaciones.png"
                  alt="Libro de reclamaciones"
                  width={90}
                  height={90}
                />
              </Link>
            )}
            {acf.columna3?.newsletter && (
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
                    className={`px-4 py-2 rounded-l-sm text-primary-dark text-sm w-full focus:outline-none focus:ring-2 transition ${
                      errors.email
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
            )}

            {/* Redes sociales */}
            {acf.columna3?.redes && acf.columna3.redes.length > 0 && (
              <div className="flex items-center gap-4 mt-6">
                {acf.columna3.redes.map((url, i) => (
                  <Link key={i} href={url} target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                    {url.includes('facebook') && <FaFacebook className="w-6 h-6 hover:text-blue-400 transition" />}
                    {url.includes('instagram') && <FaInstagram className="w-6 h-6 hover:text-pink-400 transition" />}
                    {url.includes('tiktok') && <FaTiktok className="w-6 h-6 hover:text-gray-300 transition" />}
                    {!url.includes('facebook') && !url.includes('instagram') && !url.includes('tiktok') && (
                      <span className="text-xs underline">{url}</span>
                    )}
                  </Link>
                ))}
              </div>
            )}

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
