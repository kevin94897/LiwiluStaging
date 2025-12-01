import React from 'react';
import Layout from '@/components/Layout';
import Image from 'next/image';

const TrabajaConNosotros = () => {


    return (
        <Layout title="Rastreo de Pedido - Liwilu" description="Rastrea tu pedido" background={true}>

            <div className="relative z-10 max-w-2xl mx-auto p-6 md:p-12 w-full my-24">

                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12 text-center">
                    Trabajemos juntos
                </h1>

                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-16">

                    <a
                        href="#"
                        target="_blank"
                        aria-label="Enlace a Plataforma de Contratación (Ct)"
                    >
                        <div className="flex flex-col items-center justify-center p-4">
                            <Image src="/images/liwilu-logo-computrabajo.png" alt="Logo de Computrabajo" width={204} height={204} />
                        </div>
                    </a>

                    <a
                        href="https://www.linkedin.com/company/tunombre/"
                        target="_blank"
                        aria-label="Enlace a LinkedIn"
                    >
                        <div className="flex flex-col items-center justify-center p-4">
                            <Image src="/images/liwilu-logo-linkdn.png" alt="Logo de LinkedIn" width={204} height={204} />
                        </div>
                    </a>

                </div>

            </div>
        </Layout>
    );
};

export default TrabajaConNosotros;