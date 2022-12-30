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
alter table user add password text not null;
alter table user add unique(username, email);

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
alter table post add createdby int not null;
alter table post add constraint foreign key(createdby) references user(id);

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

create table commentlikes(
id int not null primary key auto_increment,
commentid int not null,
userid int not null,
foreign key(commentid) references comments(id),
foreign key(userid) references user(id)
);

desc comments;
desc follow;
desc likes;
desc post;
desc user;

select * from user;
select * from post;

select t1.username, t0.post, t0.createdat from post t0 left join user t1 on t0.createdby=t1.id where t0.createdby=1;

insert into likes(postid, userid) value (1,1);
insert into comments(postid, userid, comment) value (1,1,"this is ig's first comment");
insert into comments(postid, userid, comment) value (1,1,"this is ig's second comment");

select count(*) as likes from likes where postid=1;
select userid, comment from comments;
select t1.username, t2.comment from user t1 right join comments t2 on t2.userid=t1.id;