const mysql = require('mysql2');
const http = require('http');
const { parse } = require('querystring');
const sha256 = require('sha256');
//const DbConnection = require('./DbConnection.js');


const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'blockchain',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });


const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
        collectRequestData(req, result => {
            
            hash = hash_block(result)
            var block = {
                block_index : 0,
                block_timestamp : Date.now(),
                block_data : JSON.stringify(result),
                block_prevhash : '0',
                block_hash : hash
              };

              console.log(block)

             insertBlock(block.block_index, block.block_timestamp, block.block_data, block.block_prevhash, block.block_hash) 
            res.end(`Parsed data belonging to ${result.from}`);
        });        
    }
    else {
      res.end(`
        <!doctype html>
        <html>
        <body>
           <h2>BlockChain </h2>
            <form action="/" method="post">
                From: <br /><input type="text" name="from" /><br />
                To: <br /><input type="text" name="to" /><br />
                Amount: <br /><input type="number" name="amount" /><br />
                <button>Save</button>
            </form>
        </body>
        </html>
      `);
    }
});

async function insertBlock(block_index, block_timestamp, block_data, block_prevhash, block_hash) {
    await pool.query(
        'INSERT INTO block SET ?',
        { block_index, block_timestamp, block_data, block_prevhash, block_hash } ,
        function(err, results) {
            console.log(results);
          }
        );  
  }

  function hash_block(obj) {
   return sha256( Date.now() + "obj" + '0');
  }

async function getAllBlocks() {
    const result = await pool.query('SELECT * from block'); 
    return result[0];
  }

function collectRequestData(request, callback) {
    const FORM_URLENCODED = 'application/x-www-form-urlencoded';
    if(request.headers['content-type'] === FORM_URLENCODED) {
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            callback(parse(body));
        });
    }
    else {
        callback(null);
    }
}

server.listen(3000);