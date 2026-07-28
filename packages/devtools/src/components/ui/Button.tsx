import type { JSX } from 'solid-js'

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost'
}

export default function Button(props: ButtonProps) {
  const { variant = 'ghost', children, class: className, ...rest } = props
  return (
    <button
      class={`mq-btn ${variant === 'primary' ? 'mq-btn-primary' : ''} ${variant === 'danger' ? 'mq-btn-danger' : ''} ${className || ''}`}
      {...rest}
    >
      {children}
    </button>
  )
}
