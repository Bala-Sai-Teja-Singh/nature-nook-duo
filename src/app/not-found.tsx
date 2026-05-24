import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-6xl font-playfair font-bold text-brand-primary">404</h1>
        <h2 className="text-2xl font-nunito font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          We couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
        </p>
      </div>
      <Link href="/" className="rounded-full bg-brand-primary text-primary-foreground hover:bg-brand-primary/90 px-4 py-2 font-medium">
        Return Home
      </Link>
    </div>
  );
}
