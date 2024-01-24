const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080


app.listen(PORT, () => {
    console.log(`Listening On Port ${PORT}`);
})