export default {
  backendUrl: process.env.BACKEND_URL || "http://localhost:4000",
  edgeFunctionUrl: process.env.EDGE_FUNCTION_URL || "http://localhost:8000",
  env: process.env.NODE_ENV || "development",
};
