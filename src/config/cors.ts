const nodeEnv = process.env.NODE_ENV;
const productionOrigin = 'https://robinson-8chduuiyc-nikolaos-kladis-projects.vercel.app';
const developmentOrigin = 'http://localhost:3000'; // Default Next.js dev port

// Use production origin in production, otherwise use development origin
const allowedOrigin = nodeEnv === 'production' ? productionOrigin : developmentOrigin;

// Define the standard CORS headers
export const corsHeaders = {
  'Access-Control-Allow-Origin': allowedOrigin,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}; 