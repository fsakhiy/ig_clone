# IG CLONE API
## THING YOU NEED IN YOUR .env FILE:
- ### CONFIG
    * PORT - your application port
- ### MYSQL CONFIGURATION
    * DBHOST - your mysql server hostname
    * DBPORT - your mysql server port
    * DBUSER - your mysql server username
    * DBPASSWORD - your mysql user password
    * DB - the database you want to use
- ### JWT
    * JWT_SECRET - secret/private key for your jwt

## HOW TO RUN
### Run production server
```
npm start
```
### Run development server
``` 
npm run startDev 
```

## ENDPOINTS
- **GET**
    * /posts - show all of the post
    * /user/:username - search for specific user (:username = the user usernae)
- **POST**
    * /signup 
        * username - not null
        * name
        * email - not null
        * password - not null
        * about
    * /login - after this you will get jwt token if login successful
        * username 
        * password
    * /new - need authentication
        * post - what you want to post
    * /likes - need authentiaction
        * postid - id of the post you want to like
    * /comments - need authentication
        * postid - id of the post you want to comment
        * comment - what you want to comment