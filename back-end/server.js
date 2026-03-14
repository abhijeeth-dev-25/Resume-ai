const dotenv = require("dotenv");
dotenv.config();
const app = require("./src/app");
const connectDB = require("./src/config/database");




connectDB(); // This line calls the connectDB function, which is responsible for establishing a connection to the MongoDB database using Mongoose. The function is defined in the src/config/database.js file and uses the MONGO_URI environment variable to connect to the database.

const Port = process.env.PORT || 5010



app.listen(Port, () => {
    console.log(`server is running on port ${Port}`);
})