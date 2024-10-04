import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import fastifyPostgres from "@fastify/postgres";
import fastifyBcrypt from "fastify-bcrypt";
import userRoutes from "./routes/user.js";
import { authenticate } from "./middleware/middlewareUtils.js";
import cors from "@fastify/cors";

const fastify = Fastify({ logger: false });

const PG_CONNECTION_STRING = process.env.DB_CONNECTION_STRING;
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3001;

await fastify.register(cors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

// Register plugins
await fastify.register(fastifyJwt, { secret: JWT_SECRET });
await fastify.register(fastifyPostgres, {
  connectionString: PG_CONNECTION_STRING,
});
await fastify.register(fastifyBcrypt, {
  saltWorkFactor: 12,
});

// Health check route
fastify.get("/api/v1/health", async (request, reply) => {
  return { status: "OK", timestamp: new Date().toISOString() };
});

// User route
fastify.register(userRoutes, { prefix: "/api/v1/user" });

// Example protected route
fastify.get(
  "/api/v1/protected",
  { preHandler: authenticate },
  async (request, reply) => {
    reply.send({ message: "This is a protected route", user: request.user });
  }
);

// Start the server
const start = async () => {
  try {
    await fastify.listen({ host: '0.0.0.0', port: PORT });
    fastify.log.info(`Server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
