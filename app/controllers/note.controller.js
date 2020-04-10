const Note = require('../models/note.model.js');
const CacheService =require('../caches/cache.service');
const ttl = 3000; // cache for 3000 sec 
const cache = new CacheService(ttl);
var  loglevelnext= require("loglevelnext");

exports.create = (req, res) => {
    // Validate request
    if(!req.body.content) {
        console.warn( (err.message || " worker's name  can not be empty"));
        return res.status(400).send({
            message: "worker's name  can not be empty"
        });
    }

    // Create a worker
    const note = new Note({

        title: req.body.title , 
        content: req.body.content,
        age:req.body.age

    });

    console.info("creating new node");

    // Save worker in the database
    note.save()
    .then(data => {
        const key=note.id;//extract key
        console.info("key is"+key);
        cache.set( key,note);//add newly created note to cache
        console.info("worker added successfully to cache");
        //see the cache
        console.info(cache.getStats());
        res.send(data);
       console.info("worker created successfully");
        
    }).catch(err => {
        console.error((err.message || "Some error occurred while creating the worker."));
        res.status(500).send({
            message: err.message || "Some error occurred while creating the worker."
            
        });
    });
};



// Retrieve and return all workers from the database.
exports.findAll = (req, res) => {
    Note.find() 
    .then(notes => {
        res.send(notes);
    }).catch(err => {
         console.error(err.message || "Some error occurred while creating the worker.");
    
       res.status(500).send({
      message: err.message || "Some error occurred while retrieving workers."
      
        });
    
});
};


// Find a single worker with a noteId
//first search in cache and then in the database
exports.findOne = (req, res) => {
    const key=req.params.noteId;
	 const content=cache.get(key);
     if(content)
     {
       
        console.info("the worker found successfully in cache");
        console.info(cache.getStats());
         res.send(content);
     } 
     else{
    Note.findById(req.params.noteId)
    .then(note => {
        if(!note) {
            console.error(err.message || ("worker not found with id " + req.params.noteId));
            return res.status(404).send({
                message: "worker not found with id " + req.params.noteId
                 
            });            
        }
        console.info(cache.getStats());
        res.send(note);
    }).catch(err => {
            console.error(err.message || ("worker not found with id " + req.params.noteId));
            return res.status(404).send({
                message: "worker not found with id " + req.params.noteId
               
        });
        console.error(err.message || (" Error retrieving worker  with id " + req.params.noteId));
    });
};
};

// Update a  worker identified by the noteId in the request
exports.update = (req, res) => {
    // Validate Request
    if(!req.body.content) {
           console.warn(err.message || "worker's name can not be empty");
        return res.status(400).send({
            message: "worker's name can not be empty"
         
        });
    }


    // Find  worker and update it with the request body
    Note.findByIdAndUpdate(req.params.noteId, {
        title: req.body.title ,
        content: req.body.content,
         age:req.body.age
    }, {new: true})
    .then(note => {
       console.log( "worker is "+note);
        if(!note) {
             console.error(err.message || ("worker not found with id " + req.params.noteId));
            return res.status(404).send({
                message: "worker not found with id " + req.params.noteId
                
            });
        }
                //  then search for worker in the cache
         const value = cache.del( req.params.noteId);
         cache.set(req.params.noteId,value);
         console.log(cache.getStats());
        console.info("after updating,deleted "+value+"worker successfully from cache");
        res.send(note);
       
    }).catch(err => {
            console.log(err.message || ("worker not found with id " + req.params.noteId));     
            return res.status(404).send({
                message: "worker not found with id " + req.params.noteId
          });                
        }
       
    );
       
    
};

// Delete a worker with the specified noteId in the request
exports.delete = (req, res) => {
    Note.findByIdAndRemove(req.params.noteId)
    .then(note => {
        if(!note) {
            console.log(err.message || (" workernot found  with id " + req.params.noteId));
          
            return res.status(404).send({
                message: "worker not found with id " + req.params.noteId
            });
        }
        const value = cache.del( req.params.noteId);
       console.log(cache.getStats());
        console.log("after delelting,deleted "+value+"worker successfully from cache");
        res.send({message: "worker deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            console.error(err.message || ("worker not found with id " + req.params.noteId));            
            return res.status(404).send({
                message: "worker not found with id " + req.params.noteId
            });                
        }
        console.error(err.message || ("worker not delete worker  with id " + req.params.noteId));
        return res.status(500).send({
            message: "Could not delete worker with id " + req.params.noteId
        });
    });
};