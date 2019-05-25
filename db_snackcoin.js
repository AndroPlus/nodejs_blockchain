const mysql = require('mysql2');
const http = require('http');
const { parse } = require('querystring');
const sha256 = require('sha256');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'blockchain',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  async function getRows() {
    // get the client
    const mysql = require('mysql2/promise');
    // create the connection
    const connection = await mysql.createConnection({host:'localhost', user: 'root', database: 'blockchain'});
    // query database
    const [rows, fields] = await connection.execute('SELECT * FROM `block` ORDER BY block_index DESC LIMIT 1');

    return rows;
  }

const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
        collectRequestData(req, result => {
    
        hash = hash_block(result)

        var block = {}

      rows =  getRows();

      rows.then(function (resul) {

         var rows  = resul[0]
         if(resul.length == 0){
            block = {
                block_index : 0,
                block_timestamp : Date.now(),
                block_data : JSON.stringify(result),
                block_prevhash : '0',
                block_hash : hash
              };

            console.log("first block")
         }else{
            block = {
                block_index : rows.block_index + 1,
                block_timestamp : Date.now(),
                block_data : JSON.stringify(result),
                block_prevhash : rows.block_hash,
                block_hash : hash
              };

            console.log("next block")
         }
        
        console.log(block)

        insertBlock(block.block_index, block.block_timestamp, block.block_data, block.block_prevhash, block.block_hash) 
    
      })
      
        
            res.end(`Succesfully added Block into BlockChain!`);
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
   return sha256( Date.now() + JSON.stringify(obj) + '0');
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