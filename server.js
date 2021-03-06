// server.js

// BASE SETUP
// ==============================================

var express 	= require('express');
var app     	= express();
var port    	= process.env.PORT || 8080;
var bodyParser  = require('body-parser');
var mongoose 	= require('mongoose');


// MONGODB
// ==============================================
var db_lnk = 'mongodb://localhost:27017/Amazop';
var db = mongoose.createConnection(db_lnk, function(err, res) {
    if(err)
		throw err;
    console.log('Connected to Database');
});

// Load models
var products_schema = mongoose.Schema({
    id:                 { type: String, unique: true },
	nombre:     		{ type: String },
	categoria:			{ type: String },
	subtitulo:			{ type: String },
	descripcion:		{ type: String },
	precio:				{ type: String },
	valoracion:			{ type: String },
	ventas:				{ type: String },
	imag:  		    	{ type: String },
});
var users_schema = new mongoose.Schema({
	username:	  { type: String, unique: true },
	name_:     	  { type: String },
	apellido:     { type: String },
	gender:       { type: Boolean },
	email:        { type: String, unique: true },
	password:     { type: String },
    info:         { type: String },
    cesta:        { type: [String] },
});

var user = db.model('user', users_schema);
var Product = db.model('product', products_schema);

//Configuracion de Express
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// POST
// ==============================================
app.post('/login', function(req, res){
	//User.findOne().where('username', req.body.username).exec(function(err, doc){
	user.findOne({'username' : req.body.username }).exec(function(err, doc){
	    console.log(req.body.username);
		console.log("LogIn");

		if(doc == null){
		    console.log("documento vacio");
		    //console.log(req.body);
			res.send(401);
		}else{
			if(doc.password == undefined){
			    console.log("pass indefinido");
				res.send(401);
			}else if(doc.password == req.body.pass){
			    console.log("correcto");
				res.send(200);
			}else{
			    console.log("que cojones"),
				res.send(401);
			}
		}
	});
});

app.post('/signup', function(req, res){
    console.log("SignUp");

	user.findOne({'username' : req.body.username }).exec(function(err, doc){
		if(doc != null){
			res.send(401);
		}else{
			user.findOne({'email' : req.body.email}).exec(function(err, doc){
				if(doc != null){
					res.send(401);
				}else{
					if((req.body.pass != undefined) && (req.body.pass == req.body.repass)){
						var Usuario = new user({
								username:	  req.body.username,
								name_:		  req.body.name,
								apellido:     req.body.surname,
								info:         req.body.info,
								email:        req.body.email,
                                gender:       req.body.gender,
								password:     req.body.pass
						});
						Usuario.save()
						res.send(200);
					}else{
						res.send(400);
					}
				}
			});
		}
	});
});

app.post('/datos', function(req, res){
	console.log(req.body);
	user.findOne().where('username', req.body.username).exec(function(err, doc){
		console.log(doc);
		if(doc == null){
			res.sendStatus(401);
		}else{
			res.json(doc);
			console.log("estoy enviando");
		}
	});
});
////////////////////////////////
app.post('/buscar', function(req, res){
	//User.findOne().where('username', req.body.username).exec(function(err, doc){
	console.log(req.body);
	var term = new RegExp(req.body.id, 'i');
	Product.find().or([{'nombre' : {$regex: term}} , {'subtitulo' : {$regex: term}}, {'descripcion' : {$regex: term}}, {'id' : {$regex: term}}])
		.exec(function(err, doc){
			console.log("Busqueda");
			console.log(doc);

			if(doc == []){
				console.log("documento vacio");
				//console.log(req.body);
				res.send(401);
			}else{
				console.log("correcto");
				res.send(doc);
			}
	})	;
});

////////////////////////////
app.post('/comparar', function(req, res){
	//User.findOne().where('username', req.body.username).exec(function(err, doc){
	console.log(req.body);
	var term = new RegExp(req.body.id, 'i');
	Product.findOne().or([{'nombre' : {$regex: term}} , {'id' : {$regex: term}}])
		.exec(function(err, doc){
			console.log("Busqueda");
			console.log(doc);

			if(doc == null){
				console.log("documento vacio");
				//console.log(req.body);
				res.send(401);
			}else{
				console.log("correcto");
				res.send(doc);
			}
		});
});

///////////////////////////

app.post('/products', function(req, res){
	//Search on DB
	Product.find().exec(function(err, doc){
		if(doc == null){
			res.sendStatus(401);
		}else{
			res.send(doc);
		}
	});
});

app.post('/categorias', function(req, res){
	//Search on DB
	Product.find().distinct('categoria').exec(function(err, doc){
		if(doc == null){
			res.sendStatus(401);
		}else{
			res.send(doc);
		}
	});
});

app.post('/addCesta', function(req, res){
	user.findOne({'username' : req.body.username}).exec(function(err, doc){
		console.log(req.body);
		if(doc == null){
			res.sendStatus(401);
		}else{
			doc.cesta.addToSet(req.body.product);
			doc.save();
			res.sendStatus(200);
		}
	});
});

app.post('/muestraCesta', function(req, res){
	user.findOne({'username' : req.body.username}).exec(function(err, doc){
		if(doc == null){
			res.sendStatus(401);
		}else{
			Product.find({'id' : {$in : doc.cesta}}).exec(function(err2, doc2){
				if(doc2 == null){
					res.sendStatus(401);
				}else{
					res.send(doc2);
				}
			});
		}
	});
});

// ============================================= //

app.use(express.static(__dirname + '/public')); //Si no encuentras algo, estara en Public

// START THE SERVER
// ==============================================
app.listen(port); //app.listen(port,host); Lanzamos el server con un host, deberia funcionar en red local!!
console.log('Magic happens on port ' + port);
