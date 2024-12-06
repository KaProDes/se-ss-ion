export const dbGetUserByUserId = async(fastify, userId) => {
    return await fastify.pg.query(
        "SELECT * FROM platform.session WHERE user_id = $1 ORDER BY start_date_time DESC",
        [userId]
    );
}

export const dbGetUserByUsername = async(fastify, username) => {
    return await fastify.pg.query(
        "SELECT * FROM public.user as pu WHERE pu.username = $1",
        [username]
    );
}

export const dbCreateUser = async (fastify, username, hashedPassword, first_name, last_name, email) => {
    return await fastify.pg.query(
        "INSERT INTO public.user (username, password, first_name, last_name, email) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [username, hashedPassword, first_name, last_name, email]
    );
}

export const dbGetUserProfileByUsername = async(fastify, username) => {
    return await fastify.pg.query(
        `SELECT 
            pu.id, pu.username, pu.first_name, pu.last_name, pu.email 
         FROM public.user as pu 
         WHERE username = $1`,
        [username]
    );
}

