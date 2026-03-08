// lib/general.ts
import { apiGet } from './auth/apiClient';
import logger from './logger';

export interface RucConsultationData {
    ruc: string;
    nombre_o_razon_social: string;
    direccion: string;
    direccion_completa: string;
    estado: string;
    condicion: string;
    departamento: string;
    provincia: string;
    distrito: string;
    ubigeo_sunat: string;
    ubigeo: string[];
    es_agente_de_retencion: string;
    es_agente_de_percepcion: string;
    es_agente_de_percepcion_combustible: string;
    es_buen_contribuyente: string;
}

export interface RucConsultationResponse {
    success: boolean;
    data: RucConsultationData;
    message?: string;
}

/**
 * Consults information for a given RUC.
 * @param ruc 11-digit RUC number
 */
export async function consultaRUC(ruc: string): Promise<RucConsultationResponse> {
    try {
        const response = await apiGet(`/general/consulta-ruc/${ruc}`, {
            skipAuth: true
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error consultando RUC: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        logger.error('Error in consultaRUC:', error);
        throw error;
    }
}

export interface DniConsultationData {
    numero: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    nombre_completo: string;
    codigo_verificacion: number;
}

export interface DniConsultationResponse {
    success: boolean;
    data: DniConsultationData;
    message?: string;
}

/**
 * Consults information for a given DNI.
 * @param dni 8-digit DNI number
 */
export async function consultaDNI(dni: string): Promise<DniConsultationResponse> {
    try {
        const response = await apiGet(`/general/consulta-dni/${dni}`, {
            skipAuth: true
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error consultando DNI: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        logger.error('Error in consultaDNI:', error);
        throw error;
    }
}
