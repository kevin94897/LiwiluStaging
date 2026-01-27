import "@/styles/globals.css";
import "@/styles/slider.css";
import type { AppProps } from "next/app";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <CartProvider>
        <main className={`${outfit.variable} font-sans`}>
          <Component {...pageProps} />
        </main>
        {/* Notificaciones toast */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: "liwilu-toast",
            duration: 3000,
          }}
        />
      </CartProvider>
    </AuthProvider>
  );
}
