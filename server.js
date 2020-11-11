const express = require('express');
const request = require('request');

const app = express();

app.use('/', express.static('./www/', {index: 'index.html', extensions: ['HTML'] }));


// Kept getting CORS error
// Sourced solution from https://medium.com/@dtkatz/3-ways-to-fix-the-cors-error-and-how-access-control-allow-origin-works-d97d55946d9

app.get('/coords', (req, res) => {
  request(
    { url: 'http://jacek.soc.port.ac.uk/tmp/coords.json' },
    (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return res.status(500).json({ type: 'error', message: error.message});
      }
      res.json(JSON.parse(body));
    }
  )
});

app.listen(8080, () => {
  console.log('Server running')
});
