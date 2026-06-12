import express from "express";
import "dotenv/config";
// import { commentRouter } from "./blog/routes/comment.rt";
import { router as blogRouter } from "./blog/apis/blog.route";
import { userRouter } from "./user/api/u.routes";
import { router as categoriesRouter } from "./blog/apis/categories";
import { router as newsLetterRouter } from "./newsletter/api/routes"
import { createServer } from "node:http";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import { Server } from "socket.io";
import "./queue/events";
import "./queue/workers";
import cors from "cors";

export const app = express();

app.use(cors({
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json())
app.use("/api", blogRouter)
// app.use("/api", commentRouter)
app.use("/api", userRouter)
app.use("/api", categoriesRouter)
app.use("/api", newsLetterRouter)

export const server = createServer(app)
export const io = new Server(server, {
    cors: { origin: "*", methods: ['GET', "POST"]}
})
import "./websocket/consumers"

// serve swagger documentation
const swaggerOutputPath = path.resolve("./swagger-output.json")
if (fs.existsSync(swaggerOutputPath)){
    const swaggerDocument = JSON.parse(fs.readFileSync(swaggerOutputPath, "utf-8"))
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
}

function startServer () {
    const port = Number(process.env.PORT) || 3000
    server.listen(port, "0.0.0.0", () => {
        console.log(`Server Runnig On Port: ${port}`)
    })
}
startServer()

