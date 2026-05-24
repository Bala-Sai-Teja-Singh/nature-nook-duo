import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      <p className="text-muted-foreground font-nunito animate-pulse">Loading...</p>
    </div>
  );
}
