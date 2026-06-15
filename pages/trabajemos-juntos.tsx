import { GetServerSideProps } from 'next';
import Layout from '@/components/Layout';
import Image from 'next/image';
import { fetchTrabajaAcf, TrabajaAcfData } from '@/lib/acf-home';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
function resolveUrl(url?: string) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

interface TrabajaProps {
  acf: TrabajaAcfData;
}

export const getServerSideProps: GetServerSideProps<TrabajaProps> = async () => {
  const raw = await fetchTrabajaAcf();
  const acf = JSON.parse(JSON.stringify(raw));
  return { props: { acf } };
};

export default function TrabajaConNosotros({ acf }: TrabajaProps) {
  const hasRedes = acf.redesEnlaces && acf.redesEnlaces.length > 0;

  return (
    <Layout title="Trabajemos Juntos - Liwilu" description="Trabaja con nosotros" background={true}>
      <div className="relative z-10 max-w-2xl mx-auto p-6 md:p-12 w-full my-24">
        {acf.titulo && (
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-12 text-center">
            {acf.titulo}
          </h1>
        )}

        {hasRedes && (
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-16">
            {acf.redesEnlaces!.map((red, i) =>
              red.url && red.imagen ? (
                <a key={i} href={red.url} target="_blank" rel="noopener noreferrer">
                  <div className="flex flex-col items-center justify-center p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolveUrl(red.imagen)}
                      alt={`Red ${i + 1}`}
                      className="w-[204px] h-[204px] object-contain"
                    />
                  </div>
                </a>
              ) : null
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
