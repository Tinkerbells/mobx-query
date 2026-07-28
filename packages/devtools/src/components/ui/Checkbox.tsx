import type { JSX } from 'solid-js'

interface CheckboxProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'value'> {
  checked?: boolean
  onChange?: (checked: boolean) => void
  children?: JSX.Element
}

export default function Checkbox(props: CheckboxProps) {
  const { checked, onChange, children, disabled, ...rest } = props
  return (
    <label class="mq-checkbox">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.currentTarget.checked)}
        {...rest}
      />
      <span>{children}</span>
    </label>
  )
}
