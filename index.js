require('dotenv').config();

const app = require('./app');
const PORT = process.env.PORT;

app.listen(PORT, () => console.log(`Express Running on ${PORT}`));
console.log('testtest', process.env.NODE_ENV);
