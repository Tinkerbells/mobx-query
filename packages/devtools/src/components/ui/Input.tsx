import type { JSX } from 'solid-js'

interface InputProps {
  value: string
  onInput: (value: string) => void
  placeholder?: string
}

export default function Input(props: InputProps) {
  const { value, onInput, placeholder } = props
  return (
    <input
      class="mq-input"
      value={value}
      placeholder={placeholder}
      onInput={(event) => onInput(event.currentTarget.value)}
    />
  )
}
