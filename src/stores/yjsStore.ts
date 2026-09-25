import * as Y from 'yjs'
import { SocketIOProvider } from 'y-socket.io'
import { IndexeddbPersistence } from 'y-indexeddb'
import type { CanvasElement } from '@/types'

let ydoc = new Y.Doc()
export let elementsMap = ydoc.getMap<CanvasElement>('elements')

let provider: SocketIOProvider | null = null
let persistence: IndexeddbPersistence | null = null

export function initYjs(roomId: string) {
  if (provider) {
    provider.disconnect()
  }
  
  // Re-create the document for the new room
  ydoc.destroy()
  ydoc = new Y.Doc()
  elementsMap = ydoc.getMap<CanvasElement>('elements')

  const serverUrl = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, '')
  
  provider = new SocketIOProvider(serverUrl, roomId, ydoc, { autoConnect: true })
  persistence = new IndexeddbPersistence(roomId, ydoc)
  
  return { ydoc, elementsMap, provider, persistence }
}

export function getYdoc() { return ydoc }
export function getElementsMap() { return elementsMap }
export function getProvider() { return provider }
