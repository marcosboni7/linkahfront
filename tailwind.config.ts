import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Aqui você pode adicionar as cores da Linkah se quiser centralizar
      colors: {
        linkah: {
          pink: "#C22973",
          dark: "#0f172a",
        }
      }
    },
  },
  plugins: [
    require("@tailwindcss/typography"), // ESSENCIAL PARA O TIPTAP
  ],
};

export default config;