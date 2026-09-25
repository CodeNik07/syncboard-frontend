import { io, type Socket } from 'socket.io-client'
import { SocketEvent } from '@/types'
import type { CanvasElement, CursorPosition, ActivityEvent, UserSession } from '@/types'
import { useBoardStore } from '@/stores/boardStore'
import { generateUsername, generateColor, generateId } from '@/lib/utils'
import { initYjs } from '@/stores/yjsStore'

class SocketService {
  private socket: Socket | null = null
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null
  private _sessionId: string = generateId()
  private _username: string = generateUsername()
  private _color: string = generateColor()

  get sessionId() { return this._sessionId }
  get username() { return this._username }
  set username(name: string) { this._username = name }
  get color() { return this._color }
  set color(c: string) { this._color = c }

  connect() {
    if (this.socket?.connected) return

    const socketUrl = (import.meta.env.VITE_API_URL || window.location.origin).replace(/\/$/, '')
    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })

    this.socket.on('connect', () => {
      console.log('[Syncboard] Connected to server')
    })

    this.socket.on('disconnect', () => {
      console.log('[Syncboard] Disconnected from server')
      this.stopHeartbeat()
    })

    this.socket.on('connect_error', (err) => {
      console.warn('[Syncboard] Connection error:', err.message)
    })

    this.setupListeners()
  }

  private setupListeners() {
    if (!this.socket) return

    this.socket.on(SocketEvent.BOARD_STATE, (data: { elements: CanvasElement[]; users: UserSession[] }) => {
      useBoardStore.getState().setActiveUsers(data.users)
      useBoardStore.getState().setMetrics({ activeUsers: data.users.length, totalElements: data.elements.length })
    })

    this.socket.on(SocketEvent.CURSORS_UPDATE, (cursors: CursorPosition[]) => {
      useBoardStore.getState().setCursors(cursors.filter((c) => c.sessionId !== this._sessionId))
    })

    this.socket.on(SocketEvent.PRESENCE_UPDATE, (users: UserSession[]) => {
      useBoardStore.getState().setActiveUsers(users)
      useBoardStore.getState().setMetrics({ activeUsers: users.length })
    })

    this.socket.on(SocketEvent.ACTIVITY_EVENT, (event: ActivityEvent) => {
      useBoardStore.getState().addActivityEvent(event)
    })

    this.socket.on(SocketEvent.USER_JOINED, (data: { username: string; color: string }) => {
      useBoardStore.getState().addActivityEvent({
        id: generateId(),
        message: `${data.username} joined the board`,
        username: data.username,
        color: data.color,
        timestamp: new Date().toISOString(),
        type: 'join',
      })
    })

    this.socket.on(SocketEvent.USER_LEFT, (data: { username: string; color: string }) => {
      useBoardStore.getState().addActivityEvent({
        id: generateId(),
        message: `${data.username} left the board`,
        username: data.username,
        color: data.color,
        timestamp: new Date().toISOString(),
        type: 'leave',
      })
    })

    this.socket.on(SocketEvent.BOARD_DELETED, () => {
      window.location.href = '/'
    })

    // Live chat
    this.socket.on('CHAT_MESSAGE', (msg: { id: string; message: string; username: string; color: string; sessionId: string; timestamp: string }) => {
      useBoardStore.getState().addChatMessage(msg)
    })
  }

  joinBoard(boardId: string) {
    this.socket?.emit(SocketEvent.JOIN_BOARD, {
      boardId,
      sessionId: this._sessionId,
      username: this._username,
      color: this._color,
    })
    this.startHeartbeat(boardId)
    
    // Initialize Yjs for elements
    const { elementsMap } = initYjs(boardId)
    elementsMap.observe(() => {
      useBoardStore.getState().syncFromYjs()
    })
  }

  leaveBoard(boardId: string) {
    this.socket?.emit(SocketEvent.LEAVE_BOARD, { boardId, sessionId: this._sessionId })
    this.stopHeartbeat()
  }

  emitCursorMove(boardId: string, x: number, y: number) {
    this.socket?.volatile.emit(SocketEvent.CURSOR_MOVE, {
      boardId,
      sessionId: this._sessionId,
      username: this._username,
      color: this._color,
      x,
      y,
    })
  }

  emitAddElement(boardId: string, element: CanvasElement) {
    // Handled by Yjs
  }

  emitUpdateElement(boardId: string, elementId: string, changes: Partial<CanvasElement>) {
    // Handled by Yjs
  }

  emitDeleteElement(boardId: string, elementId: string) {
    // Handled by Yjs
  }

  emitClearBoard(boardId: string) {
    // Handled by Yjs
  }

  emitSyncState(boardId: string, elements: CanvasElement[]) {
    // Handled by Yjs
  }

  emitActivityEvent(boardId: string, event: ActivityEvent) {
    this.socket?.emit(SocketEvent.ACTIVITY_EVENT, { boardId, event })
  }

  emitUpdateUsername(boardId: string, newUsername: string) {
    this.socket?.emit('UPDATE_USERNAME', {
      boardId,
      sessionId: this._sessionId,
      username: newUsername,
    })
  }

  emitChatMessage(boardId: string, message: string) {
    this.socket?.emit('CHAT_MESSAGE', { boardId, message })
  }

  private startHeartbeat(boardId: string) {
    this.stopHeartbeat()
    this.heartbeatInterval = setInterval(() => {
      this.socket?.emit(SocketEvent.HEARTBEAT, { boardId, sessionId: this._sessionId })
    }, 10000)
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  disconnect() {
    this.stopHeartbeat()
    this.socket?.disconnect()
    this.socket = null
  }

  get isConnected() {
    return this.socket?.connected ?? false
  }
}

export const socketService = new SocketService()
