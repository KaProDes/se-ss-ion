// src/routes/user.js
import { authenticate } from "../middleware/middlewareUtils.js";
import * as userController from '../controllers/user.js';

async function userRoutes(fastify, options) {
  fastify.post("/signup", async (request, reply) => {
    await userController.signup(fastify, request, reply);
  });

  fastify.post("/login", async (request, reply) => {
    await userController.login(fastify, request, reply);
  });

  fastify.get(
    "/profile/:username",
    { preHandler: [authenticate] },
    async (request, reply) => {
      await userController.getUserProfile(fastify, request, reply);
    }
  );

  fastify.get("/me", { preHandler: [authenticate] }, async (request, reply) => {
    await userController.getCurrentUser(fastify, request, reply);
  });

  fastify.post(
    "/save-session",
    { preHandler: fastify.authenticate },
    async (request, reply) => {
      await userController.saveSession(fastify, request, reply);
    }
  );

  fastify.get(
    "/sessions",
    { preHandler: fastify.authenticate },
    async (request, reply) => {
      await userController.getUserSessions(fastify, request, reply);
    }
  );

  fastify.post(
    "/archive-session/:sessionId",
    { preHandler: fastify.authenticate },
    async (request, reply) => {
      await userController.archiveSession(fastify, request, reply);
    }
  );

  fastify.post(
    "/edit-session-title/:sessionId",
    { preHandler: fastify.authenticate },
    async (request, reply) => {
      await userController.editSessionTitle(fastify, request, reply);
    }
  )
}

export default userRoutes;