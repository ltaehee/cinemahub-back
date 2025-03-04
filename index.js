require('dotenv').config();

const app = require('./app');
const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Express Running on ${PORT}`));
