const express = require('express');
const dotenv = require('dotenv');
const pool = require('../config/database');

dotenv.config();

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('File Server API is up and running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
