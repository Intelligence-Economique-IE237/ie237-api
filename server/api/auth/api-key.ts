import { defineHandler } from "nitro"

// API Key authentication middleware
// In production, keys should be hashed and stored securely in the api_keys table
// This is a simple implementation for foundation phase

// Generate a new API key (UUID format for now - will switch to ULID later)
export function generateApiKey(): string {
  // Use crypto random for key generation
  const bytes = new Uint16Array(16)
  crypto.getRandomValues(bytes)
  return Buffer.from(bytes).toString("hex")
}

// API Key authentication handler
// Validates the API key provided in the Authorization header
export default defineHandler((event) => {
  const authHeader = event.node.headers["authorization"]

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      statusCode: 401,
      body: {
        error: "Missing or invalid Authorization header",
        message: "Expected format: Authorization: Bearer <api-key>",
      },
    }
  }

  const providedKey = authHeader.substring("Bearer ".length)

  // TODO: In production, look up key in api_keys table and verify hash
  // For now, accept any non-empty key for development
  if (!providedKey) {
    return {
      statusCode: 401,
      body: {
        error: "Invalid API key",
        message: "Please provide a valid API key",
      },
    }
  }

  // Placeholder: accept key for now, will implement real auth in later phase
  return {
    statusCode: 200,
    body: {
      success: true,
      message: "API key authenticated",
      keyId: providedKey.substring(0, 8) + "...",
    },
  }
}
