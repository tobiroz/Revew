import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "ReVew - Monetiza tus clips",
  description: "Plataforma de recompensas para editores",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-[#050505] text-white">
        <Navbar /> {/* Se renderiza en todas las rutas */}
        <main>{children}</main>
      </body>
    </html>
  );
}