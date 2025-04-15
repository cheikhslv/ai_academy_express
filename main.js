const express = require("express");
const layouts = require("express-ejs-layouts");
const homeController = require("./controllers/homeController");
const errorController = require("./controllers/errorController");
const app = express();
const session = require("express-session");
const validationController = require("./controllers/validationController");
const mongoose = require("mongoose"); // Ajout de Mongoose
const subscribersController = require("./controllers/subscribersController");
const Subscriber = require("./models/subscriber");



// Configuration de la connexion à MongoDB
mongoose.connect("mongodb://localhost:27017/ai_academy",{ useNewUrlParser: true });
const db = mongoose.connection;
db.once("open", () => {
console.log("Connexion réussie à MongoDB en utilisant Mongoose!");
});


// Définir le port
app.set("port", process.env.PORT || 3000);
// Configuration d'EJS comme moteur de template
app.set("view engine", "ejs");
app.use(layouts);
// Middleware pour traiter les données des formulaires
app.use(
express.urlencoded({
extended: false
})
);
app.use(express.json());
// Middleware pour gérer les sessions
app.use(session({
    secret: "aiacademy_secret_key",
    resave: false,
    saveUninitialized: true
  }));
// Middleware pour rendre le message disponible à toutes les vues
app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
  });  
// Servir les fichiers statiques
app.use(express.static("public"));
// Définir les routes
app.get("/", homeController.index);
app.get("/about", homeController.about);
app.get("/courses", homeController.courses);
app.get("/contact", homeController.contact);
app.post("/contact", validationController.validateContact, homeController.processContact);
app.get('/faq', (req, res) => {
    res.render('faq', { pageTitle: 'FAQ' });
  });

  
// Routes pour les abonnés
app.get("/subscribers", subscribersController.getAllSubscribers);
app.get("/subscribers/new", subscribersController.getSubscriptionPage);
app.post("/subscribers/create", subscribersController.saveSubscriber);
app.get("/subscribers/:id", subscribersController.show);
  
//Route pour la suppression d'abonne
app.post("/subscribers/:id/delete", subscribersController.deleteSubscriber);

//Route pour la modification d'abonne
app.get("/subscribers/:id/edit", subscribersController.editSubscriber);
app.post("/subscribers/:id/update", subscribersController.updateSubscriber);

//Route pour le filtre de recherche
app.get("/subscribers", async (req, res) => {
  const { name, zipCode } = req.query;
  let query = {};

  if (name) query.name = new RegExp(name, "i");
  if (zipCode) query.zipCode = zipCode;

  const subscribers = await Subscriber.find(query);
  res.render("subscribers/index", {
    subscribers,
    pageTitle: "Liste des abonnés"
  });
});

  
// Gestion des erreurs
app.use(errorController.pageNotFoundError);
app.use(errorController.internalServerError);
// Démarrer le serveur
app.listen(app.get("port"), () => {
console.log(`Le serveur a démarré et écoute sur le port: ${app.get("port")}`);
console.log(`Serveur accessible à l'adresse: http://localhost:${app.get("port")}`);
});