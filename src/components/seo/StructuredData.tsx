import React from 'react';
import type { Thing, WithContext } from 'schema-dts';

interface StructuredDataProps<T extends Thing> {
  data: WithContext<T>;
}

export function StructuredData<T extends Thing>({ data }: StructuredDataProps<T>) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
