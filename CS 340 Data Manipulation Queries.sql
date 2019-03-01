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


INSERT INTO books (isbn, title) VALUES
        (#isbn_input, #title_input);


IF NOT EXISTS (SELECT id FROM authors WHERE name = #author_input) INSERT INTO authors (name) VALUES #author_input;


IF NOT EXISTS (SELECT (isbn, author_id) FROM books_authors WHERE
        (isbn = #isbn_input) AND
(author_id =
(SELECT id FROM authors WHERE #author_input = name)))
INSERT INTO books_authors (isbn, author_id) VALUES
(#isbn_input,
(SELECT id FROM authors WHERE #author_input = name));


IF NOT EXISTS (SELECT name FROM genres WHERE (name = #genre_input)
        INSERT INTO genres (name) VALUES #genre_input;


IF NOT EXISTS (SELECT (isbn, genre_id) FROM books_genres WHERE
(isbn = #isbn_input) AND (genre_id =
(SELECT id FROM genres WHERE name = #genre_input AS gid)))
INSERT INTO books_genres VALUES (#isbn_input, gid);


________________


-- Add new author to the library
        -- Recycles code from “add a new book”


IF NOT EXISTS (SELECT id FROM authors WHERE name = #author_input) INSERT INTO authors (name) VALUES #author_input;


-- Add new genre to the library
        -- Recycles code from “add a new book”


IF NOT EXISTS (SELECT name FROM genres WHERE (name = #genre_input)
        INSERT INTO genres VALUES #genre_input;


-- Add author to a book
        -- Recycles code from “add a new book”


IF NOT EXISTS (SELECT id FROM authors WHERE name = #author_input) INSERT INTO authors (name) VALUES #author_input;


IF NOT EXISTS (SELECT (isbn, author_id) FROM books_authors WHERE
        (isbn = #isbn_input) AND
(author_id =
(SELECT id FROM authors WHERE #author_input = name))
INSERT INTO books_authors (isbn, author_id) VALUES
(#isbn_input,
(SELECT id FROM authors WHERE #author_input = name));


-- Add genre to a book
        -- Recycles code from “add a new book”


IF NOT EXISTS (SELECT name FROM genres WHERE (name = #genre_input)
        INSERT INTO genres (name) VALUES #genre_input;


IF NOT EXISTS (SELECT (isbn, genre_id) FROM books_genres WHERE
(isbn = #isbn_input) AND (genre_id =
(SELECT id FROM genres WHERE name = #genre_input AS gid)))
INSERT INTO books_genres VALUES (#isbn_input, gid);


________________


-- Remove book from the library
        -- First deletes any rental connected to the book
        -- Then deletes the book


IF EXISTS (SELECT id FROM rentals WHERE
        (book_id = #book_id_input) AND (user_id = #user_id_input))
        DELETE FROM rentals WHERE
(book_id = #book_id_input) ;


IF EXISTS (SELECT id FROM books WHERE (id = #book_id_input)
        DELETE FROM books WHERE (id = #book_id_input);


-- Add user to the the library


INSERT INTO users (fname, lname, join_date)
        VALUES (#fname_input, #lname_input, #join_date_input);


-- Delete user from the library
        -- TODO: Throw an error message if a rental is connected to user
        -- First checks if the user exists
                -- If so, checks if any rentals connected to user
                        -- If so, DOES NOTHING
                        -- If not, deletes the user


IF EXISTS (SELECT id FROM users WHERE (id = #id_input))
        IF NOT EXISTS (SELECT * FROM rentals WHERE user_id = #id_input)
        DELETE FROM users WHERE (id = #id_input);


________________


-- Rent out book from the library
        -- TODO: Throw an error message if book is unavailable
        -- TODO: Allow user to input isbn instead of book_id
        -- First checks if the book exists
                -- If so, checks if the user exists
-- If so, checks if the book is tied to a rental
                                -- If not, creates the rental


IF EXISTS (SELECT id FROM books WHERE (id = #book_id_input))
IF EXISTS (SELECT id FROM users WHERE
(id = #user_id_input))
IF NOT EXISTS (SELECT id FROM rentals WHERE
        (book_id = #book_id_input)
INSERT INTO rentals (book_id, user_id, date_out) VALUES
        (#book_id_input, #user_id_input, #date_out_input);


-- Return book to the library
        -- Checks if rental exists
                -- If so, returns the book by adding date_in


IF EXISTS (SELECT id FROM rentals WHERE
        (rentals.book_id = #book_id_input) AND
        (rentals.user_id = #user_id_input))
        UPDATE rentals SET (date_in = #date_in_input)
WHERE (rentals.book_id = #book_id_input) AND
(rentals.user_id = #user_id_input);


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