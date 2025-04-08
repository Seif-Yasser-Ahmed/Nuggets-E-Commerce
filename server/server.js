const express = require('express');
const app = express();
const port = 5000;
const cors = require('cors');

app.use(cors());
app.get('/', (req, res) => {
    res.send('Hello from Express!');
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});