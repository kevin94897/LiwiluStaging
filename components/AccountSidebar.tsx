// components/AccountSidebar.tsx
import Link from "next/link";
import { useRouter } from "next/router";

interface AccountSidebarProps {
  activeSection?: string;
}

export default function AccountSidebar({ activeSection }: AccountSidebarProps) {
  const router = useRouter();

  const menuItems = [
    { id: "mi-cuenta", label: "Mi cuenta", href: "/mi-cuenta" },
    { id: "mis-datos", label: "Mis datos", href: "/mi-cuenta/mis-datos" },
    { id: "direcciones", label: "Direcciones", href: "/mi-cuenta/direcciones" },
    { id: "mis-pedidos", label: "Mis pedidos", href: "/mi-cuenta/mis-pedidos" },
    {
      id: "mis-favoritos",
      label: "Mis favoritos",
      href: "/mi-cuenta/mis-favoritos",
    },
  ];

  const handleLogout = () => {
    // Aquí iría la lógica de cierre de sesión
    console.log("Cerrando sesión...");
    router.push("/");
  };

  return (
    <aside className="lg:w-80 ">
      <h2 className="text-2xl md:text-4xl font-semibold pb-4 text-center block lg:hidden">
        Mi cuenta
      </h2>
      <nav className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {menuItems.map((item, index) => {
          const isActive = activeSection === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
								flex items-center justify-between px-6 py-4 
								transition-colors duration-200
								${isActive ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-50"}
								${index !== menuItems.length ? "border-b border-gray-100" : ""}
							`}
            >
              <span className="font-medium">{item.label}</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          );
        })}

        {/* Cerrar sesión */}
        <button className="w-full flex items-center justify-between px-6 py-4 text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200 text-left">
          <span className="font-medium">Cerrar sesión</span>

          <svg
            stroke="currentColor"
            fill="currentColor"
            stroke-width="0"
            viewBox="0 0 512 512"
            height="18"
            width="18"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M497 273L329 441c-15 15-41 4.5-41-17v-96H152c-13.3 0-24-10.7-24-24v-96c0-13.3 10.7-24 24-24h136V88c0-21.4 25.9-32 41-17l168 168c9.3 9.4 9.3 24.6 0 34zM192 436v-40c0-6.6-5.4-12-12-12H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h84c6.6 0 12-5.4 12-12V76c0-6.6-5.4-12-12-12H96c-53 0-96 43-96 96v192c0 53 43 96 96 96h84c6.6 0 12-5.4 12-12z"></path>
          </svg>
        </button>
      </nav>
    </aside>
  );
}
