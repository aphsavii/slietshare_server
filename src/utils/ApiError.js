class ApiError extends Error {
    constructor(
        message= "Something went wrong",
        statusCode,
        errors = [],
        stack = ""
    ){
        super(message);
        Object.defineProperty(this, 'message', {
            value: message,
            enumerable: true
        });
        this.statusCode = statusCode
        this.data = null
        this.message = message
        this.success = false;
        this.errors = errors
        
        if (stack) {
            this.stack = stack
        } else{
            Error.captureStackTrace(this, this.constructor)
        }

    }
}

export {ApiError}