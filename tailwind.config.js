/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    primary: '#8c1822',
                    'primary-hover': '#70131b',
                    secondary: '#32353d',
                    'secondary-hover': '#1f2126',
                },
                action: {
                    scene: '#3b82f6',
                    'scene-hover': '#2563eb',
                    break: '#16a34a',
                    'break-hover': '#15803d',
                    location: '#6b7280',
                    'location-hover': '#4b5563',
                    add: '#3b82f6',
                    'add-hover': '#2563eb',
                },
                danger: {
                    DEFAULT: '#ef4444',
                    hover: '#dc2626',
                },
            },
        },
    },
    plugins: [],
}
