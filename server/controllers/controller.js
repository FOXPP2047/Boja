const {Ratings, Movies, Users} = require("../db/model.js");
const sql = require("../db/db.js");

exports.createUser = (req, res) => {
  if(!req.query) {
    res.status(404).send({
      message: "Content can't be empty!"
    });
    console.log("asdasd");
  }
  const {username, passcode} = req.query;
  console.log(username, passcode);

  sql.query("SELECT user_id FROM Users ORDER BY user_id DESC LIMIT 1", async(err, result) => {
    if(err) {
        console.log("err : ", err);
        return;
    }
    const maxData = await result;
    const maxUserId = JSON.parse(JSON.stringify(maxData))[0].user_id;
    
    const newUser = new Users({
      user_id : Number(maxUserId) + 1,
      username : username,
      passcode : passcode
    });

    Users.createUser(newUser, (err, data) => {
      if (err) {
        res.status(500).send({
          message:
              err.message || "Some error occurred while creating the newUser."
          });
      } else {
        res.status(200).send(data);
      }
    });
  });
}

exports.findAllUsers = (req, res) => {
  Users.getAllUsers((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving Users."
      });
    else res.send(data);
  });
};


//localhost:3000/users?username=test&passcode=1234
// Delete all User
exports.deleteUsers = (req, res) => {
  Users.removeAllUser((err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Customer with id ${req.params.r_Id}.`
        });
      } else {
        res.status(500).send({
          message: "Could not delete Customer with id " + req.params.r_Id
        });
      }
    } else res.send({ message: `Customer was deleted successfully!` });
  });
};

// Create and Save a new Customer
exports.create = (req, res) => {
    // Validate request
    
    if (!req.body) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
    }
  
    const now = new Date();

    // Create a Customer
    const newRate = new Ratings({
        user_id : req.body.user_id,
        movie_id : req.body.movie_id,
        rating : req.body.rating,
        time_epoch : Math.round(now.getTime() / 1000)
    });
  
    // Save Customer in the database
    Ratings.create(newRate, (err, data) => {
        if (err)
            res.status(500).send({
            message:
                err.message || "Some error occurred while creating the Customer."
            });
        else res.send(data);
    });
};

exports.findAllRating = (req, res) => {
    Ratings.getAll((err, data) => {
      if (err)
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving customers."
        });
      else res.send(data);
    });
};

exports.findMaxIdRating = (req, res) => {
    Ratings.findMaxById((err, data) => {
      if (err) {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving customers."
        });
      }
      else res.send(data);
    });
};

exports.findOneRating = (req, res) => {
  Ratings.findById(req.params.r_Id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Customer with id ${req.params.r_Id}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Customer with id " + req.params.r_Id
        });
      }
    } else res.send(data);
  });
};

exports.findAllMovie = (req, res) => {
  Movies.getAll((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving customers."
      });
    else res.send(data);
  });
};

// Delete a Customer with the specified customerId in the request
exports.delete = (req, res) => {
  Ratings.remove(req.params.r_Id, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Customer with id ${req.params.r_Id}.`
        });
      } else {
        res.status(500).send({
          message: "Could not delete Customer with id " + req.params.r_Id
        });
      }
    } else res.send({ message: `Customer was deleted successfully!` });
  });
};

