import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

export const SEO = ({ title, description, image, url, type = 'website', children }) => {
    const { t, i18n } = useTranslation();
    const siteTitle = "TravelTogether";
    const currentLang = i18n.language;

    // Use default values if not provided
    const metaTitle = title ? `${title} | ${siteTitle}` : siteTitle;
    const metaDesc = description || t('seo.default_desc', "Your smart travel companion for group trips.");
    const metaImage = image || "https://travel-together-2.web.app/og-image-default.jpg"; // Placeholder
    const metaUrl = url || window.location.href;

    return (
        <Helmet>
            {/* Standard Meta */}
            <title>{metaTitle}</title>
            <meta name="description" content={metaDesc} />
            <link rel="canonical" href={metaUrl} />
            <html lang={currentLang} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDesc} />
            <meta property="og:image" content={metaImage} />
            <meta property="og:url" content={metaUrl} />
            <meta property="og:site_name" content={siteTitle} />
            <meta property="og:locale" content={currentLang === 'zh-HK' ? 'zh_HK' : (currentLang === 'zh-TW' ? 'zh_TW' : 'en_US')} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={metaTitle} />
            <meta name="twitter:description" content={metaDesc} />
            <meta name="twitter:image" content={metaImage} />
            {/* Custom Children (e.g. Preloads) */}
            {children}
        </Helmet>
    );
};
