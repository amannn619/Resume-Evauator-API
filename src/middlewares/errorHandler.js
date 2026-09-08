export function errorHandler(err, req, res, next) {
    if (err.name == "ZodError") {
        return res.status(400).json(
            {
                status: "error",
                message: "Invalid input.",
                errors: err.flatten()
            })
    }
    if (err.name == "AppError") {
        return res.status(err.statusCode).json(
            {
                status: "error",
                message: err.message,
                errors: err.errors
            })
    }
    if (err.name == "PrismaClientKnownRequestError") {
        if (err.code == "P2025") {
            return res.status(404).json({
                status: "error",
                message: "Record Not Found.",
                errors: null
            })
        }

        if (err.code == "P2002") {
            return res.status(409).json({
                status: "error",
                message: "Record Already Exists.",
                errors: null
            })
        }
    }

    return res.status(500).json(
        {
            status: "error",
            message: err.message,
            errors: null
        })
}