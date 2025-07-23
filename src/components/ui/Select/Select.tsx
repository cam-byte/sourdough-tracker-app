import type { LucideIcon } from "lucide-react"

export interface SelectOption {
    value: string | number
    label: string
}

interface SelectProps {
    label: string
    value: string | number
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    options: SelectOption[]
    icon?: LucideIcon
}

const FancySelect: React.FC<SelectProps> = ({
    label,
    value,
    onChange,
    options,
    icon: Icon
}) => (
    <div className="relative group">
        <label className="block text-xs font-semibold text-amber-700 mb-2 tracking-wide uppercase">
            {label}
        </label>
        <div className="relative">
            {Icon && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 group-focus-within:text-amber-600 transition-colors z-10">
                    <Icon size={16} />
                </div>
            )}
            <select
                value={value}
                onChange={onChange}
                style={{
                    paddingLeft: Icon ? '40px' : '16px'
                }}
                className={`
          w-full h-12 
          ${Icon ? 'pl-[35px]' : 'pl-4'} pr-10 
          bg-gradient-to-br from-amber-50 to-orange-50 
          border-2 border-amber-200 
          rounded-xl 
          text-amber-900 font-medium 
          shadow-inner
          transition-all duration-200 ease-in-out
          focus:outline-none 
          focus:border-amber-400 
          focus:shadow-lg 
          focus:shadow-amber-100
          focus:bg-white
          hover:border-amber-300
          hover:shadow-md
          hover:shadow-amber-50
          appearance-none
          cursor-pointer
        `}
            >
                {options.map(option => (
                    <option key={option.value} value={option.value} className="bg-white text-amber-900">
                        {option.label}
                    </option>
                ))}
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-500 pointer-events-none">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/10 to-orange-400/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none" />
        </div>
    </div>
)

export default FancySelect