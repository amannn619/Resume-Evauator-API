export default class AppResponse{
    constructor(res, data, message = null, statusCode = 200) {
        res.status(statusCode).json({
            status: "success",
            message: message,
            data: data
        })
    }
}