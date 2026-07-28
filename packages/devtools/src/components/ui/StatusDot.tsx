interface StatusDotProps {
  status: 'fetching' | 'error' | 'success' | 'idle'
}

export default function StatusDot(props: StatusDotProps) {
  return <span class={`mq-status-dot ${props.status}`} />
}
