import { PageContainer } from "@/components/layout/PageContainer";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-white/5 ${className ?? ""}`}
    />
  );
}

export default function Loading() {
  return (
    <PageContainer>
      <Skeleton className="mb-6 h-6 w-32" />
      <div className="mb-8 rounded-2xl border border-white/8 p-6 md:p-8 bg-[#16213e]">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
          <Skeleton className="h-36 w-36 md:h-48 md:w-48 rounded-xl shrink-0 mx-auto md:mx-0" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-16 w-full max-w-lg" />
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-white/8 bg-[#16213e] p-6 space-y-4">
        <div className="flex gap-1">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-9 w-20" />
          ))}
        </div>
        <div className="space-y-3 max-w-sm">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
