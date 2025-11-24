
import React, { useEffect } from 'react';

interface SeoProps {
    title: string;
    description?: string;
    canonicalUrl?: string;
    jsonLd?: Record<string, any>;
}

const Seo: React.FC<SeoProps> = ({ title, description, canonicalUrl, jsonLd }) => {
    useEffect(() => {
        // Update Title
        document.title = title;

        // Update Meta Description
        let metaDesc = document.querySelector("meta[name='description']");
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        if (description) {
            metaDesc.setAttribute('content', description);
        }

        // Update Canonical URL
        let linkCanonical = document.querySelector("link[rel='canonical']");
        if (!linkCanonical) {
            linkCanonical = document.createElement('link');
            linkCanonical.setAttribute('rel', 'canonical');
            document.head.appendChild(linkCanonical);
        }
        if (canonicalUrl) {
            linkCanonical.setAttribute('href', canonicalUrl);
        } else {
            linkCanonical.setAttribute('href', window.location.href);
        }

        // Inject JSON-LD
        let scriptJsonLd: HTMLScriptElement | null = null;
        if (jsonLd) {
            scriptJsonLd = document.createElement('script');
            scriptJsonLd.type = 'application/ld+json';
            scriptJsonLd.text = JSON.stringify(jsonLd);
            document.head.appendChild(scriptJsonLd);
        }

        return () => {
            // Cleanup on unmount
            if (scriptJsonLd) {
                document.head.removeChild(scriptJsonLd);
            }
            document.title = 'DJBook - Modern DJ Booking Platform'; // Reset to default
        };
    }, [title, description, canonicalUrl, jsonLd]);

    return null;
};

export default Seo;
