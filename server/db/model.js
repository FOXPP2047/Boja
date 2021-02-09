const sql = require("./db.js");

const Movies = function(m) {
    this.movie_id = m.movie_id;
    this.title = m.title;
    this.genres = m.genres;
}

const Ratings = function(r) {
    this.user_id = r.user_id;
    this.movie_id = r.movie_id;
    this.rating = r.rating;
    this.time_epoch = r.time_epoch;
}

Ratings.create = (newRating, result) => {
    sql.query("INSERT INTO Ratings SET ?", newRating, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
  
        console.log("created newRating: ", { ...newRating });
        result(null, { ...newRating });
    });
};

  
Ratings.getAll = result => {
    sql.query("SELECT * FROM Ratings", (err, res) => {
        if(err) {
            console.log("err : ", err);
            result(null, err);
            return;
        }
        
        result(null, res);
    });
}

Ratings.findById = (r_Id, result) => {
    sql.query(`SELECT * FROM Ratings WHERE user_id = ${r_Id}`, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
  
        if (res.length) {
            console.log("found r_Id: ", res);
            result(null, res);
            return;
        }
  
        // not found Customer with the id
        result({ kind: "not_found" }, null);
    });
};

Ratings.findMaxById = result => {
    sql.query("SELECT user_id FROM Ratings ORDER BY user_id DESC LIMIT 1", (err, res) => {
        if(err) {
            console.log("err : ", err);
            result(null, err);
            return;
        }
        
        result(null, res);
        return res.user_id;
    });
};

Movies.getAll = result => {
    sql.query("SELECT * FROM Movies", (err, res) => {
        if(err) {
            console.log("err : ", err);
            result(null, err);
            return;
        }
        
        result(null, res);
    })
}

module.exports = {
    Ratings,
    Movies
}