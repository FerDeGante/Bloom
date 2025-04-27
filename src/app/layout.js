import 'bootstrap/dist/css/bootstrap.min.css';   // ✅ OK en servidor
import '@/styles/globals.css';

export const metadata = { title: 'Bloom Fisio' };

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {/* Carga JS de Bootstrap en cliente */}
        <BootstrapClient />
        {children}
      </body>
    </html>
  );
}

/* --- Componente cliente inline para simplicidad --- */
function BootstrapClient() {
  'use client';
  // Importación dinámica evita que se empaquete en el bundle del servidor
  import('bootstrap/dist/js/bootstrap.bundle.min.js');
  return null;
}
