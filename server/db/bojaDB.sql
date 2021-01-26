create database if not exists bojaDB;
use bojaDB;

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
    username varchar(10),
    passcode varchar(20)
);

/*"C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\Laptop.csv"*/
load data infile "C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\movies.csv"
into table Movies
FIELDS TERMINATED BY ","
ENCLOSED BY '"'
LINES TERMINATED BY "\n"
IGNORE 1 ROWS;

load data infile "C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Uploads\\ratings.csv"
into table Ratings
FIELDS TERMINATED BY ","
ENCLOSED BY '"'
LINES TERMINATED BY "\n"
IGNORE 1 ROWS;

select *
from Ratings;
