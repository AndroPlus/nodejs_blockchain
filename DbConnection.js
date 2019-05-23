var mysql = require('mysql');
const sha256 = require('sha256');

class DbConnection {
  
  constructor() {
    this.con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "blockchain"
    });
  }

 hash_block(obj) {
   console.log(obj.block_index +" "+ obj.block_timestamp +" "+ obj.block_data +" "+ obj.block_prevhash)
  return sha256(obj.block_index + obj.block_timestamp + obj.block_data + obj.block_prevhash);
 } 

 insert(result) {
   var me = this;
   me.selectLastBlock(result);
 
  
 } 

 insert_block(block) {
 this.con.connect(function(err) {
    if (err) throw err;    
    var sql = "INSERT INTO block VALUES ? ";
    me.con.query(sql, block, function (err, result) {
      if (err) throw err;
      console.log("1 record inserted");
    });
    
  });
 }

 selectLastBlock(res) {
  var me = this;
  this.con.connect(function(err) {
    if (err) throw err;
    me.con.query("SELECT * FROM block ORDER BY block_index LIMIT 1", function (err, result, fields) {
      if (err) throw err;
      var block = {}
      if(result.length ==0) {
         block = {
          block_index : 0,
          block_timestamp : Date.now(),
          block_data : res,
          block_prevhash : '0'
        }

        block = {
          block_hash :me.hash_block(block)
        }
      }else{
         block = {
          block_index : result.length + 1,
          block_timestamp : Date.now(),
          block_data : res,
          block_prevhash : result[0].block_prevhash,
          block_hash : me.hash_block(block)
        }
      }

      me.insert_block(block);
    });
  });
 }

}
module.exports = DbConnection