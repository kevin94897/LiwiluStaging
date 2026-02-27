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

                if (res.success && res.data) {
                    onSuccessRef.current(res.data);
                    setIsConsulted(true);
                    lastConsultedRef.current = docNumber;
                    showToast(`${docType} encontrado`, 'success');
                } else {
                    // Solo marcar como fallido para este número para evitar bucles
                    lastConsultedRef.current = docNumber;
                    showToast(`No se encontraron datos para este ${docType}`, 'error');
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
        resetConsulted: () => {
            setIsConsulted(false);
            lastConsultedRef.current = '';
        }
    };
};
