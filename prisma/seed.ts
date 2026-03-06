import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const json = (value: unknown) => JSON.stringify(value);

async function main() {
  await prisma.analyticsMetric.deleteMany();
  await prisma.template.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const userPassword = await bcrypt.hash('Reader123!', 10);

  const admin = await prisma.user.create({
    data: {
      full_name: 'BookShop Admin',
      email: 'admin@bookshop.com',
      password_hash: adminPassword,
      role: 'admin',
      preferences: json({ newsletter_optin: true })
    }
  });

  const customer = await prisma.user.create({
    data: {
      full_name: 'Ava Reader',
      email: 'ava@bookshop.com',
      password_hash: userPassword,
      role: 'customer',
      shipping_addresses: json([
        { label: 'Home', line1: '12 Market Street', city: 'New York', region: 'NY', postal: '10001', country: 'US' }
      ]),
      billing_addresses: json([
        { label: 'Billing', line1: '12 Market Street', city: 'New York', region: 'NY', postal: '10001', country: 'US' }
      ]),
      preferences: json({ newsletter_optin: false })
    }
  });

  const books = await Promise.all([
    prisma.book.create({
      data: {
        title: 'The Modern Reader',
        authors: json(['Ava Johnson']),
        isbn: '9780143127741',
        description: 'A celebration of contemporary literature with curated essays and guided reading lists.',
        genres: json(['Literary', 'Essays']),
        price_cents: 2400,
        currency: 'USD',
        stock: 120,
        images: json(['/images/hero.jpg']),
        publisher: 'Brightleaf Press',
        published_date: new Date('2023-06-15'),
        language: 'English',
        weight_grams: 450,
        dimensions_cm: '21 x 14 x 3',
        rating_avg: 4.7,
        review_count: 128,
        seo_meta: json({ title: 'The Modern Reader', description: 'Curated essays for modern book lovers.' })
      }
    }),
    prisma.book.create({
      data: {
        title: 'Atlas of Stories',
        authors: json(['Noah Patel', 'Lia Chen']),
        isbn: '9780062951366',
        description: 'A visual journey through epic storytelling traditions across the globe.',
        genres: json(['Art', 'History']),
        price_cents: 3200,
        currency: 'USD',
        stock: 80,
        images: json(['/images/feature.jpg']),
        publisher: 'Atlas House',
        published_date: new Date('2022-10-02'),
        language: 'English',
        weight_grams: 650,
        dimensions_cm: '28 x 22 x 2',
        rating_avg: 4.5,
        review_count: 87,
        seo_meta: json({ title: 'Atlas of Stories', description: 'An illustrated tour of storytelling traditions.' })
      }
    }),
    prisma.book.create({
      data: {
        title: 'Nightfall Library',
        authors: json(['Mina Alvarez']),
        isbn: '9780593139134',
        description: 'A cozy fantasy set in a hidden library filled with secrets and starlight.',
        genres: json(['Fantasy', 'Romance']),
        price_cents: 1980,
        currency: 'USD',
        stock: 200,
        images: json(['/images/cta.jpg']),
        publisher: 'Moonrise Books',
        published_date: new Date('2024-01-10'),
        language: 'English',
        weight_grams: 380,
        dimensions_cm: '20 x 13 x 2.5',
        rating_avg: 4.8,
        review_count: 205,
        seo_meta: json({ title: 'Nightfall Library', description: 'A cozy fantasy novel about a hidden library.' })
      }
    })
  ]);

  for (const book of books) {
    await prisma.inventory.create({
      data: {
        book_id: book.id,
        sku: `SKU-${book.id.slice(0, 6)}`,
        stock_level: book.stock ?? 0,
        reorder_threshold: 20
      }
    });
  }

  await prisma.review.create({
    data: {
      user_id: customer.id,
      book_id: books[0].id,
      rating: 5,
      title: 'A must-have for readers',
      body: 'Inspiring essays and a beautiful layout. Loved every chapter.',
      helpful_count: 3,
      is_moderated: true
    }
  });

  await prisma.cart.create({
    data: {
      user_id: customer.id,
      items: json([
        { id: 'item-1', book_id: books[0].id, title: books[0].title, quantity: 1, price_cents: books[0].price_cents }
      ]),
      total_cents: books[0].price_cents ?? 0,
      currency: 'USD'
    }
  });

  await prisma.order.create({
    data: {
      user_id: customer.id,
      items: json([
        { id: 'item-1', book_id: books[0].id, title: books[0].title, quantity: 1, price_cents: books[0].price_cents }
      ]),
      total_cents: books[0].price_cents ?? 0,
      currency: 'USD',
      shipping_address: json({ line1: '12 Market Street', city: 'New York', region: 'NY', postal: '10001', country: 'US' }),
      billing_address: json({ line1: '12 Market Street', city: 'New York', region: 'NY', postal: '10001', country: 'US' }),
      status: 'processing',
      payment_status: 'paid',
      stripe_payment_id: 'pi_test_123'
    }
  });

  await prisma.recommendation.create({
    data: {
      user_id: customer.id,
      book_ids: json([books[1].id, books[2].id]),
      algorithm: 'trending'
    }
  });

  await prisma.template.create({
    data: {
      name: 'Aurora Theme',
      html: '<div>Preview</div>',
      css: 'body { font-family: sans-serif; }',
      preview_image: '/images/feature.jpg',
      rating_avg: 4.6,
      is_active: true
    }
  });

  await prisma.analyticsMetric.create({
    data: {
      date: new Date(),
      metric: 'revenue',
      value: 12345.67
    }
  });

  console.log(`Seeded admin ${admin.email} and customer ${customer.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
