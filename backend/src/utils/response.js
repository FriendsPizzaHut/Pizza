/**
 * Response Utility
 * 
 * Provides consistent response format across the application.
 * Standardizes success and error responses.
 */

/**
 * Send success response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {object} data - Response data
 */
export const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
    const response = {
        success: true,
        statusCode,
        message,
    };

    if (data !== null) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {object} errors - Validation errors (optional)
 */
export const sendError = (res, statusCode = 500, message = 'Error', errors = null) => {
    const response = {
        success: false,
        statusCode,
        message,
    };

    if (errors !== null) {
        response.errors = errors;
    }

    return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {array} data - Response data array
 * @param {object} pagination - Pagination info (page, limit, total, totalPages)
 */
export const sendPaginated = (
    res,
    statusCode = 200,
    message = 'Success',
    data = [],
    pagination = {}
) => {
    return res.status(statusCode).json({
        success: true,
        statusCode,
        message,
        data,
        pagination: {
            page: pagination.page || 1,
            limit: pagination.limit || 10,
            total: pagination.total || 0,
            totalPages: pagination.totalPages || 0,
        },
    });
};

/**
 * Generic sendResponse utility (as per Prompt 6 pattern)
 * Simplifies controller response sending
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Response message
 * @param {object} data - Response data
 */
export const sendResponse = (res, statusCode = 200, message = 'Success', data = null) => {
    return sendSuccess(res, statusCode, message, data);
};

export default { sendSuccess, sendError, sendPaginated, sendResponse };
