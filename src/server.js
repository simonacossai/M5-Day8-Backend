const express = require("express")
const cors = require("cors")
const { join } = require("path")
const listEndpoints = require("express-list-endpoints")
const pdfRoute = require("./file/pdfmake");
const attendeesRoute = require("./attendees");
const server = express()

const port =process.env.PORT || 3001

server.use(cors())
server.use(express.json()) 
server.use("/attendees", attendeesRoute);
server.use("/pdf", pdfRoute)
console.log(listEndpoints(server))

server.listen(port, () => {
  console.log("Server is running on port: ", port)
})