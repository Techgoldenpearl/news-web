export function HeroSkeleton() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 items-start animate-pulse">
      <div className="lg:col-span-2 bg-panel border border-line rounded-lg overflow-hidden">
        <div className="aspect-[16/9] bg-panel-2" />
        <div className="p-3 space-y-2">
          <div className="h-5 bg-panel-2 rounded w-5/6" />
          <div className="h-5 bg-panel-2 rounded w-2/3" />
          <div className="h-3 bg-panel-2 rounded w-1/3 mt-3" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 bg-panel border border-line rounded-lg p-3.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-20 h-16 sm:w-24 sm:h-[72px] shrink-0 rounded-md bg-panel-2" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-3 bg-panel-2 rounded w-full" />
              <div className="h-3 bg-panel-2 rounded w-4/5" />
              <div className="h-3 bg-panel-2 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function BlockSkeleton() {
  return (
    <section className="bg-panel border border-line rounded-lg p-4 sm:p-5 animate-pulse">
      <div className="flex items-center gap-2.5 mb-4 pb-2.5 border-b border-line">
        <div className="w-1 h-6 rounded-full bg-panel-2" />
        <div className="h-5 bg-panel-2 rounded w-32" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        <div className="lg:col-span-1 rounded-lg overflow-hidden">
          <div className="aspect-[3/2] bg-panel-2" />
          <div className="p-3 space-y-2">
            <div className="h-4 bg-panel-2 rounded w-full" />
            <div className="h-4 bg-panel-2 rounded w-3/4" />
          </div>
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-20 h-16 sm:w-24 sm:h-[72px] shrink-0 rounded-md bg-panel-2" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-panel-2 rounded w-full" />
                <div className="h-3 bg-panel-2 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}
