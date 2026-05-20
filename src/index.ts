import express from "express";
import { blogRouter } from "./routes/blog";
import "dotenv/config";
import { commentRouter } from "./routes/commentRoutes";

const app = express();
app.use(express.json())
app.use("/api", blogRouter)
app.use("/api", commentRouter)

function startServer () {

    const port = Number(process.env.PORT) || 3000
    const hostName = process.env.HOST_NAME || "localhost"
    app.listen(port, hostName, () => {
        console.log(`Server Runnig On Port: ${port}`)
    })
}
startServer()