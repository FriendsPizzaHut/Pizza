import { AxiosError } from 'axios';

export function formatError(error: AxiosError): { message: string; code?: string; status?: number } {
    if (error.response) {
        let msg = 'Server error';
        if (error.response.data) {
            if (typeof error.response.data === 'string') {
                msg = error.response.data;
            } else if (
                typeof error.response.data === 'object' &&
                error.response.data !== null &&
                Object.prototype.hasOwnProperty.call(error.response.data, 'message')
            ) {
                msg = (error.response.data as any).message;
            }
        }
        return {
            message: msg,
            code: error.code,
            status: error.response.status,
        };
    }
    return {
        message: error.message || 'Network error',
        code: error.code,
    };
}
