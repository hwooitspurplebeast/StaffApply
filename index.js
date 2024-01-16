const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Middleware to extract user IP address
app.use((req, res, next) => {
  req.userIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  next();
});

// Map to store the submission count for each user IP
const submissionCounts = new Map();

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.post('/submit', (req, res) => {
  const userData = req.body;

  // Use a filename format "User_(ip)_count.txt"
  const userKey = `User_${req.userIP}`;
  const count = submissionCounts.get(userKey) || 0;
  const fileName = `${userKey}_${count}.txt`;

  // Check if the user has already submitted an application
  if (count > 0) {
    // Redirect to blank.html if the user has already submitted
    return res.redirect('/blank.html');
  }

  // Format user's answers
  const formattedData = Object.entries(userData)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  // Save user data to a text file
  fs.writeFileSync(`applications/${fileName}`, formattedData);

  // Update the submission count for the user
  submissionCounts.set(userKey, count + 1);

  res.send('Application submitted successfully!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
