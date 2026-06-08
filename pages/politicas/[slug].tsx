import { GetServerSideProps } from 'next';
import { PolicyPage, getAllPolicySlugs } from '@/data/policies';
import PolicyPageComponent from '@/components/PolicyPage';
import { fetchPolicyFromAcf } from '@/lib/acf-policies';

interface PolicyPageProps {
  policy: PolicyPage;
}

export default function PolicyDynamicPage({ policy }: PolicyPageProps) {
  return <PolicyPageComponent policy={policy} />;
}

export const getServerSideProps: GetServerSideProps<PolicyPageProps> = async ({ params }) => {
  const slug = params?.slug as string;

  if (!getAllPolicySlugs().includes(slug)) {
    return { notFound: true };
  }

  const raw = await fetchPolicyFromAcf(slug);
  // Next.js no serializa `undefined` — eliminamos esas keys del objeto
  const policy = JSON.parse(JSON.stringify(raw));

  return {
    props: { policy },
  };
};
