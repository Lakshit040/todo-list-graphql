import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
import {graphqlHTTP} from "express-graphql";
import {schema} from "./schema/schema.js";
import colors from "colors";
import connectDB from "./config/db.js";

const port = process.env.PORT || 5000;

const app = express();

// Connect to database
connectDB();

app.use("/graphql", graphqlHTTP({
    schema,
    graphiql: process.env.NODE_ENV === "development",
}));
app.listen(port, () => console.log(`Listening on port ${port}`));