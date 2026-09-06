export default function validateRequest(schema) {
    return function (req, res, next) {
        req.body = schema.parse(req.body);
        next();
    }
}