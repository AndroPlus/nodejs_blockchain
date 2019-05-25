
const sha256 = require('sha256');

class Block {
    constructor(index, timestamp, data, previous_hash) {
      this.index = index;
      this.timestamp = timestamp;
      this.data = data;
      this.previous_hash = previous_hash;
      this.hash = this.hasBlock()
    }

    hasBlock(){
        return sha256(
            this.index + this.timestamp + this.data + this.previous_hash
          );
    }
  }

module.exports = Block