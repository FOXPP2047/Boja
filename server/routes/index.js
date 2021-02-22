module.exports = app => {
    const controller = require("../controllers/controller.js");

    app.post("/users", controller.createUser);
    app.post("/ratings", controller.create);

    app.get("/ratings", controller.findAllRating);
    app.get("/movies", controller.findAllMovie);
    app.get("/ratings/:r_Id", controller.findOneRating);
    app.get("/ratings-max", controller.findMaxIdRating);

    app.delete("/ratings/:r_Id", controller.delete);
}