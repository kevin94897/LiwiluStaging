import { PolicyPage } from '@/data/policies';
import Layout from '@/components/Layout';
import Button from '@/components/ui/Button';
import Image from 'next/image';

interface PolicyPageComponentProps {
  policy: PolicyPage;
}

export default function PolicyPageComponent({ policy }: PolicyPageComponentProps) {
  const heroImage = policy.heroImage || '/images/liwilu-politicas-banner.png';
  const heroAlt = policy.heroAlt || policy.title || 'Política';

  const hasIntro = !!(policy.title || (policy.introduction && policy.introduction.length > 0));
  const hasSections = !!(policy.sections && policy.sections.length > 0);
  const hasCta = !!(policy.cta && (policy.cta.title || policy.cta.description || policy.cta.buttons?.length));

  return (
    <Layout
      title={policy.title ? `${policy.title} - Liwilu` : 'Política - Liwilu'}
      description={policy.description || ''}
      background={true}
    >
      <div className="min-h-screen bg-gray-50" id="policy-page">
        {/* Hero banner */}
        <div className="relative md:h-[200px] h-[150px] z-10">
          <Image
            src={heroImage}
            alt={heroAlt}
            width={1438}
            height={201}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Título e introducción */}
        {hasIntro && (
          <div className="relative md:py-16 py-8 px-4 overflow-hidden">
            <div className="max-w-6xl mx-auto relative z-10">
              {policy.title && (
                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 text-center">
                  {policy.title}
                </h1>
              )}
              {policy.introduction && policy.introduction.length > 0 && (
                <div className="richtext-content space-y-6 text-gray-700 text-lg mt-10">
                  {policy.introduction.map((paragraph, index) => (
                    <div
                      key={index}
                      className="leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: paragraph }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Secciones */}
        {hasSections && (
          <div className="max-w-6xl mx-auto z-10 relative">
            <div className="space-y-6">
              {policy.sections!.map((section, index) => {
                const hasContent = section.content &&
                  (Array.isArray(section.content) ? section.content.length > 0 : !!section.content);

                if (!section.title && !hasContent) return null;

                return (
                  <div
                    key={section.id}
                    className={`rounded-md p-6 md:p-8 shadow-lg ${index === 0 ? 'bg-white' : ''}`}
                  >
                    {section.title && (
                      <div className="mb-4">
                        <h2 className="text-xl md:text-2xl font-semibold relative inline-block">
                          {section.id}. {section.title}
                        </h2>
                      </div>
                    )}
                    {hasContent && (
                      <div className="richtext-content text-gray-700 md:text-lg space-y-3 [&_ul]:list-disc [&_ul]:list-inside [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:ml-4 [&_li]:leading-relaxed [&_a]:text-primary [&_a]:underline [&_strong]:font-semibold [&_strong]:text-gray-800 [&_p]:mb-3">
                        {Array.isArray(section.content) ? (
                          <div
                            className="leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: section.content.join('<br /><br />') }}
                          />
                        ) : (
                          <div
                            dangerouslySetInnerHTML={{ __html: (section.content as string).replace(/\n/g, '<br />') }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        {hasCta && (
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="bg-primary rounded-3xl p-8 md:p-12 text-center shadow-2xl">
              {policy.cta!.title && (
                <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                  {policy.cta!.title}
                </h2>
              )}
              {policy.cta!.description && (
                <p className="text-green-50 text-lg mb-8 max-w-2xl mx-auto">
                  {policy.cta!.description}
                </p>
              )}
              {policy.cta!.buttons && policy.cta!.buttons.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {policy.cta!.buttons.map((button, index) => (
                    <Button key={index} href={button.href} variant={button.variant} size="md">
                      {button.text}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
