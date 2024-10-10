const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/blogs', (req, res) => {
  const blogsDir = path.join(__dirname, 'blogs');
  console.log('Attempting to read directory:', blogsDir);
  fs.readdir(blogsDir, (err, files) => {
    if (err) {
      console.error('Error reading blog directory:', err);
      res.status(500).send('Error reading blog directory: ' + err.message);
      return;
    }
    console.log('Files in directory:', files);
    const titles = files
      .filter(file => file.endsWith('.txt'))
      .map(file => path.basename(file, '.txt'));
    console.log('Sending titles:', titles);
    res.send(titles.join('\n'));
  });
});

app.get('/blog/:title', (req, res) => {
  const title = req.params.title;
  const filePath = path.join(__dirname, 'blogs', `${title}.txt`);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading blog file:', err);
      res.status(500).send('Error reading blog file');
      return;
    }
    res.send(data);
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});