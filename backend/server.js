const app = require('./app');
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`UNSA Conecta en http://localhost:${PORT}`));