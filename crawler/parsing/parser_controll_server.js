//imports
import express from "express"
import cors from "cors"
import { startParser } from "./parser.js"

//server setup
const app = express()
app.use(cors({ origin: "http://localhost:5173" }))
app.use(express.json())

//run parsing function
app.post("/api/run-parser", async (req, res) => {
  try {
    let result = await startParser()
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.listen(3000)

console.log("parser controll server is running")
