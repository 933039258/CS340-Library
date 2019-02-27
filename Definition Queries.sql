

CREATE TABLE `books` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `isbn` bigint NOT NULL,
        `title` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


CREATE TABLE `authors` (
        `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


CREATE TABLE `genres` (
        `id` int NOT NULL AUTO_INCREMENT,
        `name` varchar(255) UNIQUE NOT NULL,
        PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `users` (
        `id` int NOT NULL AUTO_INCREMENT,
        `fname` varchar(255) NOT NULL,
        `lname` varchar(255) NOT NULL,
        `join_date` datetime NOT NULL,
        PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


CREATE TABLE `books_authors` (
        `isbn` bigint NOT NULL,
        `author_id` int,
		PRIMARY KEY (`isbn`, `author_id`),
        CONSTRAINT fk_books_authors_author_id FOREIGN KEY (`author_id`) REFERENCES `authors`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


CREATE TABLE `books_genres` (
        `isbn` bigint NOT NULL,
        `genre_id` int NOT NULL,
        PRIMARY KEY (`isbn`, `genre_id`),
        CONSTRAINT fk_books_genres_genre_id FOREIGN KEY (`genre_id`) REFERENCES `genres`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;



CREATE TABLE `rentals` (
        `id` int NOT NULL AUTO_INCREMENT,
        `book_id` int NOT NULL,
        `user_id` int NOT NULL,
        `date_out` datetime NOT NULL,
        `date_in` datetime DEFAULT NULL,
        PRIMARY KEY (`id`),
        CONSTRAINT fk_rentals_book_id 
        FOREIGN KEY (`book_id`) REFERENCES `books`(`id`),
        CONSTRAINT fk_rentals_user_id 
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;





/*
IMPORTANT
We need a CHECK constraint for the rentals table that prevents multiple users from renting out the same book. Unfortunately, the version of MariaDB we are using in the course does not support the CHECK constraint. There is a Piazza post about this ('CHECKs and their associated functions not being incorporated on source') that we need to follow. If we cannot use CHECK, then we will not be able to keep historical data on rentals, which means we need to scrap some of our design.
*/


/* One possible solution to lack of checks in MariaDB version:
DELIMITER $$
-- before inserting new id
DROP TRIGGER IF EXISTS before_insert_id$$
CREATE TRIGGER before_insert_id
    BEFORE INSERT ON test FOR EACH ROW
    BEGIN
        -- condition to check
        IF NEW.id < 0 THEN
            -- hack to solve absence of SIGNAL/prepared statements in triggers
            UPDATE `Error: invalid_id_test` SET x=1;
        END IF;
    END$$


DELIMITER ;
*/




INSERT INTO books (isbn, title, author) VALUES
(9780547928227, 'The Hobbit'),
(9780553103540, 'A Game of Thrones'),
(9780385294164, 'Galapagos'),
(9780786222728, 'Harry Potter and the Sorcerers Stone'),
(9781943153329, 'Assembly Programming and Computer Architecture for Software Engineers')
;


INSERT INTO authors (name) VALUES
    ('J. R. R. Tolkien'),
    ('George R. R. Martin'),
    ('Kurt Vonnegut'),
    ('J. K. Rowling'),
    ('Brian R. Hall'),
    ('Kevin J. Slonka')
;


INSERT INTO genres (name) VALUES
        ('Fantasy'),
        ('Sci-Fi'),
        ('Education')
; 


INSERT INTO books_authors (isbn, author_id) VALUES
        (9780547928227,1),
        (9780553103540,2),
        (9780385294164,3),
        (9780786222728,4),
        (9781943153329,5),
        (9781943153329,6)
;


INSERT INTO books_genres (isbn, genre_id) VALUES
        (9780547928227,1),
        (9780553103540,1),
        (9780385294164,2),
        (9780786222728,1),
        (9781943153329,3)
;


INSERT INTO users (fname, lname, join_date) VALUES
        ('Tyson', 'Reitenbaugh', '2019-01-01'),
        ('Peng', 'Zhang', '2019-01-01'),
        ('John', 'Smith', '2019-01-24')
;


INSERT INTO rentals (user_id, book_id, date_out) VALUES
(1, 1, '2019-01-02 08:59:30'),
(1, 2, '2019-01-02 08:59:59'),
(2, 3, '2019-01-03 11:30:00'),
(3, 5, '2019-02-07 10:32:01')
;