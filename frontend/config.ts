type ConfigType = {
  BACKEND_URL: string;
  EDGE_FUNCTION_URL?: string;
  ENV: "development" | "production" | "test";
  L2_ENS_NAME: string;
};

const BACKEND_URL = process.env.BACKEND_URL!;
const EDGE_FUNCTION_URL = process.env.EDGE_FUNCTION_URL;
const ENV = process.env.NODE_ENV!;

const config = {
  BACKEND_URL,
  EDGE_FUNCTION_URL,
  ENV,
  L2_ENS_NAME: process.env.NEXT_PUBLIC_L2_ENS_NAME || "moltlancer.eth",
} as ConfigType;

export default config;