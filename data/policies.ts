// data/policies.ts
export interface PolicySection {
    id: string;
    title: string;
    content: string | string[];
}

export interface InfoCard {
    icon: 'clock' | 'location' | 'shield' | 'tag' | 'alert';
    title: string;
    description: string;
}

export interface CTAButton {
    text: string;
    href: string;
    variant: 'primary' | 'secondary' | 'outline_white';
}

export interface PolicyPage {
    slug: string;
    title: string;
    description: string;
    heroImage: string;
    heroAlt: string;
    introduction: string[];
    sections: PolicySection[];
    additionalInfo?: {
        title: string;
        items: InfoCard[];
    };
    cta?: {
        title: string;
        description: string;
        buttons: CTAButton[];
    };
}

export const policies: Record<string, PolicyPage> = {
    'cupones-de-descuento': {
        slug: 'cupones-de-descuento',
        title: 'Política de Cupones de Descuento',
        description: 'Condiciones y reglas para el uso de cupones de descuento en LIWILU',
        heroImage: '/images/liwilu-politicas-banner.png',
        heroAlt: 'Política de Cupones de Descuento',
        introduction: [
            'Los cupones de descuento son códigos promocionales que permiten acceder a beneficios especiales en nuestra tienda virtual www.liwilu.com.pe.',
            'El uso de estos cupones implica la aceptación de las condiciones descritas en la presente política.',
        ],
        sections: [
            {
                id: '1',
                title: 'Definición y Aplicación',
                content: [
                    '<ul>' +
                    '<li>Los cupones de descuento, en adelante los cupones, son códigos virtuales alfanuméricos que permiten obtener beneficios especiales (como monto fijo o porcentaje de descuento), válidos y aplicables únicamente en nuestra tienda virtual ubicada en <strong>www.liwilu.com.pe</strong>.</li>' +
                    '<li>Los cupones serán válidos solo durante el plazo señalado en el mismo beneficio o hasta agotar stock.</li>' +
                    '<li>Los cupones serán enviados por <strong>Liwilu S.A.C.</strong>, en adelante “<strong>Liwilu</strong>”, a través de correo electrónico, mensajes promocionales o medios oficiales al cliente.</li>' +
                    '<li>Solo son válidos dentro del periodo de vigencia, no acumulables salvo que se indique lo contrario, y se aplican exclusivamente en compras en nuestro sitio web <strong>www.liwilu.com.pe</strong>.</li>' +
                    '</ul>'
                ]
            },
            {
                id: '2',
                title: 'Reglas Generales de Uso',
                content: [
                    '<ul>' +
                    '<li>El descuento se aplicará sobre el precio de lista vigente del carrito de compras.</li>' +
                    '<li>Cada cupón solo puede utilizarse una vez por cliente, salvo que la promoción indique lo contrario.</li>' +
                    '<li>El descuento no es acumulable con otras promociones o códigos, excepto si está explícitamente indicado.</li>' +
                    '<li>No aplicable a ventas corporativas o tarjetas de regalo, salvo excepción debidamente indicada.</li>' +
                    '</ul>'
                ]
            },
            {
                id: '3',
                title: 'Condiciones y Restricciones Específicas',
                content: [
                    'Cada cupón podrá incluir, según su campaña, condiciones adicionales como:',
                    '<ul>' +
                    '<li>Monto mínimo de compra o productos específicos requeridos para su activación.</li>' +
                    '<li>Medios de pago específicos válidos para su uso (como tarjetas o transferencias).</li>' +
                    '<li>Límite de unidades o stock disponible que pueden ser adquiridas con el descuento.</li>' +
                    '<li>Montos máximos o topes de transacción sobre los que aplica el descuento.</li>' +
                    '</ul>'
                ]
            },
            {
                id: '4',
                title: 'Exclusividad y Validez en Canal Digital',
                content: [
                    '<ul>' +
                    '<li>Los cupones son válidos únicamente en nuestra tienda online ubicada en <strong>www.liwilu.com.pe</strong>, no en tiendas físicas u otros canales de venta.</li>' +
                    '</ul>'
                ]
            },
            {
                id: '5',
                title: 'Condiciones en Cambios y Devoluciones',
                content: [
                    '<ul>' +
                    '<li>En caso de cambios o devoluciones, el cupón utilizado no será reactivado ni reembolsado.</li>' +
                    '<li>Si se devuelve el producto y la compra queda anulada, el cupón queda como usado y no puede volver a utilizarse a menos que se indique expresamente.</li>' +
                    '</ul>'
                ]
            },
            {
                id: '6',
                title: 'Fraude, Errores y Cancelaciones',
                content: [
                    '<ul>' +
                    '<li>Nos reservamos el derecho de anular o rechazar cupones y, en consecuencia, el monto del descuento, en caso de detectar errores sistémicos, incumplimiento de términos, duplicación, uso indebido o fraude.</li>' +
                    '<li>Si ocurre alguna falla técnica que impida aplicar un cupón, se informará al cliente para permitir el uso adecuado del mismo antes de concluir la compra.</li>' +
                    '</ul>'
                ]
            },
            {
                id: '7',
                title: 'Conformidad del Cliente',
                content: [
                    '<ul>' +
                    '<li>Al usar un cupón, el cliente declara que ha leído y acepta tanto los Términos y Condiciones Generales del presente documento como las condiciones particulares establecidas en la promoción vigente y/o cupón.</li>' +
                    '</ul>'
                ]
            }

        ],
        cta: {
            title: '¿Tienes dudas sobre promociones?',
            description:
                'Nuestro equipo puede ayudarte con cualquier consulta sobre cupones y descuentos.',
            buttons: [
                {
                    text: 'Contáctanos',
                    href: '/contacto',
                    variant: 'secondary',
                },
            ],
        },
    },
    'politica-de-cookies': {
        slug: 'politica-de-cookies',
        title: 'Política de Cookies',
        description: 'Política de Cookies de LIWILU S.A.C.',
        heroImage: '/images/liwilu-politicas-banner.png',
        heroAlt: 'Política de Cookies',
        introduction: [
            'La presente Política de Cookies describe el uso de cookies en el sitio web de LIWILU S.A.C., así como las opciones que tiene el usuario para gestionarlas.',
            'Al acceder y navegar por nuestro sitio web, usted acepta el uso de cookies conforme a lo establecido en esta política.'
        ],
        sections: [
            {
                id: '1',
                title: 'Protección de Datos Personales',
                content: [
                    'La información que usted envíe a <strong>LIWILU S.A.C.</strong> (en adelante <strong>Liwilu</strong>), identificada con <strong>RUC N°20544481470</strong> y con domicilio en <strong>Calle Santa Lucía N° 359, Urb. Industrial La Aurora, distrito de Ate, provincia y departamento de Lima, Perú</strong>, a través de todos los formularios publicados en este Sitio Web, se regirá de conformidad con este documento.',

                    'Como usuario de este Sitio Web (en adelante el usuario), le informamos en esta Política el uso que le daremos a los datos personales y sensibles (en adelante, los datos personales) que registre en el mismo, a fin de que pueda decidir si quiere ingresarlos o no.',

                    'Los datos personales recogidos a través de este Sitio Web serán objeto de tratamiento automatizado por parte de <strong>Liwilu</strong> y en caso corresponda, por los terceros autorizados para ello.',

                    'Dichos datos serán incorporados en los correspondientes Bancos de Datos Personales de los que <strong>Liwilu</strong> es titular y responsable y que han sido registrados ante la <strong>Autoridad Nacional de Protección de Datos Personales</strong>.',

                    'Los datos personales brindados en este Sitio Web, siempre y cuando haya previamente autorizado el tratamiento de los mismos, serán conservados por <strong>Liwilu</strong> por el tiempo que dure la relación con el usuario más el plazo de 10 años. Podrá ejercer en cualquier momento sus derechos de información, acceso, rectificación, cancelación y oposición de sus datos personales de acuerdo con lo dispuesto por la Ley de Protección de Datos Personales y su reglamento, presentando una solicitud de derechos ARCO en las oficinas de <strong>Liwilu</strong> ubicadas en <strong>Calle Santa Lucía N° 359, Urb. Industrial La Aurora, distrito de Ate, provincia y departamento de Lima, Perú</strong> o remitirla vía correo electrónico a la dirección <a href="mailto:protecciondedatos@liwilu.com.pe" class="text-primary underline"><strong>protecciondedatos@liwilu.com.pe</strong></a>, adjuntando cuando corresponda, los documentos sustentatorios de su solicitud. La revocatoria no afectará el uso de los datos personales para ser tratados con el objeto de dar cumplimiento a la relación con <strong>Liwilu</strong>.',

                    'De considerar el usuario que no ha sido atendido en el ejercicio de sus derechos puede presentar una reclamación ante la <strong>Autoridad Nacional de Protección de Datos Personales</strong>, dirigiéndose a la Mesa de Partes del <strong>Ministerio de Justicia y Derechos Humanos</strong>: <strong>Calle Scipion Llona N°350, Miraflores, Lima, Perú</strong>.',

                    '<strong>Liwilu</strong> se compromete a no divulgar los datos del usuario a personas extrañas o ajenas, como tampoco a usarlos o aplicarlos a una finalidad distinta a la que fueron autorizados, entregados o aquella que motivó su recopilación. Por ello, es obligación de <strong>Liwilu</strong> mantener una absoluta y total reserva y confidencialidad de los datos personales a los que tenga acceso. <strong>Liwilu</strong> como titular y responsable de los Bancos de Datos Personales, ha adoptado los niveles de seguridad apropiados para el resguardo de la información registrada, de acuerdo a Ley; y respeta los principios establecidos en la Ley de Protección de Datos Personales, su Reglamento, la Directiva de la Seguridad de la Información y demás normas modificatorias, complementarias y conexas.'
                ]
            },
            {
                id: '2',
                title: '¿Qué son las cookies?',
                content: [
                    'Las <strong>cookies</strong> son pequeños archivos de texto que se almacenan en el navegador del usuario cuando visita un sitio web. Sirven para reconocer al usuario en sus próximas visitas, mejorar su experiencia de navegación y recopilar información estadística sobre el uso del sitio.',

                    'Estas cookies muy bien pueden indicarnos si el usuario ha visitado nuestro <strong>Sitio Web</strong> antes o si es un visitante nuevo y qué material de nuestro <strong>Sitio Web</strong> ha visto. Las cookies que utilizamos no recolectan información alguna sobre la identidad del usuario ni nos proporcionan forma alguna de contactarlo y las cookies no extraen información alguna de los equipos electrónicos desde los cuales accede a nuestro <strong>Sitio Web</strong>. También debe saber que reunimos cierta información sobre el uso de este <strong>Sitio Web</strong>, tal como el número y frecuencia de visitantes a ciertas secciones de dicho Sitio. Estos datos solo son utilizados en conjunto y no incluyen información alguna sobre la identidad personal.'
                ]
            },
            {
                id: '3',
                title: 'Finalidad del uso de cookies',
                content: [
                    '<strong>Liwilu</strong> utiliza cookies propias y de terceros con los siguientes fines:',
                    '<ul class="list-disc list-inside">' +
                    '<li>Cookies estrictamente necesarias: permiten la navegación y el uso de funcionalidades esenciales del <strong>Sitio Web</strong>.</li>' +
                    '<li>Cookies de rendimiento: recogen información sobre cómo los usuarios utilizan el <strong>Sitio Web</strong>, con el objetivo de mejorar la calidad y el funcionamiento del sitio.</li>' +
                    '<li>Cookies de personalización: recuerdan las preferencias del usuario (idioma, región, configuraciones de visualización).</li>' +
                    '<li>Cookies publicitarias: permiten mostrar anuncios relevantes en función de los intereses del usuario.</li>' +
                    '</ul>'
                ]
            },
            {
                id: '4',
                title: 'Tipos de cookies utilizadas',
                content: [
                    '<ul>' +
                    '<li>Cookies temporales (de sesión): se eliminan automáticamente al cerrar el navegador.</li>' +
                    '<li>Cookies permanentes: permanecen en el dispositivo hasta que el usuario las elimine manualmente o caduquen.</li>' +
                    '<li>Cookies de terceros: implementadas por servicios externos como <strong>Google Analytics</strong>, <strong>Facebook Pixel</strong> u otros proveedores, para análisis de tráfico, estadísticas o campañas publicitarias.</li>' +
                    '</ul>'
                ]
            },
            {
                id: '5',
                title: 'Consentimiento del usuario',
                content: [
                    'Al acceder al sitio web de <strong>Liwilu</strong>, el usuario acepta el uso de cookies de acuerdo con esta política. El aviso de cookies será mostrado en la primera visita y se entenderá que el usuario consiente su uso al continuar navegando o interactuar con la página.'
                ]
            },
            {
                id: '6',
                title: 'Actualizaciones de la Política de Cookies',
                content: [
                    '<strong>Liwilu</strong> se reserva el derecho de modificar, actualizar o complementar esta Política de Cookies en cualquier momento. Los cambios serán efectivos desde su publicación en la página web, en cumplimiento de la normativa de la materia.'
                ]
            }
        ],
        cta: {
            title: '¿Deseas más información?',
            description:
                'Si tienes dudas sobre el uso de cookies o el tratamiento de tus datos, puedes contactarnos para brindarte mayor información.',
            buttons: [
                {
                    text: 'Contáctanos',
                    href: '/contacto',
                    variant: 'secondary'
                }
            ]
        }
    },
    'politica-de-privacidad': {
        slug: 'politica-de-privacidad',
        title: 'Política de Privacidad',
        description: 'Política de Privacidad de LIWILU S.A.C.',
        heroImage: '/images/liwilu-politicas-banner.png',
        heroAlt: 'Política de Privacidad',
        introduction: [
            'En <strong>Liwilu S.A.C.</strong> respetamos y valoramos la privacidad de nuestros clientes y visitantes. Por ello, la información que usted envíe a <strong>Liwilu S.A.C.</strong>, identificada con <strong>RUC N°20544481470</strong> y domicilio en <strong>Calle Santa Lucía N° 359, Urb. Industrial La Aurora, distrito de Ate, provincia y departamento de Lima, Perú</strong> (en adelante <strong>Liwilu</strong>), a través de todos los formularios publicados en este <strong>Sitio Web</strong> y demás canales de contacto oficiales, se regirá de conformidad con este documento, salvo que exista otro documento específico que se ponga a disposición de usted antes del envío de sus datos personales, en cuyo caso se regirá de conformidad con dicho documento, en lo que se oponga a este.',

            'Como usuario de este <strong>Sitio Web</strong> (en adelante el usuario), le informamos en esta Política el uso que le daremos a los datos que proporcione en el mismo, a fin de que pueda decidir si continúa navegando.'
        ],
        sections: [
            {
                id: '1',
                title: 'Protección de Datos Personales',
                content: [
                    'Nuestra política se encuentra alineada con lo dispuesto en la <strong>Ley N.° 29733 – Ley de Protección de Datos Personales</strong>, su Reglamento y demás normativas aplicables en el Perú.',
                    'Los datos recogidos a través de este Sitio Web serán objeto de tratamiento automatizado por parte de <strong>Liwilu</strong> con fines de brindarle información a través de este Sitio Web, salvo que se ponga a su disposición información sobre condiciones particulares del tratamiento de sus datos personales.',
                    'Los datos personales serán incorporados en los correspondientes Bancos de Datos Personales de los que <strong>Liwilu</strong> es titular y responsable y que han sido declarados ante la <strong>Autoridad Nacional de Protección de Datos Personales</strong>.',
                    'El usuario podrá revocar su consentimiento en cualquier momento, dirigiendo su comunicación por escrito a nuestro domicilio ubicado en <strong>Calle Santa Lucía N° 359, Urb. Industrial La Aurora, distrito de Ate, provincia y departamento de Lima, Perú</strong>, o al correo electrónico <a href="mailto:protecciondedatos@liwilu.com.pe" class="text-primary underline"><strong>protecciondedatos@liwilu.com.pe</strong></a>.',
                    'La revocatoria no afectará el uso de sus datos personales y/o sensibles para ser tratados con el objeto de dar cumplimiento a la relación con <strong>Liwilu</strong>.',
                    'También podrá ejercer en cualquier momento sus derechos de información, acceso, rectificación, cancelación y oposición de sus datos, de acuerdo con lo dispuesto por la Ley de Protección de Datos Personales y su Reglamento, presentando su solicitud de derechos ARCO en las oficinas de <strong>Liwilu</strong>, ubicadas en <strong>Calle Santa Lucía N° 359, Urb. Industrial La Aurora, distrito de Ate, provincia y departamento de Lima, Perú</strong>, o remitirla vía correo electrónico a la dirección <a href="mailto:protecciondedatos@liwilu.com.pe" class="text-primary underline"><strong>protecciondedatos@liwilu.com.pe</strong></a>, adjuntando, cuando corresponda, los documentos sustentatorios de su solicitud.',
                    'De considerar el usuario que no ha sido atendido en el ejercicio de sus derechos, puede presentar una reclamación ante la <strong>Autoridad Nacional de Protección de Datos Personales</strong>, dirigiéndose a la Mesa de Partes del <strong>Ministerio de Justicia y Derechos Humanos</strong>: <strong>Calle Scipión Llona N° 350, Miraflores, Lima, Perú</strong>.',
                    '<strong>Liwilu</strong> se compromete a no divulgar los datos del usuario a personas extrañas o ajenas, como tampoco a usarlos o aplicarlos con una finalidad distinta a aquella por la que fueron autorizados, entregados o que motivó su recopilación. Por ello, es obligación de <strong>Liwilu</strong> mantener una absoluta y total reserva y confidencialidad de los datos a los que tenga acceso. <strong>Liwilu</strong>, como titular y responsable de los Bancos de Datos Personales, ha adoptado los niveles de seguridad apropiados para el resguardo de la información registrada, de acuerdo con la ley, y respeta los principios de legalidad, consentimiento, finalidad, proporcionalidad, calidad, disposición de recurso y nivel de protección adecuado, conforme a las disposiciones de la Ley de Protección de Datos Personales, su Reglamento y demás normas modificatorias, complementarias y conexas.'
                ]
            },
            {
                id: '2',
                title: 'Finalidad del Tratamiento de Datos',
                content: [
                    '<ul>' +
                    '<li>Procesar, gestionar y entregar los pedidos realizados en nuestra tienda virtual.</li>' +
                    '<li>Emitir comprobantes de pago (boletas o facturas).</li>' +
                    '<li>Brindar soporte postventa, garantías, cambios y devoluciones.</li>' +
                    '<li>Atender consultas, reclamos o solicitudes de los clientes.</li>' +
                    '<li>Enviar información promocional, novedades y campañas comerciales (previo consentimiento del usuario).</li>' +
                    '<li>Mejorar la experiencia de navegación y el funcionamiento de nuestro sitio web.</li>' +
                    '</ul>'
                ]
            }
            ,
            {
                id: '3',
                title: 'Conservación de los Datos',
                content: [
                    '<ul>' +
                    '<li>Los datos personales serán almacenados en nuestros sistemas mientras dure la relación contractual y hasta por un plazo máximo de 10 años contados desde la última transacción, salvo que el usuario solicite su eliminación anticipada conforme a la ley.</li>' +
                    '<li>Transcurrido dicho plazo, los datos serán eliminados de manera segura y definitiva.</li>' +
                    '</ul>'
                ]
            }
            ,
            {
                id: '4',
                title: 'Confidencialidad y Seguridad',
                content: [
                    '<ul>' +
                    '<li>Los datos no serán compartidos con terceros, salvo con entidades financieras, pasarelas de pago y entidades estatales para procesar las transacciones.</li>' +
                    '<li>Empresas de courier para la entrega de los productos.</li>' +
                    '<li>Autoridades competentes cuando la ley así lo exija.</li>' +
                    '</ul>'
                ]
            }
            ,
            {
                id: '5',
                title: 'Uso de Cookies y Tecnologías Similares',
                content: [
                    'Al igual que muchas compañías, utilizamos la tecnología de cookies en nuestro Sitio Web. Estas cookies pueden indicarnos si el usuario ha visitado nuestro sitio antes o si es un visitante nuevo y qué material de nuestro sitio ha visto. Las cookies que utilizamos no recolectan información alguna sobre la identidad del usuario ni nos proporcionan forma alguna de contactarlo, y no extraen información alguna de su computadora o aparato electrónico. También reunimos cierta información sobre el uso de este Sitio Web, tal como el número y frecuencia de visitantes a ciertas secciones. Estos datos solo son utilizados de manera agregada y no incluyen información alguna sobre la identidad personal.',
                    '<ul>' +
                    '<li>Facilitar la navegación y recordar preferencias del usuario.</li>' +
                    '<li>Analizar el tráfico y mejorar la experiencia en la web.</li>' +
                    '<li>Personalizar contenidos y campañas publicitarias.</li>' +
                    '</ul>',
                    'El usuario puede configurar su navegador para rechazar el uso de cookies, aunque ello podría limitar algunas funciones de la página.'
                ]
            }
            ,
            {
                id: '6',
                title: 'Modificaciones a la Política',
                content: [
                    '<strong>Liwilu</strong> se reserva el derecho de actualizar o modificar esta política en cualquier momento. Las modificaciones se publicarán en nuestro sitio web y entrarán en vigencia desde su publicación.'
                ]
            },
            {
                id: '7',
                title: 'Contacto',
                content: [
                    '<ul>' +
                    '<li>Correo: <a href="mailto:protecciondedatos@liwilu.com.pe" class="text-primary underline"><strong>protecciondedatos@liwilu.com.pe</strong></a></li>' +
                    '<li>Teléfono: 01-7028086 (opción 1)</li>' +
                    '<li>Dirección: <strong>Calle Santa Lucía N° 359, Urb. Industrial La Aurora, distrito de Ate, provincia y departamento de Lima, Perú</strong></li>' +
                    '</ul>'
                ]
            }


        ],
        cta: {
            title: '¿Deseas más información?',
            description:
                'Si tienes dudas sobre el uso de cookies o el tratamiento de tus datos, puedes contactarnos para brindarte mayor información.',
            buttons: [
                {
                    text: 'Contáctanos',
                    href: '/contacto',
                    variant: 'secondary'
                }
            ]
        }
    },
    'politica-de-publicidad': {
        slug: 'politica-de-publicidad',
        title: 'Política de Publicidad',
        description: 'Política de Publicidad de LIWILU S.A.C.',
        heroImage: '/images/liwilu-politicas-banner.png',
        heroAlt: 'Política de Publicidad',
        introduction: [
            'En cumplimiento de lo dispuesto por la <strong>Ley N°29733, Ley de Protección de Datos Personales</strong> y su Reglamento, <strong>Liwilu S.A.C.</strong> (en adelante, <strong>Liwilu</strong>) pone en conocimiento del cliente, los siguientes aspectos relacionados con sus datos personales.',
            '<strong>Liwilu</strong>, identificada con <strong>RUC N°20100102413</strong> y con dirección en <strong>Calle Santa Lucía N° 359, Urb. Industrial La Aurora, distrito de Ate, provincia y departamento de Lima, Perú</strong>, es titular del banco de datos personales denominado <strong>“Banco de Clientes”</strong>, el que está inscrito en el <strong>Registro Nacional de Protección de Datos Personales</strong> con código de inscripción <strong>PJ-2025-2079</strong>. <strong>Liwilu</strong> informa al Cliente que cualquier tratamiento de datos personales se ajusta a lo establecido por la legislación vigente en Perú en la materia (<strong>Ley N°29733</strong> y su reglamento).',
            'En <strong>Liwilu</strong>, respetamos la privacidad y las decisiones de nuestros clientes. Por ello, hemos establecido las siguientes políticas para el envío de comunicaciones comerciales, publicitarias y promocionales relacionadas con nuestros productos y servicios.'
        ],
        sections: [
            {
                id: '1',
                title: 'Consentimiento Expreso e Informado',
                content: [
                    'El Cliente otorga su consentimiento a <strong>Liwilu</strong>, para que sus datos personales sean utilizados para las siguientes finalidades:',
                    '<ul>' +
                    '<li>Envío de publicidad, promociones, novedades u ofertas, información sobre productos ofrecidos por <strong>Liwilu</strong>, formas de pago, entre otras estrategias comerciales.</li>' +
                    '<li>Remitirles invitaciones a eventos, reuniones; contactarlos para realizar encuestas y estudios.</li>' +
                    '</ul>',
                    'El Cliente otorga su consentimiento a <strong>Liwilu</strong> para que sus datos personales sean utilizados para las finalidades antes descritas, por el plazo de <strong>10 años</strong> contados desde la suscripción.'
                ]
            },
            {
                id: '2',
                title: 'Finalidad Clara y Limitada',
                content: [
                    '<ul>' +
                    '<li>Los datos recopilados se usarán únicamente para los fines autorizados.</li>' +
                    '<li>Cualquier uso adicional requerirá una nueva autorización del usuario.</li>' +
                    '</ul>'
                ]
            },
            {
                id: '3',
                title: 'Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición) y Baja de Comunicaciones',
                content: [
                    'Como titular de sus datos personales, el Cliente tiene derecho de acceder a sus datos en posesión de <strong>Liwilu</strong>, conocer las características de su tratamiento, rectificarlos en caso de ser inexactos o incompletos; solicitar sean suprimidos o cancelados al considerarlos innecesarios para las finalidades previamente expuestas o bien oponerse a su tratamiento para fines específicos.',
                    'El Cliente podrá en cualquier momento revocar el consentimiento otorgado expresamente, tanto como limitar el uso o divulgación de sus datos personales.',
                    'El Cliente podrá dirigir su solicitud de ejercicio de los derechos a la siguiente dirección: <strong>Calle Santa Lucía N° 359, Urb. Industrial La Aurora, distrito de Ate, provincia y departamento de Lima, Perú</strong> o a la siguiente dirección de correo electrónico: <a href="mailto:protecciondedatos@liwilu.com.pe" class="text-primary underline"><strong>protecciondedatos@liwilu.com.pe</strong></a>.',
                    'A fin de ejercer los derechos antes mencionados, el Cliente deberá presentar en la dirección o correo electrónico antes indicados la solicitud respectiva en los términos y condiciones que establece el Reglamento de la <strong>Ley N°29733</strong>; y conforme a la Política de Privacidad y Datos Personales de <strong>Liwilu</strong> publicada en la sección <strong>“Protección de Datos Personales”</strong> de la página web <a href="https://www.liwilu.com.pe" target="_blank" rel="noopener noreferrer" class="text-primary underline"><strong>www.liwilu.com.pe</strong></a>.',
                    'De considerar el Cliente que no ha sido atendida en el ejercicio de sus derechos puede presentar una reclamación ante la <strong>Autoridad Nacional de Protección de Datos Personales</strong>, dirigiéndose a la Mesa de Partes del <strong>Ministerio de Justicia y Derechos Humanos</strong>: <strong>Calle Scipion Llona N°350, Miraflores, Lima, Perú</strong>.',
                    '<strong>Liwilu</strong> será responsable del <strong>“Banco de Datos Personales de Clientes”</strong>, así como de los datos contenidos en estos. Con el objeto de evitar la pérdida, mal uso, alteración, acceso no autorizado y robo de los datos personales o información confidencial facilitados por el Cliente, <strong>Liwilu</strong> ha adoptado los niveles de seguridad y de protección de datos personales legalmente requeridos y ha instalado todos los medios y medidas técnicas a su alcance.'
                ]
            },
            {
                id: '5',
                title: 'Medidas de Seguridad y Conservación de Datos',
                content: [
                    '<ul>' +
                    '<li>Se aplicarán medidas técnicas y organizativas (como cifrado, control de acceso, respaldo) para proteger los datos personales.</li>' +
                    '<li>Los datos se conservarán únicamente mientras sean necesarios para la finalidad autorizada y durante el plazo señalado en este documento. Luego, se eliminarán o anonimizarán.</li>' +
                    '</ul>'
                ]
            },
            {
                id: '6',
                title: 'Visibilidad y Actualización de la Política',
                content: [
                    '<ul>' +
                    '<li>Esta política estará fácilmente accesible desde el <strong>Sitio Web</strong> de <strong>Liwilu</strong>, durante el registro y el proceso de compra.</li>' +
                    '<li>Se informará a los usuarios sobre actualizaciones.</li>' +
                    '</ul>'
                ]
            },
            {
                id: '7',
                title: 'Beneficios para Usuarios Suscritos',
                content: [
                    '<ul>' +
                    '<li>Quienes autoricen recibir comunicaciones podrán acceder a ofertas exclusivas, descuentos especiales y lanzamientos anticipados.</li>' +
                    '</ul>'
                ]
            }
        ],
        cta: {
            title: '¿Deseas más información?',
            description:
                'Si tienes dudas sobre el uso de cookies o el tratamiento de tus datos, puedes contactarnos para brindarte mayor información.',
            buttons: [
                {
                    text: 'Contáctanos',
                    href: '/contacto',
                    variant: 'secondary'
                }
            ]
        }
    },
    'politica-de-devoluciones': {
        slug: 'politica-de-devoluciones',
        title: 'Política de Devoluciones',
        description: 'Política de Devoluciones de LIWILU S.A.C.',
        heroImage: '/images/liwilu-politicas-banner.png',
        heroAlt: 'Política de Devoluciones',
        introduction: [
            'Para solicitar un canje o devolución de un producto de <strong>Liwilu S.A.C.</strong> (en adelante, <strong>Liwilu</strong>), se debe tener en cuenta las siguientes consideraciones:'
        ],
        sections: [
            {
                id: '1',
                title: 'Política de Cambios',
                content: [
                    'El cambio de productos comercializados por <strong>Liwilu</strong> (en adelante, el producto) solo puede ser solicitado si fue adquirido a través de la tienda virtual de <strong>Liwilu</strong> (página web <a href="https://liwilu.com.pe" target="_blank" rel="noopener noreferrer" class="text-primary underline"><strong>https://liwilu.com.pe</strong></a>) o en los puntos de venta físicos autorizados y promocionados por <strong>Liwilu</strong>. El cambio debe ser solicitado dentro de los <strong>7 días hábiles</strong>, contados (i) desde la fecha en que el producto fue adquirido, en caso de compra presencial, o (ii) desde la fecha de entrega del producto, en caso de compra virtual.',
                    '<strong>Requisitos para realizar el cambio:</strong>',
                    '<ul>' +
                    '<li>Es indispensable presentar el comprobante de pago en formato impreso o digital (Boleta y/o factura).</li>' +
                    '<li>Documento de identidad (DNI, carnet de extranjería o pasaporte) de la persona que realizará el cambio, mayor a 18 años.</li>' +
                    '<li>El producto debe encontrarse en perfectas condiciones*, manteniendo las etiquetas de información, empaques originales y precio correspondiente.</li>' +
                    '<li>El cambio se dará sujeto a disponibilidad de stock. En caso <strong>Liwilu</strong> no cuente con stock, se efectuará el respectivo reembolso.</li>' +
                    '</ul>',
                    'Queda a discreción de <strong>Liwilu</strong> el validar y aceptar el cumplimiento de los requisitos para realizar el cambio del producto.',
                    '<strong>Lugares para tramitar el cambio:</strong>',
                    '<ul>' +
                    '<li>Acércate a nuestra tienda física ubicada en <strong>Av. Santa Lucía 359, distrito de Ate, Lima, Perú</strong>.</li>' +
                    '</ul>',
                    '<strong>Condiciones del producto:</strong>',
                    '<table class="w-full border border-gray-200 border-collapse text-sm">' +
                    '<thead>' +
                    '<tr>' +
                    '<th class="border px-3 py-2 text-left"><strong>Tipo de producto</strong></th>' +
                    '<th class="border px-3 py-2 text-left"><strong>Condiciones exigidas*</strong></th>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody>' +
                    '<tr>' +
                    '<td class="border px-3 py-2"><strong>Útiles</strong></td>' +
                    '<td class="border px-3 py-2">No usado, no sucio, no roto, empaque original.</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td class="border px-3 py-2"><strong>EPPS</strong></td>' +
                    '<td class="border px-3 py-2">No usado, no sucio, no roto, sellado original.</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td class="border px-3 py-2"><strong>Libros</strong></td>' +
                    '<td class="border px-3 py-2">No usado, no sucio, no doblado o roto, empaque original.</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td class="border px-3 py-2"><strong>Uniformes</strong></td>' +
                    '<td class="border px-3 py-2">No usado, no sucio, no roto, etiqueta y empaque original.</td>' +
                    '</tr>' +
                    '</tbody>' +
                    '</table>'
                ]
            },
            {
                id: '2',
                title: 'Política de Devoluciones',
                content: [
                    'La devolución de productos solo puede ser solicitado si fue adquirido a través de la tienda virtual de <strong>Liwilu</strong> (página web <a href="https://liwilu.com.pe" target="_blank" rel="noopener noreferrer" class="text-primary underline"><strong>https://liwilu.com.pe</strong></a>) o en los puntos de venta físicos autorizados y promocionados por <strong>Liwilu</strong>. Para devolver el producto, este debe ser entregado sellado, sin uso, en su empaque original, en perfectas condiciones y con el comprobante de pago original; y debe ser solicitado dentro de los <strong>7 días hábiles</strong>, contados (i) desde la fecha en que el producto fue adquirido, en caso de compra presencial, o (ii) desde la fecha de entrega del producto, en caso de compra virtual.',
                    '<strong>Requisitos para realizar la devolución:</strong>',
                    '<ul>' +
                    '<li>Comprobante de compra (Boleta y/o factura).</li>' +
                    '<li>Documento de identidad (DNI, carnet de extranjería o pasaporte) de la persona que realizará la devolución, mayor a 18 años.</li>' +
                    '<li>El producto debe encontrarse en perfectas condiciones**, manteniendo las etiquetas de información, empaques originales y precio correspondiente.</li>' +
                    '</ul>',
                    '<strong>Condiciones del producto:</strong>',
                    '<table class="w-full border border-gray-200 border-collapse text-sm">' +
                    '<thead>' +
                    '<tr>' +
                    '<th class="border px-3 py-2 text-left"><strong>Tipo de producto</strong></th>' +
                    '<th class="border px-3 py-2 text-left"><strong>Condiciones exigidas*</strong></th>' +
                    '</tr>' +
                    '</thead>' +
                    '<tbody>' +
                    '<tr>' +
                    '<td class="border px-3 py-2"><strong>Útiles</strong></td>' +
                    '<td class="border px-3 py-2">No usado, no sucio, no roto, empaque original.</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td class="border px-3 py-2"><strong>EPPS</strong></td>' +
                    '<td class="border px-3 py-2">No usado, no sucio, no roto, sellado original.</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td class="border px-3 py-2"><strong>Libros</strong></td>' +
                    '<td class="border px-3 py-2">No usado, no sucio, no doblado o roto, empaque original.</td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td class="border px-3 py-2"><strong>Uniformes</strong></td>' +
                    '<td class="border px-3 py-2">No usado, no sucio, no roto, etiqueta y empaque original.</td>' +
                    '</tr>' +
                    '</tbody>' +
                    '</table>',
                    '<strong>Dónde realizar la devolución:</strong>',
                    '<ul>' +
                    '<li>En el mismo punto de venta físico donde recogió su pedido y/o realizó su compra.</li>' +
                    '<li>Si la compra fue realizada por nuestra tienda virtual, comunicarse previamente.</li>' +
                    '</ul>',
                    '<strong>Canales de contacto:</strong>',
                    '<ul>' +
                    '<li>Correo: <a href="mailto:postventa@liwilu.com.pe" class="text-primary underline"><strong>postventa@liwilu.com.pe</strong></a></li>' +
                    '<li>Teléfono: 01-7028086 (opción 1)</li>' +
                    '<li>Dirección: <strong>Av. Santa Lucía 359, distrito de Ate, Lima, Perú</strong></li>' +
                    '</ul>'
                ]
            },
            {
                id: '3',
                title: 'Reembolso',
                content: [
                    'La devolución del dinero se efectúa a la tarjeta de crédito o débito con la que se pagó el producto. Dicha devolución del dinero por parte de <strong>Liwilu</strong> se efectúa en un plazo aproximado de <strong>15 días hábiles</strong> contados desde que fue confirmada la devolución del producto por parte de <strong>Liwilu</strong>, a la cuenta del cliente que realizó la compra, luego de cumplir con los requisitos y entregar el producto.',
                    'El plazo de devolución dependerá de las políticas del banco emisor de la respectiva tarjeta, por lo que <strong>Liwilu</strong> no es responsable del plazo en que se efectúe dicha devolución.'
                ]
            }
        ],
        cta: {
            title: '¿Deseas más información?',
            description:
                'Si tienes dudas sobre el uso de cookies o el tratamiento de tus datos, puedes contactarnos para brindarte mayor información.',
            buttons: [
                {
                    text: 'Contáctanos',
                    href: '/contacto',
                    variant: 'secondary'
                }
            ]
        }
    },
    'politica-de-envio-y-recojo-pedidos': {
        slug: 'politica-de-envio-y-recojo-pedidos',
        title: 'Política de Envío y Recogida de Pedidos',
        description: 'Política de Envío y Recogida de Pedidos de LIWILU S.A.C.',
        heroImage: '/images/liwilu-politicas-banner.png',
        heroAlt: 'Política de Envío y Recogida de Pedidos',
        introduction: [
            '<strong>¿CUÁLES SON LOS TIPOS DE ENTREGA DE PEDIDO?</strong>',
            'Puede realizar su pedido de dos formas:',
            '<ul>' +
            '<li><strong>Envío (Delivery):</strong> Envío a domicilio.</li>' +
            '<li><strong>Recojo en tienda:</strong> Puntos de recojo autorizados y establecidos en Lima Metropolitana.</li>' +
            '</ul>'
        ],
        sections: [
            {
                id: '1',
                title: 'Delivery',
                content: [
                    '<strong>¿CUÁNTO TARDARÁ EN LLEGAR MI PEDIDO SI SOLICITÉ UN DELIVERY?</strong>',
                    'Hasta <strong>cinco (5) días hábiles</strong>* (no considerar feriados, sábados ni domingos), contando desde la emisión de su comprobante, el cual le llegará a su correo registrado en la compra.',
                    'Puede hacer seguimiento de su pedido a través de: <strong>LINK</strong>.',
                    '<ul>' +
                    '<li>En caso el courier no encuentre una persona que pueda recibir el pedido en la dirección registrada, automáticamente se procederá a reprogramar el envío para el siguiente día hábil. Si tampoco se encuentra una persona en la segunda visita, el pedido retornará a nuestros almacenes y se procederá con la devolución del monto del pedido y no del costo del delivery. Para mayor detalle revisar políticas de cambios y devoluciones publicadas en la web <a href="https://www.liwilu.com.pe" target="_blank" rel="noopener noreferrer" class="text-primary underline"><strong>www.liwilu.com.pe</strong></a>.</li>' +
                    '<li>Si existe algún error en la información brindada al registro de su compra, que afecte en la entrega del pedido, este se cancelará procediendo con la devolución del monto del pedido y no del costo del delivery. Para mayor detalle revisar políticas de cambios y devoluciones publicadas en la web <a href="https://www.liwilu.com.pe" target="_blank" rel="noopener noreferrer" class="text-primary underline"><strong>www.liwilu.com.pe</strong></a>.</li>' +
                    '<li>No se entregarán pedidos a menores de edad.</li>' +
                    '</ul>',
                    '* Los plazos de entrega dependen del operador logístico o transportista contratado por <strong>LIWILU S.A.C.</strong>, y pueden verse afectados por razones ajenas o de fuerza mayor (bloqueo de carreteras, manifestaciones públicas, huelgas, desastres naturales, inmovilizaciones sociales obligatorias, cuarentenas, etc.).'
                ]
            },
            {
                id: '2',
                title: 'Doble Delivery',
                content: [
                    'Si la compra de su pedido excede el peso máximo del costo de envío, se considera como un pedido adicional y, por lo tanto, se cobra <strong>doble delivery</strong>.'
                ]
            },
            {
                id: '3',
                title: '¿Qué puedo hacer si mi pedido no llega?',
                content: [
                    'Puede comunicarse a nuestro canal de atención al Cliente:',
                    '<ul>' +
                    '<li><strong>Call Center:</strong> 01-7028086 (opción 1)</li>' +
                    '<li><strong>WhatsApp:</strong> 902 727 658</li>' +
                    '<li><strong>Correo:</strong> <a href="mailto:postventas@liwilu.com" class="text-primary underline"><strong>postventas@liwilu.com</strong></a></li>' +
                    '<li><strong>Horario:</strong> lunes a viernes de 9:00 a.m. a 5:00 p.m.</li>' +
                    '</ul>',
                    'El destinatario del pedido debe contar con un número telefónico válido para coordinar la entrega. Es responsabilidad del usuario revisar y verificar que sus datos estén correctamente ingresados.'
                ]
            },
            {
                id: '4',
                title: 'Recojo en Tienda',
                content: [
                    '<strong>Tiendas de recojo de pedidos:</strong>',
                    '<ul>' +
                    '<li><strong>Ate:</strong> Calle Santa Lucía, Nº 359 – Urb. Aurora, Etapa II Mz. E Lt. 6, distrito de Ate, provincia y departamento de Lima.</li>' +
                    '<li>Los establecimientos elegidos al momento de la compra, los cuales son señalados en la página web de <strong>Liwilu S.A.C.</strong> <a href="https://www.liwilu.com.pe" target="_blank" rel="noopener noreferrer" class="text-primary underline"><strong>www.liwilu.com.pe</strong></a>, serán confirmados al correo electrónico consignado durante la compra de los productos.</li>' +
                    '</ul>',
                    '<strong>Consideraciones para el recojo en tienda:</strong>',
                    '<ul>' +
                    '<li><strong>Titular de la compra:</strong> El recojo debe ser realizado por el titular de la compra o un tercero autorizado, debidamente acreditado al momento de la compra web con nombre completo y número de documento de identidad. Al momento del recojo debe presentar su documento de identidad y número de pedido.</li>' +
                    '<li><strong>Notificación de disponibilidad:</strong> Dentro del plazo de <strong>5 días hábiles</strong> de efectuada correctamente la compra de los productos, <strong>LIWILU S.A.C.</strong> enviará un correo electrónico confirmando que el pedido está listo para ser retirado en la tienda seleccionada.</li>' +
                    '<li><strong>Plazo de retiro y anulación de compra:</strong> El plazo para recoger el pedido es de <strong>5 días hábiles</strong> desde que se recibe el correo electrónico de confirmación. El horario de atención es de lunes a viernes de 8:00 a. m. a 4:30 p. m. y los sábados de 8:00 a. m. a 12:30 p. m. Si no se retira el pedido dentro del plazo establecido, la compra será anulada y se realizará el reembolso al mismo medio de pago utilizado. Para mayor detalle revisar políticas de cambios y devoluciones publicadas en la web <a href="https://www.liwilu.com.pe" target="_blank" rel="noopener noreferrer" class="text-primary underline"><strong>www.liwilu.com.pe</strong></a>.</li>' +
                    '<li><strong>Revisión del producto:</strong> El cliente debe revisar su pedido al momento de la entrega y declarar la conformidad del mismo. Después de la aceptación, <strong>LIWILU</strong> no se responsabiliza por daños físicos a los productos de su pedido.</li>' +
                    '</ul>'
                ]
            }
        ],
        cta: {
            title: '¿Deseas más información?',
            description:
                'Si tienes dudas sobre el uso de cookies o el tratamiento de tus datos, puedes contactarnos para brindarte mayor información.',
            buttons: [
                {
                    text: 'Contáctanos',
                    href: '/contacto',
                    variant: 'secondary'
                }
            ]
        }
    }
};


export function getPolicyBySlug(slug: string): PolicyPage | undefined {
    return policies[slug];
}

export function getAllPolicySlugs(): string[] {
    return Object.keys(policies);
}
