const http = require('http');
const { parse } = require('querystring');
const DbConnection = require('./DbConnection.js');

var connection = new DbConnection();

const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
        collectRequestData(req, result => {
            console.log(result);
            connection.insert(result);
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