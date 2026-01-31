import app from "./app";
import http from "http";
import config from "./config";

const server = http.createServer(app);

server.listen(config.PORT, () => {
    console.log(`${config.APP_EMOJI} ${config.APP_NAME} Mock Server running on http://localhost:${config.PORT}`);
});