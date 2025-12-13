interface CodeBoxProps {
  code: string
  variant?: 'default' | 'error'
}

export default function CodeBox(props: CodeBoxProps) {
  return (
    <pre class={`mq-codebox ${props.variant === 'error' ? 'error' : ''}`}>
      {props.code}
    </pre>
  )
}
