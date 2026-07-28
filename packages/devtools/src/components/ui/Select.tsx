import type { JSX } from 'solid-js'

interface Option {
  value: string
  label: string
}

interface SelectProps extends Omit<JSX.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  value: string
  options: Option[]
  onChange: (value: string) => void
}

export default function Select(props: SelectProps) {
  const { value, options, onChange, ...rest } = props
  return (
    <select
      class="mq-select"
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      {...rest}
    >
      {options.map((option) => (
        <option value={option.value}>{option.label}</option>
      ))}
    </select>
  )
}
