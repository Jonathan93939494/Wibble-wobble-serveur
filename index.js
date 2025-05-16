const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Mon serveur Wibble Wobble est prêt !');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));
