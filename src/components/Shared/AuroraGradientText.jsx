import React from 'react';

export const AuroraGradientText = ({
    children,
    as: Component = 'span',
    className = '',
    ...props
}) => {
    return (
        <Component
            className={`
                bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400
                bg-clip-text text-transparent
                ${className}
            `}
            {...props}
        >
            {children}
        </Component>
    );
};

export default AuroraGradientText;
