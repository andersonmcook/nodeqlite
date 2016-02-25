'use strict';

const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./db/chinook.sqlite');
const PORT = process.env.PORT || 3000;

// invoices per country
app.get('/invoices-per-country', (req, res) => {
  db.all(`
    SELECT COUNT(*) AS count,
    BillingCountry AS country
    FROM Invoice
    GROUP BY BillingCountry
    ORDER BY count DESC;
    `,
    (err, data) => {
      if (err) throw err;
      res.send({data: data,
        info: 'Number of invoices per country'});
  });
});

// sales per year
app.get('/sales-per-year', (req, res) => {
  db.all(`
    SELECT COUNT(*) as invoices,
    SUM(Total) as total,
    SUBSTR(InvoiceDate, 1, 4) as year
    FROM Invoice
    GROUP BY year;
    `,
     (err, data) => {
      if (err) throw err;
// + turns string to number
      const roundedData = data.map(obj => {
        return {
          invoices: obj.invoices,
          year: +obj.year,
          total: +obj.total.toFixed(2)
        }
      });
      res.send({data: roundedData,
        info: 'Number of invoices and sales per year'
      });
    });
});

app.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}`);
});
