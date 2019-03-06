-- Data Manipulation Queries


-- Add new book to the library
        -- TODO: Support an array of genre and author inputs
        -- First inserts the isbn and title into books table
        -- Then checks if the author exists in the library
                -- If not, add it
        -- Then checks if the isbn is connected to the author
                -- If not, add the relationship
        -- Then checks if the genre exists in the library
                -- If not, add it
        -- Then checks if the isbn is connected to the genre
                -- If not, add the relationship


INSERT INTO books (isbn, title) VALUES (:isbnInput, :titleInput);


IF NOT EXISTS (SELECT id FROM authors WHERE name = :authorInput) INSERT INTO authors (name) VALUES :authorInput;


IF NOT EXISTS (SELECT (isbn, author_id) FROM books_authors WHERE
        (isbn = :isbnInput) AND
(author_id =
(SELECT id FROM authors WHERE :authorInput = name)))
INSERT INTO books_authors (isbn, author_id) VALUES
(:isbnInput,
(SELECT id FROM authors WHERE :authorInput = name));


IF NOT EXISTS (SELECT name FROM genres WHERE (name = :genreInput)
        INSERT INTO genres (name) VALUES :genreInput;


IF NOT EXISTS (SELECT (isbn, genre_id) FROM books_genres WHERE
(isbn = :isbnInput) AND (genre_id =
(SELECT id FROM genres WHERE name = :genreInput AS gid)))
INSERT INTO books_genres VALUES (:isbnInput, gid);


________________


-- Add new author to the library
        -- Recycles code from “add a new book”


IF NOT EXISTS (SELECT id FROM authors WHERE name = :authorInput) INSERT INTO authors (name) VALUES :authorInput;


-- Add new genre to the library
        -- Recycles code from “add a new book”


IF NOT EXISTS (SELECT name FROM genres WHERE (name = :genreInput)
        INSERT INTO genres VALUES :genreInput;


-- Add author to a book
        -- Recycles code from “add a new book”


IF NOT EXISTS (SELECT id FROM authors WHERE name = :authorInput) INSERT INTO authors (name) VALUES :authorInput;


IF NOT EXISTS (SELECT (isbn, author_id) FROM books_authors WHERE
        (isbn = :isbnInput) AND
(author_id =
(SELECT id FROM authors WHERE :authorInput = name))
INSERT INTO books_authors (isbn, author_id) VALUES
(:isbnInput,
(SELECT id FROM authors WHERE :authorInput = name));


-- Add genre to a book
        -- Recycles code from “add a new book”


IF NOT EXISTS (SELECT name FROM genres WHERE (name = :genreInput)
        INSERT INTO genres (name) VALUES :genreInput;


IF NOT EXISTS (SELECT (isbn, genre_id) FROM books_genres WHERE
(isbn = :isbnInput) AND (genre_id =
(SELECT id FROM genres WHERE name = :genreInput AS gid)))
INSERT INTO books_genres VALUES (:isbnInput, gid);


________________


-- Remove book from the library
        -- First deletes any rental connected to the book
        -- Then deletes the book


IF EXISTS (SELECT id FROM rentals WHERE
        (book_id = :book_idInput) AND (user_id = :user_idInput))
        DELETE FROM rentals WHERE
(book_id = :book_idInput) ;


IF EXISTS (SELECT id FROM books WHERE (id = :book_idInput)
        DELETE FROM books WHERE (id = :book_idInput);


-- Add user to the the library


INSERT INTO users (fname, lname, join_date)
        VALUES (:fnameInput, :lnameInput, :join_dateInput);


-- Delete user from the library
        -- TODO: Throw an error message if a rental is connected to user
        -- First checks if the user exists
                -- If so, checks if any rentals connected to user
                        -- If so, DOES NOTHING
                        -- If not, deletes the user


IF EXISTS (SELECT id FROM users WHERE (id = :idInput))
        IF NOT EXISTS (SELECT * FROM rentals WHERE user_id = :idInput)
        DELETE FROM users WHERE (id = :idInput);


________________


-- Rent out book from the library
        -- TODO: Throw an error message if book is unavailable
        -- TODO: Allow user to input isbn instead of book_id
        -- First checks if the book exists
                -- If so, checks if the user exists
-- If so, checks if the book is tied to a rental
                                -- If not, creates the rental


IF EXISTS (SELECT id FROM books WHERE (id = :book_idInput))
IF EXISTS (SELECT id FROM users WHERE
(id = :user_idInput))
IF NOT EXISTS (SELECT id FROM rentals WHERE
        (book_id = :book_idInput)
INSERT INTO rentals (book_id, user_id, date_out) VALUES
        (:book_idInput, :user_idInput, :date_outInput);


-- Return book to the library
        -- Checks if rental exists
                -- If so, returns the book by adding date_in


IF EXISTS (SELECT id FROM rentals WHERE
        (rentals.book_id = :book_idInput) AND
        (rentals.user_id = :user_idInput))
        UPDATE rentals SET (date_in = :date_inInput)
WHERE (rentals.book_id = :book_idInput) AND
(rentals.user_id = :user_idInput);


-- Display all users in the library


SELECT * FROM users;


________________


-- Display all books registered in the library
-- TODO: Combine rows with multiple genres or authors such that the id, title, and isbn is not repeated. Also attempt to achieve this with author and genre when not new information. This change needs to apply to all book-related queries.


SELECT b.id, b.title, a.name AS author, g.name AS genre, b.isbn
FROM books b
INNER JOIN books_authors ba ON (b.isbn = ba.isbn)
INNER JOIN authors a ON (ba.author_id = a.id)
INNER JOIN books_genres bg ON (b.isbn = bg.isbn)
INNER JOIN genres g ON (bg.genre_id = g.id);


-- Display all books available in the library


SELECT b.id, b.title, a.name AS author, g.name AS genre, b.isbn
FROM books b
LEFT JOIN rentals r ON (r.book_id = b.id)
INNER JOIN books_authors ba ON (b.isbn = ba.isbn)
INNER JOIN authors a ON (ba.author_id = a.id)
INNER JOIN books_genres bg ON (b.isbn = bg.isbn)
INNER JOIN genres g ON (bg.genre_id = g.id)
WHERE (r.date_in IS NOT NULL) OR NOT EXISTS
(SELECT * FROM rentals WHERE (r.book_id = b.id));


-- Display all books checked out from the library
-- Returns all rentals without a return date


SELECT b.id, b.title, a.name AS author, g.name AS genre, b.isbn
FROM books b
INNER JOIN books_authors ba ON (b.isbn = ba.isbn)
INNER JOIN authors a ON (ba.author_id = a.id)
INNER JOIN books_genres bg ON (b.isbn = bg.isbn)
INNER JOIN genres g ON (bg.genre_id = g.id)
INNER JOIN rentals r ON (r.book_id = b.id)
WHERE (r.date_out IS NOT NULL);