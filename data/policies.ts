// data/policies.ts — solo slugs válidos y sus ACF group keys. Sin contenido.

export interface PolicySection {
  id: string;
  title?: string;
  content?: string | string[];
}

export interface CTAButton {
  text: string;
  href: string;
  variant: 'primary' | 'secondary' | 'outline_white';
}

export interface PolicyPage {
  slug: string;
  title?: string;
  description?: string;
  heroImage?: string;
  heroAlt?: string;
  introduction?: string[];
  sections?: PolicySection[];
  cta?: {
    title?: string;
    description?: string;
    buttons?: CTAButton[];
  };
}

export const POLICY_ACF_GROUPS: Record<string, string> = {
  'politica-de-cookies':                'pol_tica_de_cookies',
  'politica-de-privacidad':             'pol_tica_de_privacidad',
  'politica-de-publicidad':             'politica_publicidad',
  'politica-de-devoluciones':           'politica_devoluciones',
  'politica-de-envio-y-recojo-pedidos': 'pol_tica_de_env_o_y_recogida_de_pedidos',
  'terminos-y-condiciones':             'terminos_condiciones',
  'cupones-de-descuento':               'cupones_descuento',
};

export function getAllPolicySlugs(): string[] {
  return Object.keys(POLICY_ACF_GROUPS);
}
