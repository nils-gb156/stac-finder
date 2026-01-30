const app = require('../app');
const port = 4000;
const host = '0.0.0.0';

// Start server
app.listen(port, host, () => {
  console.log(`Server runs on http://${host}:${port}`);
});
