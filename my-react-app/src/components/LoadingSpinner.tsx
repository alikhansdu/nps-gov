export default function LoadingSpinner({ label = "Загрузка..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <div className="w-4 h-4 border-2 border-gray-300 border-t-[#0A1628] rounded-full animate-spin" />
      <span>{label}</span>
    </div>
  );
}

