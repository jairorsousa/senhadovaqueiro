import type { Metadata } from "next";
import { QueryProvider } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Senha do Vaqueiro",
  description: "Compre e gerencie senhas de vaquejada com rapidez e segurança."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
