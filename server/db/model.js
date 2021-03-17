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

const Users = function(r) {
    this.user_id = r.user_id;
    this.username = r.username;
    this.passcode = r.passcode;
}

Users.createUser = (newUser, result) => {
    sql.query(`INSERT INTO Users SET ?`, newUser, (err, res) => {
        if(err) {
            console.log("error : ", err);
            result(err, null);
            return;
        }

        console.log("created newUser: ", { ...newUser });
        result(null, { ...newUser });
    });
}

Users.getAllUsers = result => {
    sql.query("SELECT * FROM Users", (err, res) => {
        if(err) {
            console.log("err : ", err);
            result(null, err);
            return;
        }
        
        result(null, res);
    });
}


Users.removeAllUser = result => {
    sql.query("DELETE FROM Users", (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }

        if (res.affectedRows == 0) {
            // not found Customer with the id
            result({ kind: "not_found" }, null);
            return;
        }

        console.log("deleted all Users");
        result(null, res);
    });
};

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
    sql.query(`SELECT * FROM Ratings WHERE user_id = ${r_Id} and rating >= 3.5 ORDER BY time_epoch ASC`, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
  
        if (res.length) {
            //console.log("found r_Id: ", res);
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

Movies.findById = (m_Id, result) => {
    sql.query(`SELECT * FROM Movies WHERE movie_id = ${m_Id}`, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
        }
  
        if (res.length) {
            //console.log("found m_Id: ", res);
            result(null, res);
            return;
        }
  
        // not found Customer with the id
        result({ kind: "not_found" }, null);
    });
}
Ratings.remove = (id, result) => {
    sql.query("DELETE FROM Ratings WHERE user_id = ?", id, (err, res) => {
        if (err) {
            console.log("error: ", err);
            result(null, err);
            return;
        }

        if (res.affectedRows == 0) {
            // not found Customer with the id
            result({ kind: "not_found" }, null);
            return;
        }

        console.log("deleted customer with id: ", id);
        result(null, res);
    });
};

module.exports = {
    Ratings,
    Movies,
    Users
}
