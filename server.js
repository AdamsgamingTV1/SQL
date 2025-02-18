const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

const db = new sqlite3.Database('./records.db', (err) => {
    if (err) {
        console.error('Chyba při připojování k databázi:', err.message);
    } else {
        console.log('Úspěšné připojení k databázi :)');
        db.run(`CREATE TABLE IF NOT EXISTS records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT,
            text TEXT
          )`);
    }
});

app.get('/', (req, res) => {
    const categoryFilter = req.query.category || '';
    const searchQuery = req.query.search || '';

    const sql = `SELECT * FROM records WHERE category LIKE ? AND text LIKE ?`;
    db.all(sql, [`%${categoryFilter}%`, `%${searchQuery}%`], (err, rows) => {
        if (err) {
            return res.status(500).send("Chyba při načítání záznamů.");
        }
        res.render('index', { records: rows, categoryFilter, searchQuery });
    });
});

app.get('/add', (req, res) => {
    res.render('add');
});

app.post('/add', (req, res) => {
    const { category, text } = req.body;
    const sql = `INSERT INTO records (category, text) VALUES (?, ?)`;
    db.run(sql, [category, text], function (err) {
        if (err) {
            return res.status(500).send("Chyba při zadávání záznamu.");
        }
        res.redirect('/');
    });
});

app.get('/delete/:id', (req, res) => {
    const id = req.params.id;
    const sql = `DELETE FROM records WHERE id = ?`;
    db.run(sql, [id], function (err) {
        if (err) {
            return res.status(500).send("Chyba při mazání záznamu.");
        }
        res.redirect('/');
    });
});

app.listen(port, () => {
    console.log('Server běží na http://localhost:${port}');
});
