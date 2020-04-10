let express=require('express');
let bodyParser = require('body-parser');
let mongoose = require('mongoose');
let app=express();
const NodeCache = require( "node-cache" );
const myCache = new NodeCache();

app.use(bodyParser.urlencoded({
   extended: true
}));
app.use(bodyParser.json());

// Require Notes routes
require('./app/routes/note.routes.js')(app);

const dbConfig = require('./config/database.config.js');

mongoose.Promise = global.Promise;
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);
// Connecting to the database
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");    
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});




var port=process.env.PORT || 8080;
app.get('/',function(req,res){
	res.send("hellooo worldd");
});
app.listen(port,function(){
	console.log(`server is listening on port: ${port}`);
});