import { log } from "console";
import { dirname } from "path";
import express from "express";
import { fileURLToPath } from "url";

const app = express();
const port: number = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.listen(port);

log("Node application started at port " + port);

app.get("/health", (req, res) => {
    res.send("OK");
    res.status(200);
});

app.get("/", (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.sendFile('/index.html', { root: __dirname });
});