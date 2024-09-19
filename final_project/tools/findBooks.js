let books = require("./booksdb");

const getBookByISBN = (isbn) => {
    if (Object.hasOwn(books, isbn)) {
         return books[isbn];
    }
    return null;
}

module.exports.getBookByISBN = getBookByISBN;