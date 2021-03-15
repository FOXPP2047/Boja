const {Ratings, Movies, Users} = require("../db/model.js");
const sql = require("../db/db.js");
const fs = require("fs");
const json2csv = require("json2csv");
const csvParser = require("csv-parser");
const request = require("request-promise");

exports.getRecoMovies = (req, res) => {
  const options = {
    method : "POST",
    uri : "http://localhost:8501/v1/models/reco_movie_lens:predict",
    body : {
      "instances" : [req.query.user_id]
    },
    json : true,
  }

  request(options).then(function (response) {
    const recoMoviesId = [];
    const obj = response["predictions"][0]["output_2"];

    for(let i = 0; i < obj.length; ++i) {
      recoMoviesId.push(parseInt(obj[i]));
    }
    const resultObj = [];

    for(let i = 0; i < recoMoviesId.length; ++i) {
      sql.query("SELECT * FROM Movies WHERE movie_id = ?", recoMoviesId[i], async (err, result) => {
        //console.log(recoMoviesId[i]);
        if(err) {
          console.log("err : ", err);
          return;
        }
        let movieData = await result;
        movieData = JSON.parse(JSON.stringify(movieData))[0];
        
        if(movieData != null) {
          resultObj.push(movieData);
        }
        
        if(i === recoMoviesId.length - 1) {
          res.status(200).send(resultObj);
        }
      });
    }
  })
  .catch(function (err) {
    console.log(err);
  })
}

const fieldData = ["userId", "movieId", "rating", "timestamp"];

exports.updateRating = (req, res) => {
  const now = new Date();
  const userId = req.query.user_id;
  let likemovieIds, hatemovieIds;

  if(req.query.movie_id_like) {
    likemovieIds = req.query.movie_id_like;
  }

  if(req.query.movie_id_hate) {
    hatemovieIds = req.query.movie_id_hate;
  }
  const time = Math.round(now.getTime() / 1000);
  const appendDatas = [];

  if(likemovieIds > 0) {
    for(let i = 0; i < likemovieIds.length; ++i) {
      const appendData = {
        userId : parseInt(userId),
        movieId : parseInt(likemovieIds[i]),
        rating : 5,
        timestamp : time
      };
      appendDatas.push(appendData);
    }
  } 

  if(hatemovieIds > 0) {
    for(let i = 0; i < hatemovieIds.length; ++i) {
      const appendData = {
        userId : parseInt(userId),
        movieId : parseInt(hatemovieIds[i]),
        rating : 1,
        timestamp : time
      };
      appendDatas.push(appendData);
    }
  } 
  
  for(let i = 0; i < appendDatas.length; ++i) {
    fs.stat("../client/ml-100k/ratings.csv", function(err, stat) {
      if(!err) {
        const csv = json2csv.parse(appendDatas[i], { header : false }) + '\r\n';
      
        fs.appendFile("../client/ml-100k/ratings.csv", csv, function(err) {
          if(err) {
            console.log(err);
            throw err;
          } else {
            if(i == appendDatas.length - 1) {
              console.log("Success");
              res.status(200).send();
            }
          }
        });
      }
    });
  }
  // const newRate = new Ratings({
  //     user_id : req.query.user_id,
  //     movie_id : req.query.movie_id,
  //     rating : req.query.rating,
  //     time_epoch : Math.round(now.getTime() / 1000)
  // });

  // const appendData = {
  //   userId : newRate.user_id,
  //   movieId : newRate.movie_id,
  //   rating : newRate.rating,
  //   timestamp : newRate.time_epoch
  // };

  // const toCSV = {
  //   data : appendData,
  //   fields : fieldData,
  //   header : false,
  // }
  // fs.stat("../client/ml-100k/ratings.csv", function(err, stat) {
  //   if(!err) {
  //     const csv = json2csv.parse(appendData, { header : false }) + '\r\n';
      
  //     fs.appendFile("../client/ml-100k/ratings.csv", csv, function(err) {
  //       if(err) {
  //         console.log(err);
  //         throw err;
  //       } else {
  //         console.log("Success");
  //         res.status(200).send();
  //       }
  //     });
  //   }
  // });
}

exports.signIn = (req, res) => {
  if(!req.query) {
    res.status(404).send({
      message: "Content can't be empty!"
    });
  }

  const {username, passcode} = req.query;
  // console.log(username, passcode);
  sql.query("SELECT * FROM Users WHERE username = ?", username, async(err, result) => {
    if(err) {
      console.log("err : ", err);
      return;
    }
    const userData = await result;
    const userObject = JSON.parse(JSON.stringify(userData))[0];

    if(typeof userObject === 'undefined') {
      console.log("Cant Find Username");
      res.status(409).send({ message: "Username is not existed!" });
    }
    if (userObject.passcode === passcode) {
      res.status(200).send({user_id : result[0].user_id});
    } else {
      console.log("Wrong Passcode");
      res.status(401).send({ message: "Passcode is wrong!" });
    }
  });
}

exports.startRecommend = (req, res) => {
  if(!req.query) {
    res.status(404).send({ message: "Content can't be empty!" });
  }

  const coldData = [];
  fs.createReadStream("../client/ml-100k/ColdStartProblem.csv", { encoding: 'utf8' })
  .pipe(csvParser())
  .on('data', (row) => {
    coldData.push(row);
  })
  .on('end', () => {
    console.log("Successfully Processed");
    //console.log(coldData);
    const finalResult = [];
    for(let i = 0; i < 10; ++i) {
      finalResult.push(coldData[i]);
    }
    res.status(200).send(finalResult);
  })
}

exports.createUser = (req, res) => {
  if(!req.query) {
    res.status(404).send({
      message: "Content can't be empty!"
    });
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

