import 'dotenv/config';
// require('dotenv').config();

// Set port
export const port = process.env.PORT || 3000;

// Get mongo env variables
export const mongoConnectionUrl = process.env.MONGO_CONNECTION_URL;
export const mongoUserName = process.env.MONGO_USER_NAME;
export const mongoPassword = process.env.MONGO_PASSWORD;
