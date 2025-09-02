export default function Loading() {
  return (
    <div className="grid place-items-center min-h-screen bg-white">
      <div className="flex items-center gap-3">
        <span className="inline-block h-3 w-3 rounded-full bg-gray-900 animate-bounce [animation-delay:-0.2s]" />
        <span className="inline-block h-3 w-3 rounded-full bg-gray-900 animate-bounce [animation-delay:-0.1s]" />
        <span className="inline-block h-3 w-3 rounded-full bg-gray-900 animate-bounce" />
        <p className="ml-3 text-gray-700">Loading…</p>
      </div>
    </div>
  );
}
