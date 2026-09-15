require('dotenv/config');
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`ArchScale server running on port ${PORT}`);
});
