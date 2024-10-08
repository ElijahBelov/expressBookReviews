const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("../tools/booksdb.js");
let getBookByISBN = require("../tools/findBooks.js").getBookByISBN;
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
    for (let user of Object.values(users)) {
        if (user.username === username) {
            return false;
        }
    }
    return true;
}

const authenticatedUser = (username, password) => { //returns boolean
    //check if username and password match the one we have in records.
    let validUsers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    return validUsers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', {expiresIn: 60 * 60});

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(401).json({message: "Invalid Login. Check username and password"});
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    let book = getBookByISBN(req.params.isbn);
    let user = req.session.authorization.username;
    if(book === null){
        return res.status(404).json({message: "Book not found"});
    }
    if(Object.hasOwn(book.reviews, user)){
        delete book.reviews[user];
        res.send("Review deleted successfully.");
    } else {
        res.send("Review not found.");
    }

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    let book = getBookByISBN(req.params.isbn);
    let user = req.session.authorization.username;
    if(book === null){
        return res.status(404).json({message: "Book not found"});
    }
    book.reviews[user] = req.body.review;
    res.send("Review posted successfully!");
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
