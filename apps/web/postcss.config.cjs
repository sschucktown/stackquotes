@tailwind base;
@tailwind components;
@tailwind utilities;


:root {
color-scheme: light;
}
body { @apply bg-bg text-text; }
a.btn { @apply inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-cta text-white hover:opacity-90 transition; }
