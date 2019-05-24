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
  let miner_address = "q3nf394hjg-random-miner-address-34nf3i4nflkn3oi"
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

  app.get('/blocks', function(req, res) {
    chain_to_send = blockchain
    //Convert our blocks into dictionaries
    //so we can send them as json objects later
    for(i in range(0, chain_to_send.length)) {
      block = chain_to_send[i]
      block_index = block.index
      block_timestamp = block.timestamp
      block_data = block.data
      block_hash = block.hash
      chain_to_send[i] = {
        "index": block_index,
        "timestamp": block_timestamp,
        "data": block_data,
        "hash": block_hash
      }
    }
    chain_to_send = json.dumps(chain_to_send)
    return chain_to_send;
  });

  function find_new_chains() {
    // Get the blockchains of every
    // other node
    var other_chains = []
    for (node_url in peer_nodes) {
        // Get their chains using a GET request
        block = requests.get(node_url + "/blocks").content
        // Convert the JSON object to a Python dictionary
        block = json.loads(block)
        // Add it to our list
        other_chains.append(block)
    }
    return other_chains
  }

function consensus() {
  // Get the blocks from other nodes
  other_chains = find_new_chains()
  // If our chain isn't longest,
  // then we store the longest chain
  longest_chain = blockchain
  for (chain in other_chains){
    if (longest_chain.length < chain.length) {
         longest_chain = chain;
        }
    // If the longest chain isn't ours,
    // then we stop mining and set
    // our chain to the longest one
    blockchain = longest_chain;
    }
}

  app.get('/mine', function(req, res) {    
   let last_block = blockchain[blockchain.length - 1]
   let last_proof = last_block.data['proof-of-work']
   //Find the proof of work for
   //the current block being mined
   //Note: The program will hang here until a new
   //proof of work is found
   let proof = proof_of_work(last_proof)
   //Once we find a valid proof of work,
   // we know we can mine a block so 
   //we reward the miner by adding a transaction
  this_nodes_transactions.push(
    { "from": "network", "to": miner_address, "amount": 1 }
    )
 
   // Now we can gather the data needed
   // to create the new block
  new_block_data = {
    "proof-of-work": proof,
    "transactions": this_nodes_transactions
  } 

  new_block_index = last_block.index + 1
  new_block_timestamp = this_timestamp =  Date.now()
  last_block_hash = last_block.hash
  //Empty transaction list
  this_nodes_transactions = []
  // Now create the
  //new block!
  let mined_block = Block(
    new_block_index,
    new_block_timestamp,
    new_block_data,
    last_block_hash
  )
  blockchain.push(mined_block)
  // Let the client know we mined a block
  return json.dumps({
      "index": new_block_index,
      "timestamp": str(new_block_timestamp),
      "data": new_block_data,
      "hash": last_block_hash
  }) + "\n"


  });

  function proof_of_work(last_proof) {
    // Create a variable that we will use to find
    // our next proof of work
    var incrementor = last_proof + 1
    // Keep incrementing the incrementor until
    // it's equal to a number divisible by 9
    // and the proof of work of the previous
    // block in the chain
    while  (!(incrementor % 9 == 0 && incrementor % last_proof == 0)) {
        incrementor += 1
    }
    // Once that number is found,
    // we can return it as a proof
    // of our work
    return incrementor;
  }

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