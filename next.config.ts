import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Genera una build autocontenida para imágenes Docker mínimas.
  output: "standalone",
  // Fija la raíz del proyecto (hay otro lockfile en el home del usuario).
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
