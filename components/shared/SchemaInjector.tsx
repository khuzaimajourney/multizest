import React from 'react';
import { ToolItem } from '@/lib/types';
import {
  generateWebApplicationSchema,
  generateAggregateRatingSchema,
  generateHowToSchema,
  generateFAQSchema,
  generateToolBreadcrumbSchema,
} from '@/lib/seo-config';

interface SchemaInjectorProps {
  tool: ToolItem;
}

export default function SchemaInjector({ tool }: SchemaInjectorProps) {
  const webAppSchema = generateWebApplicationSchema(tool);
  const aggregateRatingSchema = generateAggregateRatingSchema(tool);
  const howToSchema = generateHowToSchema(tool);
  const faqSchema = generateFAQSchema(tool.faqs);
  const breadcrumbSchema = generateToolBreadcrumbSchema(tool);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aggregateRatingSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
