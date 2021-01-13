/**
 * Custom Error Class
 * 
 */
export default class CreateError extends Error {
    statusCode: number;
    isOperational = false;
    status: string;
/**
 * 
 * @param message Error Message
 * @param statusCode HTTP Status Code to Report Back to Client
 * @param isOperational Is this a User error (if true, error message gets sent to client, otherwise a generic "Server Error" is sent to client)
 */
    constructor(message: string, statusCode: number, isOperational: boolean) {
        super(message);
        this.isOperational = isOperational;
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = isOperational;

        Error.captureStackTrace(this, this.constructor);
    }
}