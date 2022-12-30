show databases;
create database igclone;
show tables;
use igclone;

create table user(
id int not null auto_increment primary key,
username varchar(255) not null,
name varchar(255),
email varchar(255) not null,
about text,
createdat timestamp default current_timestamp
);

create table follow(
id int not null auto_increment primary key,
follower int not null,
following int not null,
foreign key (follower) references user(id),
foreign key (following) references user(id)
);

create table post(
id int not null auto_increment primary key,
post text not null,
createdat timestamp default current_timestamp
);

create table likes(
id int not null primary key auto_increment,
postid int not null,
userid int not null,
foreign key(postid) references post(id),
foreign key(userid) references user(id)
);

create table comments(
id int not null primary key auto_increment,
postid int not null,
userid int not null,
comment text not null,
foreign key (postid) references post(id),
foreign key (userid) references user(id)
);
alter table comments add createdat timestamp default current_timestamp;

desc comments;
desc follow;
desc likes;
desc post;
desc user;