// index.js
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 2000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'madcamp04',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/users', (req, res) => {
  db.query('SELECT * FROM user_info', (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

// 회원가입 API
app.post('/signup', (req, res) => {
  const { userid, userpassword, name } = req.body;
  const sql =
    'INSERT INTO user_info (userid, userpassword, name) VALUES (?, ?, ?)';

  db.query(sql, [userid, userpassword, name], (err, result) => {
    if (err) {
      console.error('Error during signup:', err);
      return res
        .status(500)
        .json({ message: 'User registration failed', error: err });
    }
    res.status(201).json({ message: 'User registered successfully' });
  });
});

// 로그인 API
app.post('/login', (req, res) => {
  const { userid, userpassword } = req.body;
  const sql = 'SELECT * FROM user_info WHERE userid = ? AND userpassword = ?';

  db.query(sql, [userid, userpassword], (err, results) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ message: 'Login failed', error: err });
    }
    if (results.length > 0) {
      res.status(200).json({ message: 'Login successful', user: results[0] });
    } else {
      res.status(200).json({ message: 'Invalid credentials' });
    }
  });
});

app.get('/user-scores', (req, res) => {
  const sql =
    'SELECT userid,name, score,money FROM user_info ORDER BY score DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching user scores:', err);
      return res
        .status(500)
        .json({ message: 'Error fetching user scores', error: err });
    }
    res.status(200).json(results);
  });
});

// 스코어 업데이트 API
app.post('/update-score', (req, res) => {
  const { userid, score } = req.body;

  // 현재 스코어를 조회
  const selectSql = 'SELECT score FROM user_info WHERE userid = ?';
  db.query(selectSql, [userid], (err, results) => {
    if (err) {
      console.error('Error fetching current score:', err);
      return res
        .status(500)
        .json({ message: 'Error fetching current score', error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentScore = results[0].score;

    // 새로운 스코어가 더 크면 업데이트
    if (score > currentScore) {
      const updateSql = 'UPDATE user_info SET score = ? WHERE userid = ?';
      db.query(updateSql, [score, userid], (err, result) => {
        if (err) {
          console.error('Error updating score:', err);
          return res
            .status(500)
            .json({ message: 'Error updating score', error: err });
        }
        return res.status(200).json({ message: 'Score updated', score });
      });
    } else {
      return res
        .status(200)
        .json({ message: 'Score not updated', score: currentScore });
    }
  });
});

app.listen(port, () => {
  console.log('Server running at http://localhost:${port}');
});
