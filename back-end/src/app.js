const express = require("express");
const authRouter = require("./routes/auth.routes"); // require all the routes from auth.routes.js file and store it in authRouter variable
const interviewRouter = require("./routes/interview.routes");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cookieParser()); // This line adds the cookie-parser middleware to the Express application. It allows the application to parse cookies from incoming requests and make them available in the req.cookies object.
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use("/api/auth", authRouter); // This line tells the Express application to use the authRouter for any requests that start with /api/auth. So, if there is a POST request to /api/auth/login, it will be handled by the authRouter defined in src/routes/auth.routes.js file.
app.use("/api/interview", interviewRouter);

app.get('/', (req, res) => {
    res.send(req.body);
})

// Global error handler for uncaught async errors
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        message: "Internal Server Error",
        error: err.message
    });
});

module.exports = app;