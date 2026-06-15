const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface AcfLink { url: string; text?: string }

export interface HomeBanner {
  desktop?: string;
  tablet?: string;
  mobile?: string;
  alt?: string;
  url?: string;
}

export interface HomeBeneficio {
  imagen?: string;
  texto?: string;
}

export interface HomeComoComprarItem {
  video?: string;
  titulo?: string;
  descripcion?: string;
}

export interface HomeTrayectoriaItem {
  imagen?: string;
  descrip?: string;
}

export interface HomeAcfData {
  banners?: HomeBanner[];
  productosDestacados?: { mostrar?: boolean; titulo?: string };
  beneficios?: HomeBeneficio[];
  bannerMayor?: { imagen?: string; logo?: string; texto?: string; titulo?: string };
  comoComprar?: HomeComoComprarItem[];
  nuestrosProductos?: { mostrar?: boolean; titulo?: string };
  trayectoria?: { titulo?: string; lista?: HomeTrayectoriaItem[] };
}

export interface TrabajaAcfData {
  titulo?: string;
  redesEnlaces?: Array<{ imagen?: string; url?: string }>;
}

export interface HeaderAcfData {
  topHeader?: {
    enlace?: AcfLink;
    tiendas?: boolean;
    boton1?: boolean;
    boton2?: boolean;
    enlace3?: AcfLink;
    texto?: string;
  };
  main?: {
    logo?: string;
    mayorista?: boolean;
    mayoristaTitulo?: string;
    mayoristaMarquesina?: string;
    enlace?: AcfLink;
  };
}

export interface FooterAcfData {
  columna1?: {
    logo?: string;
    info?: string;
    enlaces?: AcfLink[];
  };
  columna2?: {
    modalTiendas?: boolean;
    enlaces?: AcfLink[];
  };
  columna3?: {
    libroUrl?: string;
    newsletter?: boolean;
    redes?: string[];
  };
}

async function fetchGroup(groupKey: string): Promise<Record<string, any> | null> {
  try {
    const res = await fetch(`${API_URL}/acf/values?group=${groupKey}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.success && json.data ? json.data : null;
  } catch {
    return null;
  }
}

function str(val: any): string | undefined {
  return val && typeof val === 'string' ? val : undefined;
}

function bool(val: any): boolean | undefined {
  if (val === true || val === 'true' || val === 1) return true;
  if (val === false || val === 'false' || val === 0) return false;
  return undefined;
}

function resolveLink(val: any): AcfLink | undefined {
  if (!val) return undefined;
  if (typeof val === 'string' && val) return { url: val };
  if (typeof val === 'object' && val.url) return { url: val.url, text: val.text || undefined };
  return undefined;
}

function mapLinks(repeater: any[], key: string): AcfLink[] {
  if (!Array.isArray(repeater)) return [];
  return repeater
    .map((item) => resolveLink(item[key]))
    .filter(Boolean) as AcfLink[];
}

export async function fetchHomeAcf(): Promise<HomeAcfData> {
  const data = await fetchGroup('home');
  if (!data) return {};

  const banners: HomeBanner[] = Array.isArray(data.home_banners)
    ? data.home_banners
        .map((b: any) => ({
          desktop: str(b.home_banners_imagen_desktop),
          tablet: str(b.home_banners_imagen_tablet),
          mobile: str(b.home_banners_imagen_mobile),
          alt: str(b.home_banners_alt),
          url: str(b.home_banners_url),
        }))
        .filter((b: HomeBanner) => b.desktop || b.mobile)
    : [];

  const beneficios: HomeBeneficio[] = Array.isArray(data.home_beneficios)
    ? data.home_beneficios
        .map((b: any) => ({ imagen: str(b.home_beneficios_imagen), texto: str(b.home_beneficios_texto) }))
        .filter((b: HomeBeneficio) => b.imagen || b.texto)
    : [];

  const comoComprar: HomeComoComprarItem[] = Array.isArray(data.home_como_comprar)
    ? data.home_como_comprar
        .map((c: any) => ({
          video: str(c.home_como_comprar_video),
          titulo: str(c.home_como_comprar_titulo),
          descripcion: str(c.home_como_comprar_descripcion),
        }))
        .filter((c: HomeComoComprarItem) => c.video || c.titulo)
    : [];

  const pd = data.home_productos_destacados;
  const np = data.home_nuestros_productos;
  const bm = data.home_banner_mayor;
  const tr = data.home_trayectoria;

  const trayectoriaLista: HomeTrayectoriaItem[] = Array.isArray(tr?.home_trayectoria_lista)
    ? tr.home_trayectoria_lista
        .map((t: any) => ({ imagen: str(t.home_trayectoria_lista_imagen), descrip: str(t.home_trayectoria_lista_descrip) }))
        .filter((t: HomeTrayectoriaItem) => t.imagen || t.descrip)
    : [];

  return {
    banners: banners.length > 0 ? banners : undefined,
    productosDestacados: pd ? { mostrar: bool(pd.home_productos_destacados_mostrar), titulo: str(pd.home_productos_destacados_titulo) } : undefined,
    beneficios: beneficios.length > 0 ? beneficios : undefined,
    bannerMayor: bm ? { imagen: str(bm.home_banner_mayor_imagen), logo: str(bm.home_banner_mayor_logo), texto: str(bm.home_banner_mayor_texto), titulo: str(bm.home_banner_mayor_titulo) } : undefined,
    comoComprar: comoComprar.length > 0 ? comoComprar : undefined,
    nuestrosProductos: np ? { mostrar: bool(np.home_nuestros_productos_mostrar), titulo: str(np.home_nuestros_productos_titulo) } : undefined,
    trayectoria: (tr?.home_trayectoria_titulo || trayectoriaLista.length > 0)
      ? { titulo: str(tr?.home_trayectoria_titulo), lista: trayectoriaLista.length > 0 ? trayectoriaLista : undefined }
      : undefined,
  };
}

export async function fetchTrabajaAcf(): Promise<TrabajaAcfData> {
  const data = await fetchGroup('trabaja_con_nosotros');
  if (!data) return {};

  const redes: Array<{ imagen?: string; url?: string }> = Array.isArray(data.enlaces_redes)
    ? data.enlaces_redes
        .map((r: any) => ({ imagen: str(r.enlaces_redes_imagen), url: str(r.enlaces_redes_url) }))
        .filter((r: any) => r.imagen || r.url)
    : [];

  return {
    titulo: str(data.trabaja_nosotros_titutlo),
    redesEnlaces: redes.length > 0 ? redes : undefined,
  };
}

export interface TiendaBannerSlide {
  desktop?: string;
  tablet?: string;
  mobile?: string;
  alt?: string;
  url?: string;
}

export interface TiendaAcfData {
  bannerSliders?: TiendaBannerSlide[];
  bannerProductosImagen?: string;
}

export async function fetchTiendaAcf(): Promise<TiendaAcfData> {
  const data = await fetchGroup('tienda');
  if (!data) return {};

  const banner = data.tienda_banner;
  const sliders: TiendaBannerSlide[] = Array.isArray(banner?.tienda_banner_sliders)
    ? banner.tienda_banner_sliders
        .map((s: any) => ({
          desktop: str(s.tienda_banner_slider_desktop),
          tablet: str(s.tienda_banner_slider_tablet),
          mobile: str(s.tienda_banner_slider_mobile),
          alt: str(s.tienda_banner_texto_alt),
          url: str(s.tienda_banner_slider_url),
        }))
        .filter((s: TiendaBannerSlide) => s.desktop || s.mobile)
    : [];

  const bannerProductos = data.tienda_banner_productos;

  return {
    bannerSliders: sliders.length > 0 ? sliders : undefined,
    bannerProductosImagen: str(bannerProductos?.tienda_banner_productos_imagen),
  };
}

export async function fetchHeaderAcf(): Promise<HeaderAcfData> {
  const data = await fetchGroup('header');
  if (!data) return {};

  const top = data.top_header;
  const main = data.header_main;

  return {
    topHeader: top ? {
      enlace: resolveLink(top.top_header_enlace),
      tiendas: bool(top.top_header_tiendas),
      boton1: bool(top.top_header_boton_1),
      boton2: bool(top.top_header_boton_2),
      enlace3: resolveLink(top.top_header_enlace_3),
      texto: str(top.top_header_texto),
    } : undefined,
    main: main ? {
      logo: str(main.header_main_logo),
      mayorista: bool(main.header_main_mayorista),
      mayoristaTitulo: str(main.header_main_mayorista_titulo),
      mayoristaMarquesina: str(main.header_main_mayorista_marquesina),
      enlace: resolveLink(main.header_main_enlace),
    } : undefined,
  };
}

export interface ConfiguracionProductosAcfData {
  opcionesMayorista?: {
    tienda?: string;
    botonInactivo?: string;
    botonActivo?: string;
  };
}

export async function fetchConfiguracionProductosAcf(): Promise<ConfiguracionProductosAcfData> {
  const data = await fetchGroup('configuracion_productos');
  if (!data) return {};
  const om = data.opciones_mayorista;
  return {
    opcionesMayorista: om ? {
      tienda: str(om.opciones_mayorista_tienda),
      botonInactivo: str(om.opciones_mayorista_boton_inactivo),
      botonActivo: str(om.opciones_mayorista_boton_activo),
    } : undefined,
  };
}

export async function fetchFooterAcf(): Promise<FooterAcfData> {
  const data = await fetchGroup('footer');
  if (!data) return {};

  const col1 = data.footer_columna_1;
  const col2 = data.footer_columna_2;
  const col3 = data.footer_columna_3;

  const redes: string[] = Array.isArray(col3?.footer_columna_3_redes)
    ? col3.footer_columna_3_redes
        .map((r: any) => str(r.footer_columna_3_red))
        .filter(Boolean) as string[]
    : [];

  return {
    columna1: col1 ? {
      logo: str(col1.footer_columna_1_logo),
      info: str(col1.footer_columna_1_info),
      enlaces: mapLinks(col1.footer_columna_1_enlaces ?? [], 'footer_columna_1_enlace'),
    } : undefined,
    columna2: col2 ? {
      modalTiendas: bool(col2.footer_columna_2_modal),
      enlaces: mapLinks(col2.footer_columna_2_enlaces ?? [], 'footer_columna_2_enlace'),
    } : undefined,
    columna3: col3 ? {
      libroUrl: str(col3.footer_columna_3_url),
      newsletter: bool(col3.footer_columna_3_newsletter),
      redes: redes.length > 0 ? redes : undefined,
    } : undefined,
  };
}
