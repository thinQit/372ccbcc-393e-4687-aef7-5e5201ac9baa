import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/Card';
import Link from 'next/link';

export default function StoreDetailsPage() {
  return (
    <div className="bg-slate-100">
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-5">
            <p className="text-sm font-semibold text-primary">Store Details</p>
            <h1 className="text-4xl font-bold text-foreground">BookShop Flagship Storefront</h1>
            <p className="text-lg text-slate-600">
              Our flagship storefront showcases curated collections, expert staff picks, and seasonal promotions.
              Discover premium bindings, fast shipping, and personal concierge support for bulk orders.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/books"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
              >
                Browse the catalog
              </Link>
              <Link
                href="/account/register"
                className="inline-flex items-center justify-center rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
              >
                Join the community
              </Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-lg">
            <Image
              src="/images/feature.jpg"
              alt="BookShop storefront"
              width={1200}
              height={675}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-14 md:grid-cols-3">
        {[
          { label: 'Location', value: 'New York, NY — Ships nationwide' },
          { label: 'Support', value: '24/7 chat + dedicated account manager' },
          { label: 'Fulfillment', value: 'Same-day processing for 80% of orders' }
        ].map((info) => (
          <Card key={info.label}>
            <CardContent>
              <h3 className="text-sm font-semibold text-foreground">{info.label}</h3>
              <p className="text-sm text-slate-600">{info.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-14">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Store hours</h3>
              <ul className="text-sm text-slate-600">
                <li>Monday - Friday: 9:00 AM – 8:00 PM</li>
                <li>Saturday: 10:00 AM – 6:00 PM</li>
                <li>Sunday: 11:00 AM – 4:00 PM</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Contact & amenities</h3>
              <ul className="text-sm text-slate-600">
                <li>Concierge: support@bookshop.com</li>
                <li>Phone: +1 (212) 555-0199</li>
                <li>Accessibility: Wheelchair access, quiet reading lounge</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
