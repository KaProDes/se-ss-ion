import { authenticate } from "../middleware/middlewareUtils.js";

async function userRoutes(fastify, options) {
  fastify.post("/signup", async (request, reply) => {
    const { username, password, first_name, last_name, email } = request.body;

    // Check if user already exists
    const existingUser = await fastify.pg.query(
      "SELECT * FROM public.user as pu WHERE pu.username = $1",
      [username]
    );
    if (existingUser.rowCount > 0) {
      return reply.code(400).send({ error: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await fastify.bcrypt.hash(password);

    // Insert new user
    const result = await fastify.pg.query(
      "INSERT INTO public.user (username, password, first_name, last_name, email) VALUES ($1, $2, $3, $4, $5) RETURNING id",
      [username, hashedPassword, first_name, last_name, email]
    );

    // Generate JWT token
    const token = fastify.jwt.sign({ id: result.rows[0].id, username });

    reply.code(201).send({
      message: "User created successfully",
      token,
    });
  });

  fastify.post("/login", async (request, reply) => {
    const { username, password } = request.body;

    // Find user
    const result = await fastify.pg.query(
      "SELECT * FROM public.user AS pu WHERE pu.username = $1",
      [username]
    );
    if (result.rowCount === 0) {
      return reply.code(401).send({ error: "Invalid username or password" });
    }

    const user = result.rows[0];

    // Compare passwords
    const match = await fastify.bcrypt.compare(password, user.password);
    if (!match) {
      return reply.code(401).send({ error: "Invalid username or password" });
    }

    // Generate token
    const token = fastify.jwt.sign({ id: user.id, username: user.username });

    // Return user data (excluding password) along with the token
    const { password: _, ...userWithoutPassword } = user;

    reply.code(200).send({
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  });

  // authenticated route
  fastify.get(
    "/profile/:username",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { username } = request.params;
      const result = await fastify.pg.query(
        `SELECT 
            pu.id, pu.username, pu.first_name, pu.last_name, pu.email 
         FROM public.user as pu 
         WHERE username = $1`,
        [username]
      );
      if (result.rowCount === 0) {
        return reply.code(404).send({ error: "User not found" });
      }
      reply.code(200).send(result.rows[0]);
    }
  );

  // get user details from token
  fastify.get("/me", { preHandler: [authenticate] }, async (request, reply) => {
    const token = request.headers.authorization.split(" ")[1];
    const decoded = fastify.jwt.decode(token);
    const userId = decoded.id;
    const query = fastify.pg.query(
      `SELECT 
        pu.id, pu.username, pu.first_name, pu.last_name, pu.email 
       FROM public.user as pu WHERE id = $1`,
      [userId]
    );
    const result = await query;
    if (result.rowCount === 0) {
      return reply.code(404).send({ error: "User not found" });
    }
    reply.code(200).send(result.rows[0]);
  });

  fastify.post(
    "/save-session",
    {
      preHandler: fastify.authenticate,
    },
    async (request, reply) => {
      const { startDateTime, totalTime } = request.body;
      const token = request.headers.authorization.split(" ")[1];
      const decoded = fastify.jwt.decode(token);
      const userId = decoded.id;

      try {
        const result = await fastify.pg.query(
          "INSERT INTO platform.session (user_id, start_date_time, total_time) VALUES ($1, $2, $3) RETURNING id",
          [userId, startDateTime, totalTime]
        );

        reply.code(201).send({
          message: "Study session saved successfully",
          sessionId: result.rows[0].id,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send({ error: "Error saving study session" });
      }
    }
  );

  fastify.get(
    "/sessions",
    {
      preHandler: fastify.authenticate,
    },
    async (request, reply) => {
      // get userId from token
      const token = request.headers.authorization.split(" ")[1];
      const decoded = fastify.jwt.decode(token);
      const userId = decoded.id;

      try {
        const result = await fastify.pg.query(
          "SELECT * FROM platform.session WHERE user_id = $1 ORDER BY start_date_time DESC",
          [userId]
        );

        reply.send(result.rows);
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send({ error: "Error retrieving study sessions" });
      }
    }
  );

  fastify.post(
    "/archive-session/:sessionId",
    {
      preHandler: fastify.authenticate,
    },
    async (request, reply) => {
      const { sessionId } = request.params;
      const token = request.headers.authorization.split(" ")[1];
      const decoded = fastify.jwt.decode(token);
      const userId = decoded.id;

      try {
        const result = await fastify.pg.query(
          "UPDATE platform.session SET is_deleted = TRUE WHERE id = $1 AND user_id = $2 RETURNING id",
          [sessionId, userId]
        );

        if (result.rowCount === 0) {
          return reply
            .code(404)
            .send({ error: "Session not found or not owned by user" });
        }

        reply.code(200).send({
          message: "Session archived successfully",
          sessionId: result.rows[0].id,
        });
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send({ error: "Error archiving session" });
      }
    }
  );

  fastify.post(
    "/edit-session-title/:sessionId",
    {
      preHandler: fastify.authenticate,
    },
    async (request, reply) => {
      const { sessionId } = request.params;
      const { title } = request.body;
      const token = request.headers.authorization.split(" ")[1];
      const decoded = fastify.jwt.decode(token);
      const userId = decoded.id;

      try {
        const result = await fastify.pg.query(
          "UPDATE platform.session SET title = $1 WHERE id = $2 AND user_id = $3 RETURNING id, title",
          [title, sessionId, userId]
        );

        if (result.rowCount === 0) {
          return reply
            .code(404)
            .send({ error: "Session not found or not owned by user" });
        }

        reply.code(200).send({
          message: "Session renamed successfully",
          session: result.rows[0],
        });
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send({ error: "Error renaming session" });
      }
    }
  )
}

export default userRoutes;
