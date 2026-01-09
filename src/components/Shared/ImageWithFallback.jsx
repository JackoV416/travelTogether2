import React, { useState, useMemo } from 'react';
import { Image as ImageIcon, User } from 'lucide-react';

/**
 * ImageWithFallback - A robust image component that handles load errors gracefully.
 * V1.2.22: Added Data Saver support for compressed images
 * 
 * @param {string} src - The image source URL
 * @param {string} alt - Alt text
 * @param {string} className - Styling classes
 * @param {string} type - 'avatar' or 'cover' to determine fallback icon
 * @param {boolean} dataSaver - Override data saver setting (optional, reads from localStorage if not provided)
 */
const ImageWithFallback = ({ src, alt, className, type = 'cover', dataSaver: dataSaverProp, ...props }) => {
    const [error, setError] = useState(false);

    // Check Data Saver setting from localStorage or prop
    const isDataSaverEnabled = useMemo(() => {
        if (typeof dataSaverProp === 'boolean') return dataSaverProp;
        try {
            const settings = JSON.parse(localStorage.getItem('travelTogether_settings') || '{}');
            return settings.dataSaver === true;
        } catch {
            return false;
        }
    }, [dataSaverProp]);

    // Process image URL for Data Saver mode
    const processedSrc = useMemo(() => {
        if (!src || !isDataSaverEnabled) return src;

        // Handle Unsplash images - reduce quality and size
        if (src.includes('unsplash.com')) {
            const url = new URL(src);
            // Force smaller width and lower quality
            url.searchParams.set('w', '400');
            url.searchParams.set('q', '60');
            url.searchParams.set('fm', 'webp'); // Use webp for better compression
            return url.toString();
        }

        // Handle other image URLs - add proxy or leave as-is
        return src;
    }, [src, isDataSaverEnabled]);

    if (!src || error) {
        return (
            <div className={`${className} flex items-center justify-center bg-gray-500/10 border border-white/5`} {...props}>
                {type === 'avatar' ? (
                    <User className="w-1/2 h-1/2 opacity-20" />
                ) : (
                    <ImageIcon className="w-1/3 h-1/3 opacity-10" />
                )}
            </div>
        );
    }

    return (
        <img
            src={processedSrc}
            alt={alt}
            className={className}
            loading="lazy"
            onError={() => setError(true)}
            {...props}
        />
    );
};

export default ImageWithFallback;
