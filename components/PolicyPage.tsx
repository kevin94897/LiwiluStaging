import { PolicyPage, InfoCard } from '@/data/policies';
import Layout from '@/components/Layout';
import Button from '@/components/ui/Button';
import Image from 'next/image';

interface PolicyPageComponentProps {
    policy: PolicyPage;
}

const iconComponents = {
    clock: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
    ),
    location: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    shield: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
        </svg>
    ),
    tag: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
        </svg>
    ),
    alert: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
        </svg>
    ),
};

export default function PolicyPageComponent({ policy }: PolicyPageComponentProps) {
    return (
        <Layout title={`${policy.title} - Liwilu`} description={policy.description} background={true}>
            <div className="min-h-screen bg-gray-50" id='policy-page'>
                {/* Hero Section */}
                <div className="relative md:h-[200px] h-[150px] z-10">
                    <Image
                        src={policy.heroImage}
                        alt={policy.heroAlt}
                        width={1438}
                        height={201}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Introduction */}
                <div className="relative md:py-16 py-8 px-4 overflow-hidden">
                    <div className="max-w-6xl mx-auto relative z-10">
                        <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 text-center">
                            {policy.title}
                        </h1>

                        <div className="space-y-6 text-gray-700 text-lg">
                            {policy.introduction.map((paragraph, index) => (
                                <div
                                    key={index}
                                    className={`${index === policy.introduction.length - 1 ? 'font-semibold' : ''} leading-relaxed mt-10`}
                                    dangerouslySetInnerHTML={{ __html: paragraph }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Policy Sections */}
                <div className="max-w-6xl mx-auto z-10 relative">
                    <div className="space-y-6">
                        {policy.sections.map((section, index) => (
                            <div
                                key={section.id}
                                className={`rounded-md p-6 md:p-8 shadow-lg ${index === 0 ? 'bg-white' : ''}`}
                            >
                                <div className="mb-4">
                                    <h2 className="text-xl md:text-2xl font-semibold relative inline-block">
                                        {section.id}. {section.title}
                                    </h2>
                                </div>
                                <div className="text-gray-700 md:text-lg space-y-3 [&_ul]:list-disc [&_ul]:list-inside [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:ml-4 [&_ol]:space-y-2 [&_li]:leading-relaxed [&_a]:text-primary [&_a]:underline [&_a]:hover:text-primary-hover [&_strong]:font-semibold [&_strong]:text-gray-800 [&_p]:mb-3">
                                    {Array.isArray(section.content) ? (
                                        <div className="leading-relaxed"
                                            dangerouslySetInnerHTML={{
                                                __html: section.content.join('<br /><br />'),
                                            }}
                                        />
                                    ) : typeof section.content === 'string' ? (
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: section.content.replace(/\n/g, '<br />'),
                                            }}
                                        />
                                    ) : (
                                        <div>{section.content}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Additional Info Section */}
                {policy.additionalInfo && (
                    <div className="py-16 px-4">
                        <div className="max-w-6xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 text-center mb-12">
                                {policy.additionalInfo.title}
                            </h2>

                            <div className="grid md:grid-cols-3 gap-8">
                                {policy.additionalInfo.items.map((item, index) => (
                                    <div
                                        key={index}
                                        className="bg-neutral-white rounded-md p-8 shadow-lg hover:shadow-xl transition-shadow"
                                    >
                                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                                            {iconComponents[item.icon]}
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 text-center mb-3">{item.title}</h3>
                                        <p className="text-gray-700 text-center">{item.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* CTA Section */}
                {policy.cta && (
                    <div className="max-w-6xl mx-auto px-4 py-16">
                        <div className="bg-primary rounded-3xl p-8 md:p-12 text-center shadow-2xl">
                            <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">{policy.cta.title}</h2>
                            <p className="text-green-50 text-lg mb-8 max-w-2xl mx-auto">{policy.cta.description}</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                {policy.cta.buttons.map((button, index) => (
                                    <Button key={index} href={button.href} variant={button.variant} size="md">
                                        {button.text}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
