export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/portal/:path*",
    "/tecnico/:path*",
    "/clientes/:path*",
    "/tecnicos/:path*",
    "/ordens-servico/:path*",
  ],
};
