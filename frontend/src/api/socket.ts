import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000';

const socket: Socket = io(SOCKET_URL, {
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelayMax: 10000,
});

// Queue socket events if offline
let eventQueue: Array<{ event: string; data: any }> = [];
let isConnected = false;

socket.on('connect', () => {
    isConnected = true;
    // Send queued events
    eventQueue.forEach(({ event, data }) => socket.emit(event, data));
    eventQueue = [];
});

socket.on('disconnect', () => {
    isConnected = false;
});

export function emitSocketEvent(event: string, data: any) {
    if (isConnected) {
        socket.emit(event, data);
    } else {
        eventQueue.push({ event, data });
    }
}

export default socket;
