export const dbCreateSession = async(fastify, userId, startDateTime, totalTime) => {
    return await fastify.pg.query(
        "INSERT INTO platform.session (user_id, start_date_time, total_time) VALUES ($1, $2, $3) RETURNING id",
        [userId, startDateTime, totalTime]
    );
}

export const dbArchiveSessionById = async(fastify, sessionId, userId) => {
    return await fastify.pg.query(
        "UPDATE platform.session SET is_deleted = TRUE WHERE id = $1 AND user_id = $2 RETURNING id",
        [sessionId, userId]
    );
}

export const dbUpdateSessionTitle = async(fastify, title, sessionId, userId) => {
    return await fastify.pg.query(
        "UPDATE platform.session SET title = $1 WHERE id = $2 AND user_id = $3 RETURNING id, title",
        [title, sessionId, userId]
    );
}