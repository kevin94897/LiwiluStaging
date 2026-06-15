import { useState, useEffect } from 'react';
import { PERU_LOCATIONS, DEPARTAMENTOS } from '@/lib/locationsComplete';

export function useLocations(initialDept = '', initialProv = '', initialDist = '') {
    const [selectedDept, setSelectedDept] = useState(initialDept);
    const [selectedProv, setSelectedProv] = useState(initialProv);
    const [selectedDist, setSelectedDist] = useState(initialDist);

    const [provinces, setProvinces] = useState<string[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);

    // Efecto para cargar provincias cuando cambia el departamento
    useEffect(() => {
        if (selectedDept && PERU_LOCATIONS[selectedDept]) {
            const provs = Object.keys(PERU_LOCATIONS[selectedDept]).sort();
            setProvinces(provs);

            // Si la provincia seleccionada no está en la nueva lista, resetear
            if (selectedProv && !provs.includes(selectedProv)) {
                setSelectedProv('');
                setSelectedDist('');
            } else if (!selectedProv) {
                // Opcional: Auto-seleccionar si solo hay 1
                // setSelectedProv(''); 
            }
        } else {
            setProvinces([]);
            setSelectedProv('');
            setSelectedDist('');
        }
    }, [selectedDept]);

    // Efecto para cargar distritos cuando cambia la provincia
    useEffect(() => {
        if (selectedDept && selectedProv && PERU_LOCATIONS[selectedDept]?.[selectedProv]) {
            const dists = PERU_LOCATIONS[selectedDept][selectedProv].sort();
            setDistricts(dists);

            // Si el distrito seleccionado no está en la nueva lista, resetear
            if (selectedDist && !dists.includes(selectedDist)) {
                setSelectedDist('');
            }
        } else {
            setDistricts([]);
            setSelectedDist('');
        }
    }, [selectedDept, selectedProv]);

    const handleDeptChange = (value: string) => {
        setSelectedDept(value);
        setSelectedProv(''); // Resetear provincia al cambiar departamento
        setSelectedDist(''); // Resetear distrito
    };

    const handleProvChange = (value: string) => {
        setSelectedProv(value);
        setSelectedDist(''); // Resetear distrito al cambiar provincia
    };

    const handleDistChange = (value: string) => {
        setSelectedDist(value);
    };

    // Función helper para setear valores manualmente (útil para modo edición)
    const setLocationValues = (dept: string, prov: string, dist: string) => {
        setSelectedDept(dept);
        // Necesitamos asegurar que el efecto de provincias corra, pero como es async por el useEffect,
        // podríamos tener problemas de race condition si seteamos todo de golpe sin batching.
        // React 18 hace batching automático, pero para asegurar, los efectos se encargarán de validar.
        // Sin embargo, si 'prov' es válido para 'dept', el efecto lo mantendrá si lo pasamos aquí?
        // El efecto dice: if (selectedProv && !provs.includes(selectedProv)) -> reset.
        // Al setear aquí, selectedProv cambia. El efecto de selectedDept cambia provincias.
        // Si seteamos todo junto, en el siguiente render selectedDept y selectedProv tendrán los valores nuevos.
        // El efecto de selectedDept se ejecutará. Calculará 'provs'.
        // Si el 'prov' nuevo está en 'provs', NO se resetea. :) 
        setSelectedProv(prov);
        setSelectedDist(dist);
    };

    return {
        departments: DEPARTAMENTOS,
        provinces,
        districts,
        selectedDept,
        selectedProv,
        selectedDist,
        handleDeptChange,
        handleProvChange,
        handleDistChange,
        setLocationValues
    };
}
