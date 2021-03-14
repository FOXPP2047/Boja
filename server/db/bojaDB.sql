create database if not exists bojaDB;
use bojaDB;

/*ALTER USER 'root'@'localhost' IDENTIFIED BY 'bojapassowrd12'; 
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'bojapassowrd12';*/

drop table Movies;
drop table Ratings;
drop table Users;

create table if not exists Movies(
	movie_id int not null primary key,
    title varchar(200),
    genres varchar(100)
);

create table if not exists Ratings(
	user_id int not null,
    movie_id int not null,
    rating float,
    time_epoch int(11)
);

create table if not exists Users(
	user_id int not null primary key,
    username varchar(10) UNIQUE,
    passcode varchar(20)
);

/*"C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\Laptop.csv"*/
/*load data infile "C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\movies.csv"*/
load data infile "../var/lib/mysql-files/movies.csv"
into table Movies
FIELDS TERMINATED BY ","
ENCLOSED BY '"'
LINES TERMINATED BY "\n"
IGNORE 1 ROWS;

/*load data infile "C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\ratings.csv"*/
load data infile "../var/lib/mysql-files/ratings.csv"
into table Ratings
FIELDS TERMINATED BY ","
ENCLOSED BY '"'
LINES TERMINATED BY "\n"
IGNORE 1 ROWS;

SELECT user_id FROM Ratings ORDER BY user_id DESC LIMIT 1
