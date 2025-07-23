import type { LucideIcon } from "lucide-react"

interface FancyInputProps {
	label: string
	type?: 'text' | 'number' | 'email' | 'password'
	value: string | number
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	placeholder?: string
	icon?: LucideIcon
	min?: string
	max?: string
	step?: string
}

const Input: React.FC<FancyInputProps> = ({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  placeholder,
  icon: Icon,
  min,
  max,
  step = "1"
}) => (
  <div className="relative group">
    <label className="block text-xs font-semibold text-amber-700 mb-2 tracking-wide uppercase">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-500 group-focus-within:text-amber-600 transition-colors">
          <Icon size={16} />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        style={{
          paddingLeft: Icon ? '40px' : '16px',
          paddingRight: Icon ? '10px' : '0px'
        }}
        className={`
          w-full h-12 
          ${Icon ? '!pl-[35px]' : 'pl-4'} pr-4 
          bg-gradient-to-br from-amber-50 to-orange-50 
          border-2 border-amber-200 
          rounded-xl 
          text-amber-900 font-medium 
          placeholder-amber-400
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
        `}
      />
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/10 to-orange-400/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none" />
    </div>
  </div>
)

export default Input