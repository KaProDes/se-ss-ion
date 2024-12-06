export function getUserIdFromToken(fastify, request) {
    const token = request.headers.authorization.split(" ")[1];
    const decoded = fastify.jwt.decode(token);
    return decoded.id;
}
