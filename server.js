const http = require('http');
const {app} =require('./app');
const port = 8080;


const server = http.createServer(app);
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});