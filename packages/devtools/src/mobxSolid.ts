import { Reaction } from 'mobx'
import { enableExternalSource } from 'solid-js'

let isSetup = false

/**
 * Enables Solid to track MobX observables via external sources.
 * Should be called once before rendering MobX-driven components.
 */
export function setupMobxSolid() {
  if (isSetup) return
  isSetup = true

  let id = 0

  enableExternalSource((fn, trigger) => {
    const reaction = new Reaction(`externalSource@${++id}`, trigger)
    return {
      track: (value) => {
        let next: unknown
        reaction.track(() => {
          next = fn(value)
        })
        return next as unknown
      },
      dispose: () => reaction.dispose()
    }
  })
}
