import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "vault-dark": "#0f172a",
        "vault-slate": "#1e293b",
        "vault-accent": "#22d3ee"
      }
    }
  },
  plugins: []
};

export default config;
