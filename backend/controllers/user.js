import {  dbCreateUser, dbGetUserByUserId, dbGetUserByUsername, dbGetUserProfileByUsername } from '../models/user.js';
import { dbCreateSession, dbArchiveSessionById, dbUpdateSessionTitle } from '../models/session.js';
import { getUserIdFromToken } from '../utils/tokenUtils.js';

export async function signup(fastify, request, reply) {
  const { username, password, first_name, last_name, email } = request.body;

  // Check if user already exists
  const existingUser = await dbGetUserByUsername(fastify, username); 
  if (existingUser.rowCount > 0) {
    return reply.code(400).send({ error: "Username already exists" });
  }

  // Hash password
  const hashedPassword = await fastify.bcrypt.hash(password);

  // Insert new user
  const result = await dbCreateUser(fastify, username, hashedPassword, first_name, last_name, email);

  // Generate JWT token
  const token = fastify.jwt.sign({ id: result.rows[0].id, username });

  reply.code(201).send({
    message: "User created successfully",
    token,
  });
}

export async function login(fastify, request, reply) {
  const { username, password } = request.body;

  // Find user
  const result = await dbGetUserByUsername(fastify, username);

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
}

export async function getUserProfile(fastify, request, reply) {
  const { username } = request.params;
  const result = await dbGetUserProfileByUsername(fastify, username);

  if (result.rowCount === 0) {
    return reply.code(404).send({ error: "User not found" });
  }
  reply.code(200).send(result.rows[0]);
}

export async function getCurrentUser(fastify, request, reply) {
  const userId = getUserIdFromToken(fastify, request);
  const result = await dbGetUserByUserId(fastify, userId);
  if (result.rowCount === 0) {
    return reply.code(404).send({ error: "User not found" });
  }
  reply.code(200).send(result.rows[0]);
}

export async function saveSession(fastify, request, reply) {
  const { startDateTime, totalTime } = request.body;
  const userId = getUserIdFromToken(fastify, request);

  try {
    const result = await dbCreateSession(fastify, userId, startDateTime, totalTime);

    reply.code(201).send({
      message: "Study session saved successfully",
      sessionId: result.rows[0].id,
    });
  } catch (error) {
    fastify.log.error(error);
    reply.code(500).send({ error: "Error saving study session" });
  }
}

export async function getUserSessions(fastify, request, reply) {
  const userId = getUserIdFromToken(fastify, request);

  try {
    const result = await dbGetUserByUserId(fastify, userId)

    reply.send(result.rows);
  } catch (error) {
    fastify.log.error(error);
    reply.code(500).send({ error: "Error retrieving study sessions" });
  }
}

export async function archiveSession(fastify, request, reply) {
  const { sessionId } = request.params;
  const userId = getUserIdFromToken(fastify, request);

  try {
    const result = await dbArchiveSessionById(fastify, sessionId, userId);

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

export async function editSessionTitle(fastify, request, reply) {
  const { sessionId } = request.params;
  const { title } = request.body;
  const userId = getUserIdFromToken(fastify, request);

  try {
    const result = await dbUpdateSessionTitle(fastify, title, sessionId, userId);

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