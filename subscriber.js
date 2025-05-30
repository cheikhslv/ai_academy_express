const mongoose = require("mongoose");
const subscriberSchema = mongoose.Schema({
name: {
    type: String,
    required: true
},
email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true
},
zipCode: {
    type: Number,
    min: [10000, "Code postal trop court"],
    max: 99999
}
});
subscriberSchema.methods.getInfo = function() {
    return `Nom: ${this.name} Email: ${this.email} Code Postal: ${this.zipCode}`;
};
subscriberSchema.methods.findLocalSubscribers = function() {
    return this.model("Subscriber")
    .find({ zipCode: this.zipCode })
    .exec();
};
module.exports = mongoose.model("Subscriber", subscriberSchema);