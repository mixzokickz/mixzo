export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg)] pt-28 px-6 md:px-12 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="h-10 w-48 bg-[var(--bg-elevated)] rounded-xl animate-pulse mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden">
              <div className="aspect-square bg-[var(--bg-elevated)] animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-[var(--bg-elevated)] rounded animate-pulse w-3/4" />
                <div className="h-4 bg-[var(--bg-elevated)] rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
