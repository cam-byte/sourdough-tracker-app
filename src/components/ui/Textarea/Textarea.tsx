import React from 'react'

interface TextareaProps {
	label: string
	value: string
	onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
	placeholder?: string
	rows?: number
}
const Textarea: React.FC<TextareaProps> = ({
	label,
	value,
	onChange,
	placeholder,
	rows = 3
}) => (
	<div className="relative group">
		<label className="block text-xs font-semibold text-amber-700 mb-2 tracking-wide uppercase">
			{label}
		</label>
		<div className="relative">
			<textarea
				value={value}
				onChange={onChange}
				placeholder={placeholder}
				rows={rows}
				className={`
          w-full 
          p-4 
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
          resize-none
        `}
			/>
			<div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400/10 to-orange-400/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none" />
		</div>
	</div>
)

export default Textarea