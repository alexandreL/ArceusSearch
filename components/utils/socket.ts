import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents } from '../../types/socket'

fetch('/api/socket')
    .catch((err) => console.error(err))
export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io()
