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
  // How many Invoices were there in 2009 and 2011? What are the respective total sales for each of those years?
  //req.query = { filter: { year: '2009,2011' } }

  let having = '';

  if (req.query.filter) {
    having = 'HAVING';

    req.query.filter.year
      .split(',')
      .map(y => +y)
      .forEach(y => {
        having += ` year = "${y}" OR`;
      });

    having = having.substring(0, having.length - 3);
  }

  db.all(`
    SELECT count(*) as invoices,
           sum(Total) as total,
           strftime('%Y', InvoiceDate) as year
    FROM   Invoice
    GROUP BY year
    ${having}`,
      (err, data) => {
        if (err) throw err;
// + before string converts it to number
        const roundedData = data.map(function (obj) {
          return {
            invoices: obj.invoices,
            year: +obj.year,
            total: +obj.total.toFixed(2)
          }
        });

        res.send({
          data: roundedData,
          info: '# of invoices and sales per year'
        });
      }
    );
});

app.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}`);
});
