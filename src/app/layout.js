import { Fraunces, Instrument_Sans } from 'next/font/google';
import './globals.css';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';

const displayFont = Fraunces({
  variable: '--font-display',
  subsets: ['latin'],
});

const bodyFont = Instrument_Sans({
  variable: '--font-body',
  subsets: ['latin'],
});

export const metadata = {
  title: 'e-baso-ikan',
  description: 'Pesan baso ikan hangat, renyah, dan siap ambil dari satu tempat yang terasa seperti menu board digital.',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
