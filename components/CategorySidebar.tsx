import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaPlus, FaMinus, FaXmark } from "react-icons/fa6"; // Updated to FaXmark for consistency
import { HierarchyResponse, HierarchyItem } from "@/lib/catalog";

// Aplana el árbol pre-anidado que entrega el backend (cada item trae su
// array `children`) a una lista plana con la profundidad de cada nodo, para
// renderizar la jerarquía con sangría. Los atributos (sin children) quedan
// todos en profundidad 0.
function flattenWithDepth(
  items: HierarchyItem[],
  depth = 0,
): { item: HierarchyItem; depth: number }[] {
  return items.flatMap((item) => [
    { item, depth },
    ...flattenWithDepth(item.children ?? [], depth + 1),
  ]);
}

interface CategorySidebarProps {
  hierarchy: HierarchyResponse | null;
  currentFilters: {
    categoryIds?: string;
    brandIds?: string;
    attributeIds?: string;
  };
  onFilterChange: (newParams: {
    categoryIds?: string;
    brandIds?: string;
    attributeIds?: string;
  }) => void;
  isOpenMobile?: boolean; // 🆕 Prop for mobile drawer
  onCloseMobile?: () => void; // 🆕 Callback to close mobile drawer
}

export default function CategorySidebar({
  hierarchy,
  currentFilters,
  onFilterChange,
  isOpenMobile = false,
  onCloseMobile,
}: CategorySidebarProps) {
  const [openCategories, setOpenCategories] = useState<string[]>([
    "Categoria",
    "Marca",
    "Atributos",
    "Color",
    "Talla",
    "Etiqueta",
  ]);

  // Disable body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpenMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpenMobile]);

  const toggleGroup = (group: string) => {
    setOpenCategories((prev) =>
      prev.includes(group) ? prev.filter((c) => c !== group) : [...prev, group],
    );
  };

  const getSelectedIds = (type: "category" | "brand" | "attribute") => {
    let rawString: string | undefined;
    if (type === "category") rawString = currentFilters.categoryIds;
    else if (type === "brand") rawString = currentFilters.brandIds;
    else rawString = currentFilters.attributeIds;

    return rawString && rawString !== "all" ? rawString.split(",") : [];
  };

  const handleSelect = (
    id: string,
    type: "category" | "brand" | "attribute",
  ) => {
    const currentIds = getSelectedIds(type);
    let newIds: string[];

    if (currentIds.includes(id)) {
      newIds = currentIds.filter((i) => i !== id);
    } else {
      newIds = [...currentIds, id];
    }

    const newString = newIds.length > 0 ? newIds.join(",") : undefined;

    const update: any = {};
    if (type === "category") update.categoryIds = newString;
    else if (type === "brand") update.brandIds = newString;
    else update.attributeIds = newString;

    onFilterChange(update);
  };

  const handleCleanFilters = () => {
    onFilterChange({
      categoryIds: undefined,
      brandIds: undefined,
      attributeIds: undefined,
    });
  };

  const hasActiveFilters =
    (currentFilters.categoryIds && currentFilters.categoryIds !== "all") ||
    (currentFilters.brandIds && currentFilters.brandIds !== "all") ||
    (currentFilters.attributeIds && currentFilters.attributeIds !== "all");

  if (!hierarchy) return null;

  const sidebarContent = (className?: string) => (
    <div
      className={`bg-white rounded-br-lg rounded-tr-lg md:rounded-2xl shadow-lg p-6 divide-y divide-gray-100 border border-gray-100 ${className || ""}`}
    >
      {/* Header con Limpiar Filtros */}
      <div className="pb-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-lg">Filtros</h3>
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={handleCleanFilters}
                className="text-xs font-semibold text-primary hover:text-primary-dark hover:underline transition-colors"
              >
                Limpiar selección
              </button>
            )}
            {/* Close button for mobile */}
            <button
              onClick={onCloseMobile}
              className="md:hidden text-gray-400 hover:text-gray-900 transition-colors"
            >
              <FaXmark size={20} />
            </button>
          </div>
        </div>

        <Link
          href="/productos"
          className="block w-full text-center bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-semibold py-2.5 px-4 rounded-xl transition-all duration-300 hover:shadow-sm text-sm"
          onClick={onCloseMobile}
        >
          Ver todos los productos
        </Link>
      </div>

      {hierarchy.hierarchy.parentGroups
        .filter((group) =>
          hierarchy.hierarchy.items.some(
            (item) => item.nameParent === group.nameParent,
          ),
        )
        .map((group) => {
          const groupName = group.name;
          const isOpen = openCategories.includes(groupName);
          const items = flattenWithDepth(
            hierarchy.hierarchy.items.filter(
              (item) => item.nameParent === group.nameParent,
            ),
          );

          return (
            <div key={groupName} className="py-5">
              <button
                onClick={() => toggleGroup(groupName)}
                className="w-full flex justify-between items-center group"
              >
                <span className="font-semibold text-gray-800 text-base group-hover:text-primary transition-colors">
                  {groupName}
                </span>
                <span className="text-gray-400 group-hover:text-primary transition-colors">
                  {isOpen ? (
                    <FaMinus className="w-3 h-3" />
                  ) : (
                    <FaPlus className="w-3 h-3" />
                  )}
                </span>
              </button>

              {isOpen && (
                <ul className="space-y-3 mt-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map(({ item, depth }) => {
                    const itemType = item.type;
                    const selectedIdsForType = getSelectedIds(itemType);
                    const isSelected = selectedIdsForType.includes(
                      item.id.toString(),
                    );

                    return (
                      <li key={`${itemType}-${item.id}`}>
                        <button
                          onClick={() =>
                            handleSelect(item.id.toString(), itemType)
                          }
                          style={
                            depth > 0
                              ? { paddingLeft: `${depth * 16}px` }
                              : undefined
                          }
                          className="w-full text-left group flex items-start gap-3"
                        >
                          <div
                            className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all duration-200 ${isSelected
                              ? "bg-primary border-primary"
                              : "border-gray-300 bg-white group-hover:border-primary"
                              }`}
                          >
                            {isSelected && (
                              <svg
                                className="w-2.5 h-2.5 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            )}
                          </div>
                          <span
                            className={`text-sm transition-colors ${isSelected
                              ? "text-primary font-medium"
                              : "text-gray-600 group-hover:text-gray-900"
                              }`}
                          >
                            {item.name}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}

      {/* Seasonal Banner (Only in Desktop or Drawer bottom) */}
      <div className="pt-6">
        <div className="relative h-64 md:h-72 group rounded-md overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
          <Image
            src="/images/productos/liwilu_tienda_filtros.png"
            alt="Banner Promocional"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
          {/* <div className="absolute bottom-6 left-6 text-white">
            <div className="bg-primary px-3 py-1 rounded-full text-xs font-semibold inline-block mb-2">
              Colección 2024
            </div>
            <h4 className="text-xl font-semibold mb-1">Nuevas Llegadas</h4>
            <p className="text-sm text-gray-200">Última tecnología</p>
          </div> */}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Version */}
      <aside className="w-full md:w-64 flex-shrink-0 md:block hidden">
        {sidebarContent()}
      </aside>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-[100] transition-all duration-300 md:hidden ${isOpenMobile
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
          }`}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/60 transition-opacity duration-300"
          onClick={onCloseMobile}
        />

        {/* Sidebar Container */}
        <div
          className={`absolute inset-y-0 left-0 w-[85%] max-w-[320px] transform transition-transform duration-300 ease-out ${isOpenMobile ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          {sidebarContent("h-full overflow-y-auto custom-scrollbar")}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </>
  );
}
