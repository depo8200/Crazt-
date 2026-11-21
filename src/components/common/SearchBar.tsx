import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search by subject name, code (e.g. CS301), or topic...',
  onSubmit,
  className = '',
}: SearchBarProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      className={`relative flex items-center ${className}`}
    >
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 h-4 w-4 text-[#64748B]"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-xl border border-[#3B82F6]/20 bg-[#090F1C] py-2.5 pl-10 pr-9 text-sm text-[#F8FAFC] placeholder-[#64748B] transition-colors focus:border-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/25"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2.5 rounded-md p-1 text-[#64748B] transition-colors hover:bg-white/10 hover:text-[#F8FAFC]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </form>
  );
}
