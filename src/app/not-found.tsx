import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-3 text-sm text-slate-600">The page you are looking for does not exist.</p>
      <Button asChild className="mt-6">
        <Link href="/">Return home</Link>
      </Button>
    </div>
  );
}
