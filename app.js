const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const { createUser, loginUser } = require('./controller/user');
const PORT = process.env.PORT || 8080

app.use(cors());
app.use(express.json())

app.post('/signup', createUser)
app.post('/login', loginUser)

app.listen(PORT, () => {
    console.log(`Listening On Port ${PORT}`);
})