import './globals.css';
import type { Metadata } from 'next';
import Navigation from '@/components/layout/Navigation';
import AuthProvider from '@/providers/AuthProvider';

export const metadata: Metadata = {
  title: 'BookShop',
  description: 'BookShop — a modern, responsive e-commerce bookstore (Shopify-style) for browsing, purchasing and managing a large catalog of physical books. Customers register and log in, search and browse books, add to cart, complete secure Stripe checkout, track orders, leave reviews and receive personalized recommendations. Admin interfaces provide inventory, order and template management plus a sales analytics dashboard and basic SEO tools.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-foreground">
        <AuthProvider>
          <Navigation />
          <main className="min-h-screen">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
