/*
 * File: Seo.tsx
 * Project: next-cms
 * File Created: Sunday, 26th July 2026
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Copyright 2022 - 2026 ©
 */
import React from 'react';
import Head from 'next/head';
import { SeoMetadata } from '../lib/utils/seo';
//
// Emits the head of a content page (NC-60). All of the decisions live in
// `buildSeo`, which is unit-tested; this only writes the tags.
//
// `jsonLd` arrives already validated and with its closing tags escaped, which is
// why it is safe to inject here — see `safeJsonLd`.
const Seo: React.FC<{ seo: SeoMetadata }> = ({ seo }) => {
    return (
        <Head>
            <title>{seo.title}</title>
            <meta name="description" content={seo.description} />
            <meta name="robots" content={seo.robots} />
            {seo.canonical && <link rel="canonical" href={seo.canonical} />}
            <meta property="og:type" content={seo.openGraph.type} />
            <meta property="og:title" content={seo.openGraph.title} />
            <meta property="og:description" content={seo.openGraph.description} />
            {seo.openGraph.url && <meta property="og:url" content={seo.openGraph.url} />}
            {seo.openGraph.siteName && <meta property="og:site_name" content={seo.openGraph.siteName} />}
            <meta name="twitter:card" content="summary" />
            {seo.jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: seo.jsonLd }}
                />
            )}
        </Head>
    );
};
//
export default Seo;
//
