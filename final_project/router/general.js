const express = require('express');
let books = require("../tools/booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
let getBookByISBN = require("../tools/findBooks.js").getBookByISBN;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(400).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const book = getBookByISBN(req.params.isbn);
    if (!(book === null)) {
        res.send(JSON.stringify(book, null, 4));
    } else {
        res.status(404).json({message: "Book not found"});
    }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    let publications = [];
    for (let book of Object.values(books)) {
        if (book.author === req.params.author) {
            publications.push(book);
        }
    }
    if (publications.length < 1) {
        res.status(404).json({message: "Books not found"});
    } else {
        res.send(JSON.stringify(publications, null, 4));
    }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    let titles = [];
    for (let book of Object.values(books)) {
        if (book.title === req.params.title) {
            titles.push(book);
        }
    }
    if (titles.length < 1) {
        res.status(404).json({message: "Books not found"});
    } else {
        res.send(JSON.stringify(titles, null, 4));
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    let reviews = '';
    if (Object.hasOwn(books, req.params.isbn)) {
        reviews = JSON.stringify(books[req.params.isbn].reviews, null, 4);
    } else {
        res.status(404).json({message: "Book not found"});
        return;
    }
    if (reviews.length === 0){
        res.status(404).json({message: "This book has no reviews"});
    } else {
        res.send(reviews);
    }
});

module.exports.general = public_users;
