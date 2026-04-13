import { useState, useEffect, useCallback, useRef } from 'react';
import { consultaDNI, consultaRUC, DniConsultationResponse, RucConsultationResponse } from '@/lib/general';
import { showToast } from '@/lib/notifications';
import logger from '@/lib/logger';

interface UseDocumentLookupProps {
    type: string;
    number: string;
    onSuccess: (data: any) => void;
    enabled?: boolean;
}

export const useDocumentLookup = ({ type, number, onSuccess, enabled = true }: UseDocumentLookupProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isConsulted, setIsConsulted] = useState(false);
    /** '10' = persona natural (RUC 10/15), '20' = empresa (RUC 20), null = no aplica */
    const [rucType, setRucType] = useState<'10' | '20' | null>(null);
    
    // Usar refs para evitar que cambios en props o estado interno disparen el efecto innecesariamente
    const onSuccessRef = useRef(onSuccess);
    onSuccessRef.current = onSuccess;
    
    const isConsultingRef = useRef(false);
    const lastConsultedRef = useRef('');

    const performLookup = useCallback(async (docType: string, docNumber: string) => {
        if (!enabled || docNumber === lastConsultedRef.current || isConsultingRef.current) {
            return;
        }

        // Validar largos mínimos/máximos para consulta automática
        if ((docType === 'DNI' && docNumber.length === 8) || (docType === 'RUC' && docNumber.length === 11)) {
            isConsultingRef.current = true;
            setIsLoading(true);
            try {
                let res;
                if (docType === 'DNI') {
                    res = await consultaDNI(docNumber);
                } else {
                    res = await consultaRUC(docNumber);
                }

                // La API puede retornar success:true pero data como string cuando no existe
                // e.g. {"success":true,"data":"Ruc No existe!! "}
                const hasValidData = res.success && res.data && typeof res.data === 'object';

                if (hasValidData) {
                    onSuccessRef.current(res.data);
                    setIsConsulted(true);
                    lastConsultedRef.current = docNumber;

                    // Detectar tipo de RUC por sus primeros 2 dígitos
                    if (docType === 'RUC') {
                        const prefix = docNumber.substring(0, 2);
                        if (prefix === '20') {
                            setRucType('20');
                        } else if (prefix === '10' || prefix === '15') {
                            setRucType('10');
                        } else {
                            setRucType(null);
                        }
                    } else {
                        setRucType(null);
                    }

                    showToast(`${docType} encontrado`, 'success');
                } else {
                    // RUC/DNI no encontrado — marcar número para evitar bucles, sin bloquear campos
                    lastConsultedRef.current = docNumber;
                    setRucType(null);
                    const rawData = res.data as unknown;
                    const message = typeof rawData === 'string' ? (rawData as string).trim() : `No se encontraron datos para este ${docType}`;
                    showToast(message, 'error');
                }
            } catch (error) {
                logger.error(`Error en lookup ${docType}:`, error);
                lastConsultedRef.current = docNumber;
            } finally {
                setIsLoading(false);
                isConsultingRef.current = false;
            }
        }
    }, [enabled]);

    useEffect(() => {
        if (!enabled || !number || (number.length !== 8 && number.length !== 11)) {
            return;
        }

        const timeoutId = setTimeout(() => {
            performLookup(type, number);
        }, 600); // 600ms debounce

        return () => clearTimeout(timeoutId);
    }, [number, type, enabled, performLookup]);

    return {
        isLoading,
        isConsulted,
        /** '10' = persona natural (RUC 10/15) → bloquea nombre, dirección editable
         *  '20' = empresa → bloquea nombre/razón social Y dirección
         *  null = DNI u otro, o aún no consultado */
        rucType,
        resetConsulted: () => {
            setIsConsulted(false);
            setRucType(null);
            lastConsultedRef.current = '';
        }
    };
};
