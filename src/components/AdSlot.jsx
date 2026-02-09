
export default function AdSlot({ label = "Advertisement", className = "" }) {
  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center p-4 min-h-[100px] text-gray-400 dark:text-gray-500 text-sm font-medium uppercase tracking-wider ${className}`}>
      <span>{label}</span>
    </div>
  );
}
