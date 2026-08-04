const express = require('express');
const cors = require('cors');
const seed = require('./seed');

seed();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/catalogue', require('./routes/catalogue'));
app.use('/api/quotes', require('./routes/quotes'));
app.use('/api/presets', require('./routes/presets'));

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
