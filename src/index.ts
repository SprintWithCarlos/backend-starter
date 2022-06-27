/* eslint-disable no-unused-vars */
/* eslint-disable import/first */

import http from "http";
import expressApp from "./app";

const server = http.createServer(expressApp.app);
const PORT: number | string = process.env.PORT || 3000;

server.listen(PORT);
