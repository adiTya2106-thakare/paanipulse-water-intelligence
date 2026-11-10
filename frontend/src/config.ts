// PAANIPULSE API Configuration
// Automatically configured for AWS Lambda / API Gateway or local development
export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || 
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://127.0.0.1:5000"
    : "/api");

export const IS_AWS_DEPLOYED = false;

// Simple client-side reporter device token for anonymous anti-manipulation
export function getOrCreateReporterToken(): string {
  let token = localStorage.getItem("paanipulse_reporter_token");
  if (!token) {
    token = "usr-" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    localStorage.setItem("paanipulse_reporter_token", token);
  }
  return token;
}

