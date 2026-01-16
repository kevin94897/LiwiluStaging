import { useState } from "react";
import Image from "next/image";
import { FaPlus, FaMinus } from "react-icons/fa";
import { HierarchyResponse } from "@/lib/catalog";

interface CategorySidebarProps {
    hierarchy: HierarchyResponse | null;
    selectedCategory: string;
    onCategorySelect: (categoryId: string | undefined) => void;
}

export default function CategorySidebar({
    hierarchy,
    selectedCategory,
    onCategorySelect,
}: CategorySidebarProps) {
    const [openCategories, setOpenCategories] = useState<string[]>(["Categoria"]);

    const toggleCategory = (category: string) => {
        setOpenCategories((prev) =>
            prev.includes(category)
                ? prev.filter((c) => c !== category)
                : [...prev, category]
        );
    };

    if (!hierarchy) return null;

    return (
        <aside className="w-full md:w-64 flex-shrink-0 md:block hidden">
            <div className="bg-white rounded-2xl shadow-lg p-5 divide-y divide-gray-200">
                {hierarchy.hierarchy.parentGroups
                    .filter((group) =>
                        hierarchy.hierarchy.items.some(
                            (item) => item.nameParent === group.nameParent
                        )
                    )
                    .map((group) => {
                        const groupName = group.name;
                        const isOpen = openCategories.includes(groupName);
                        const items = hierarchy.hierarchy.items.filter(
                            (item) => item.nameParent === group.nameParent
                        );

                        return (
                            <div key={groupName} className="py-4">
                                <button
                                    onClick={() => toggleCategory(groupName)}
                                    className="w-full flex justify-between items-center font-semibold text-sm text-primary-dark"
                                >
                                    <span>{groupName}</span>
                                    <span className="text-2xl font-light text-primary-dark">
                                        {isOpen ? (
                                            <FaMinus className="w-3 h-3 transition" />
                                        ) : (
                                            <FaPlus className="w-3 h-3 transition" />
                                        )}
                                    </span>
                                </button>

                                {isOpen && (
                                    <ul className="space-y-3 mt-4">
                                        {/* Add "Ver todos" option for Categoria group */}
                                        {groupName === "Categoria" && (
                                            <li>
                                                <button
                                                    onClick={() => onCategorySelect(undefined)}
                                                    className={`w-full text-left transition-colors flex items-center justify-between ${selectedCategory === "all"
                                                        ? "text-primary"
                                                        : "text-gray-500 hover:text-primary-dark"
                                                        }`}
                                                >
                                                    <span className="text-sm">Ver todos</span>
                                                    {selectedCategory === "all" && (
                                                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                                                    )}
                                                </button>
                                            </li>
                                        )}
                                        {items.map((item) => (
                                            <li key={item.id}>
                                                <button
                                                    onClick={() => onCategorySelect(item.id.toString())}
                                                    className={`w-full text-left transition-colors flex items-center justify-between ${selectedCategory === item.id.toString()
                                                        ? "text-primary"
                                                        : "text-gray-500 hover:text-primary-dark"
                                                        }`}
                                                >
                                                    <span className="text-sm">{item.name}</span>
                                                    {selectedCategory === item.id.toString() && (
                                                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                                                    )}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
            </div>

            <div className="hidden md:block mt-6 bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-64">
                    <Image
                        src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=500&fit=crop"
                        alt="Banner"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">
                        Nuevo
                    </div>
                </div>
            </div>
        </aside>
    );
}
