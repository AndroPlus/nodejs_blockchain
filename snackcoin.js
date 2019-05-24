const Block = require('./Block.js')
const sha256 = require('sha256');
const mysql = require('mysql2');
const { parse } = require('querystring');
var express = require('express');
var app = express();

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'blockchain',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

const hash_block = (obj) => sha256(obj.index + obj.timestamp + obj.data + obj.prevHash);

const createGenesisBlock = () => new Block(0, Date.now(), {"proof-of-work": 9,"transactions": ""}, '0');

const nextBlock = (lastBlock, data) =>
  new Block(lastBlock.index + 1, Date.now(), data, lastBlock.thisHash);
  
  // A completely random address of the owner of this node
  miner_address = "q3nf394hjg-random-miner-address-34nf3i4nflkn3oi"
  // This node's blockchain copy
  var blockchain = []
  blockchain.push(createGenesisBlock())
  // Store the transactions that
  // this node has in a list
  var this_nodes_transactions = []
  // Store the url data of every
  // other node in the network
  // so that we can communicate
  // with them
  var peer_nodes = []
  // A variable to deciding if we're mining or not
  var mining = true


  app.post('/taxion', function(req, res) {    
    collectRequestData(req, result => {    
        insertTaxion(result.from_tax, result.to_tax, result.amount) 
            res.end(`Transaction submission successful!`);
        });
  });

async function insertTaxion(from_tax, to_tax, amount) {
    await pool.query(
        'INSERT INTO transaction SET ?',
        { from_tax, to_tax, amount } ,
        function(err, results) {
            console.log(results);
          }
        );  
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

app.listen(3000);