import React, { useState } from 'react';
import { Image as ImageIcon, User } from 'lucide-react';

/**
 * ImageWithFallback - A robust image component that handles load errors gracefully.
 * @param {string} src - The image source URL
 * @param {string} alt - Alt text
 * @param {string} className - Styling classes
 * @param {string} type - 'avatar' or 'cover' to determine fallback icon
 */
const ImageWithFallback = ({ src, alt, className, type = 'cover', ...props }) => {
    const [error, setError] = useState(false);

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
            src={src}
            alt={alt}
            className={className}
            onError={() => setError(true)}
            {...props}
        />
    );
};

export default ImageWithFallback;
