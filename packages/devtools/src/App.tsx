import { createMemo } from 'solid-js'

import TestPanel from './TestPanel'

interface QueryManager {
  getQueries: () => any[]
}

interface AppProps {
  queryManager: QueryManager
}

export default function App(props: AppProps) {
  const queries = createMemo(() => props.queryManager.getQueries())
  return <TestPanel queries={queries} />
}
