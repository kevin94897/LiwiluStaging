import { GetStaticPaths, GetStaticProps } from 'next';
import { PolicyPage, getPolicyBySlug, getAllPolicySlugs } from '@/data/policies';
import PolicyPageComponent from '@/components/PolicyPage';

interface PolicyPageProps {
    policy: PolicyPage;
}

export default function PolicyDynamicPage({ policy }: PolicyPageProps) {
    return <PolicyPageComponent policy={policy} />;
}

export const getStaticPaths: GetStaticPaths = async () => {
    const slugs = getAllPolicySlugs();

    return {
        paths: slugs.map((slug) => ({
            params: { slug },
        })),
        fallback: false, // 404 for non-existent slugs
    };
};

export const getStaticProps: GetStaticProps<PolicyPageProps> = async ({ params }) => {
    const slug = params?.slug as string;
    const policy = getPolicyBySlug(slug);

    if (!policy) {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            policy,
        },
    };
};
