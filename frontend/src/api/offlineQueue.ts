import AsyncStorage from '@react-native-async-storage/async-storage';

export interface QueuedRequest {
    url: string;
    method: string;
    body?: any;
    headers?: any;
    timestamp: number;
}

const QUEUE_KEY = 'OFFLINE_REQUEST_QUEUE';

export async function addToQueue(request: QueuedRequest) {
    const queue = await getQueue();
    queue.push(request);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function getQueue(): Promise<QueuedRequest[]> {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
}

export async function processQueue(processor: (req: QueuedRequest) => Promise<boolean>) {
    const queue = await getQueue();
    const newQueue: QueuedRequest[] = [];
    for (const req of queue) {
        try {
            const success = await processor(req);
            if (!success) newQueue.push(req);
        } catch {
            newQueue.push(req);
        }
    }
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
}
