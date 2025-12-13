import type { JSX } from 'solid-js'

interface Props {
  children: JSX.Element
}

export default function Badge(props: Props) {
  return <span class="mq-badge">{props.children}</span>
}
