import { Spinner } from '@/components/ui/Spinner';

export default function LoadingPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center px-6">
      <div className="flex items-center gap-3 text-sm text-slate-600">
        <Spinner />
        Loading BookShop...
      </div>
    </div>
  );
}
