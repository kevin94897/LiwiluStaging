import { PolicyPage, POLICY_ACF_GROUPS, CTAButton } from '@/data/policies';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function fetchAcfGroup(groupKey: string): Promise<Record<string, any> | null> {
  try {
    const res = await fetch(`${API_URL}/acf/values?group=${groupKey}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.success && json.data ? json.data : null;
  } catch {
    return null;
  }
}

function resolveLink(val: any): { url: string; text?: string } | null {
  if (!val) return null;
  if (typeof val === 'string' && val) return { url: val };
  if (typeof val === 'object' && val.url) return { url: val.url, text: val.text };
  return null;
}

function mapCtaMasInfo(cta: any): PolicyPage['cta'] | undefined {
  if (!cta) return undefined;
  const btn = resolveLink(cta.cta_mas_info_btn);
  return {
    title: cta.cta_mas_info_titulo || undefined,
    description: cta.cta_mas_info_descrip || undefined,
    buttons: btn
      ? [{ text: btn.text || 'Contáctanos', href: btn.url, variant: 'secondary' as const }]
      : undefined,
  };
}

/**
 * Mapper genérico para políticas con estructura estándar:
 *   {prefix}_titulo, {descrKey}, {prefix}_lista[]{prefix}_lista_titulo, {listDescrKey}
 *   cta_mas_info group
 */
function mapStandardPolicy(
  slug: string,
  data: Record<string, any>,
  opts: {
    titleKey: string;
    descrKey: string;
    listaKey: string;
    listaTituloKey: string;
    listaDescrKey: string;
    ctaKey?: string;
  }
): PolicyPage {
  const lista: any[] = Array.isArray(data[opts.listaKey]) ? data[opts.listaKey] : [];

  return {
    slug,
    title: data[opts.titleKey] || undefined,
    introduction: data[opts.descrKey] ? [data[opts.descrKey]] : undefined,
    sections: lista.length > 0
      ? lista.map((item, i) => ({
          id: String(i + 1),
          title: item[opts.listaTituloKey] || undefined,
          content: item[opts.listaDescrKey] ? [item[opts.listaDescrKey]] : undefined,
        }))
      : undefined,
    cta: mapCtaMasInfo(data[opts.ctaKey ?? 'cta_mas_info']),
  };
}

// --- Mappers específicos ---

function mapCookiesPolicy(data: Record<string, any>): PolicyPage {
  return mapStandardPolicy('politica-de-cookies', data, {
    titleKey:      'cookies_titulo',
    descrKey:      'cookies_descrip',
    listaKey:      'cookies_lista',
    listaTituloKey:'cookies_lista_titulo',
    listaDescrKey: 'cookies_lista_descrip',
  });
}

function mapPrivacidadPolicy(data: Record<string, any>): PolicyPage {
  return mapStandardPolicy('politica-de-privacidad', data, {
    titleKey:      'privacidad_titulo',
    descrKey:      'privacidad_descrip',
    listaKey:      'privacidad_lista',
    listaTituloKey:'privacidad_lista_titulo',
    listaDescrKey: 'privacidad_lista_descripcion',
  });
}

function mapPublicidadPolicy(data: Record<string, any>): PolicyPage {
  return mapStandardPolicy('politica-de-publicidad', data, {
    titleKey:      'publicidad_titulo',
    descrKey:      'publicidad_descripcion',
    listaKey:      'publicidad_lista',
    listaTituloKey:'publicidad_lista_titulo',
    listaDescrKey: 'publicidad_lista_descripcion',
  });
}

function mapDevolucionesPolicy(data: Record<string, any>): PolicyPage {
  return mapStandardPolicy('politica-de-devoluciones', data, {
    titleKey:      'devoluciones_titulo',
    descrKey:      'devoluciones_descripcion',
    listaKey:      'devoluciones_lista',
    listaTituloKey:'devoluciones_lista_titulo',
    listaDescrKey: 'devoluciones_lista_descripcion',
  });
}

function mapEnviosPolicy(data: Record<string, any>): PolicyPage {
  return mapStandardPolicy('politica-de-envio-y-recojo-pedidos', data, {
    titleKey:      'envios_titulo',
    descrKey:      'envios_descripcion',
    listaKey:      'envios_lista',
    listaTituloKey:'envios_lista_titulo',
    listaDescrKey: 'envios_lista_descripcion',
  });
}

function mapTerminosPolicy(data: Record<string, any>): PolicyPage {
  const lista: any[] = Array.isArray(data.tyc_lista) ? data.tyc_lista : [];
  const cta = data.cta_dudas;

  const buttons: CTAButton[] = [];
  const btn1 = resolveLink(cta?.cta_dudas_btn_01);
  const btn2 = resolveLink(cta?.cta_dudas_btn_02);
  if (btn1) buttons.push({ text: btn1.text || 'Contáctanos', href: btn1.url, variant: 'secondary' });
  if (btn2) buttons.push({ text: btn2.text || 'Ver más', href: btn2.url, variant: 'outline_white' });

  return {
    slug: 'terminos-y-condiciones',
    title: data.tyc_titulo || undefined,
    heroImage: data.tyc_banner || undefined,
    introduction: data.tyc_descrip ? [data.tyc_descrip] : undefined,
    sections: lista.length > 0
      ? lista.map((item, i) => ({
          id: String(i + 1),
          title: item.tyc_lista_titulo || undefined,
          content: item.tyc_lista_descripcion ? [item.tyc_lista_descripcion] : undefined,
        }))
      : undefined,
    cta: cta
      ? {
          title: cta.cta_dudas_titulo || undefined,
          description: cta.cta_dudas_descrip || undefined,
          buttons: buttons.length > 0 ? buttons : undefined,
        }
      : undefined,
  };
}

// --- Registro de mappers ---

const MAPPERS: Record<string, (data: Record<string, any>) => PolicyPage> = {
  'politica-de-cookies':                mapCookiesPolicy,
  'politica-de-privacidad':             mapPrivacidadPolicy,
  'politica-de-publicidad':             mapPublicidadPolicy,
  'politica-de-devoluciones':           mapDevolucionesPolicy,
  'politica-de-envio-y-recojo-pedidos': mapEnviosPolicy,
  'terminos-y-condiciones':             mapTerminosPolicy,
};

export async function fetchPolicyFromAcf(slug: string): Promise<PolicyPage> {
  const groupKey = POLICY_ACF_GROUPS[slug];
  if (!groupKey) return { slug };

  const data = await fetchAcfGroup(groupKey);
  if (!data) return { slug };

  const mapper = MAPPERS[slug];
  if (!mapper) return { slug };

  return mapper(data);
}
