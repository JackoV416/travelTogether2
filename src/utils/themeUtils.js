/**
 * Theme Utilities for Aurora Design System
 * Handles dynamic color generation and theme application
 */

// Convert Hex to HSL
export const hexToHsl = (hex) => {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return null;

    let r = parseInt(result[1], 16);
    let g = parseInt(result[2], 16);
    let b = parseInt(result[3], 16);

    r /= 255;
    g /= 255;
    b /= 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

// Convert HSL to Hex
export const hslToHex = (h, s, l) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
};

// Generate Aurora Theme Palette based on a primary color
export const generateAuroraTheme = (baseHex) => {
    const hsl = hexToHsl(baseHex);
    if (!hsl) return null;

    // Aurora Start: Base Color (Primary)
    const startHex = baseHex;

    // Aurora Mid: Analogous Color (-30 degrees hue)
    // Slightly lighter/brighter
    const midH = (hsl.h - 30 + 360) % 360;
    const midHex = hslToHex(midH, Math.min(hsl.s + 10, 100), Math.min(hsl.l + 5, 90));

    // Aurora End: Analogous Color (+30 degrees hue)
    // Slightly darker/richer
    const endH = (hsl.h + 30) % 360;
    const endHex = hslToHex(endH, Math.min(hsl.s + 10, 100), Math.max(hsl.l - 5, 20));

    // Semantic colors derived from base
    const primaryHover = hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 10, 20));
    const primaryActive = hslToHex(hsl.h, hsl.s, Math.max(hsl.l - 20, 10));
    const primaryLight = `rgba(${parseInt(startHex.slice(1, 3), 16)}, ${parseInt(startHex.slice(3, 5), 16)}, ${parseInt(startHex.slice(5, 7), 16)}, 0.1)`;

    return {
        '--aurora-violet': startHex, // Mapping base to violet slot for simplicity
        '--aurora-indigo': midHex,   // Mapping mid to indigo slot
        '--aurora-teal': endHex,     // Mapping end to teal slot

        '--aurora-start': startHex,
        '--aurora-mid': midHex,
        '--aurora-end': endHex,

        '--color-primary': startHex,
        '--color-primary-hover': primaryHover,
        '--color-primary-active': primaryActive,
        '--color-primary-light': primaryLight,

        '--border-focus': startHex
    };
};

// Apply theme to document root
export const applyTheme = (theme) => {
    if (!theme) return;
    const root = document.documentElement;
    Object.entries(theme).forEach(([property, value]) => {
        root.style.setProperty(property, value);
    });
};
