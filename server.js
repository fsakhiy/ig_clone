require('dotenv').config()
const express = require('express')
const app = express()
const mysql = require('mysql')
const port = process.env.PORT || 4000
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const jwtSecretKey = process.env.JWT_SECRET

app.use(express.json())

const dbcon = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DB,
    port: process.env.DBPORT
})

dbcon.connect((err) => {
    if(err) throw err
    console.log('connected')
})

app.get('/', (req, res) => {
    res.send('welcome to the ig clone api<br>docs is not available at the moment')
})

app.post('/signup', async (req, res) => {
    const {username, name, email, password, about} = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    const sql = `insert into user(username, name, email, password, about) value ("${username}", "${name}", "${email}", "${hashedPassword}", "${about}")`
    dbcon.query(sql, (err) => {
        if (err) throw err
        res.status(200).send()
    })
})

app.post('/login', async (req, res) => {
    const {username, password} = req.body
    const parsePassword = `select password, id from user where username="${username}"`
    dbcon.query(parsePassword, async (err, result) => {
        if (err) throw err
        const userid = String(JSON.parse(JSON.stringify(result))[0].id)
        const parsedPassword = String(JSON.parse(JSON.stringify(result))[0].password)
        if(await bcrypt.compare(password, parsedPassword)) {
            res.json(jwt.sign({username: username, id:userid}, jwtSecretKey))
        } else {
            res.status(401).send()
        }
    })
})

function auth(req, res, next) {
    const token = req.headers.authorization.split(' ')[1]
    try {
        jwt.verify(token, jwtSecretKey, (err, decoded) => {
            req.user = decoded.username
            req.userid = decoded.id
            next()
        })
    } catch(err) {
        res.status(401).send()
    }
}

app.post('/new', auth, (req, res) => {
    const post = req.body.post, userid = req.userid
    const sql = `insert into post(post, createdby) value ("${post}", ${userid})`
    dbcon.query(sql, (err) => {
        if(err) throw err
        res.status(200).send()
    })
})

app.get('/posts', (req, res) => {
    const sql = `select t1.username, t0.post, t0.createdat, t0.id from post t0 left join user t1 on t0.createdby=t1.id`
    dbcon.query(sql, (err, result) => {
        if (err) throw err
        const id = JSON.parse(JSON.stringify(result))[0].id
        const username = String(JSON.parse(JSON.stringify(result))[0].username)
        const post = String(JSON.parse(JSON.stringify(result))[0].post)
        const fetchLikes = `select count(*) as likes from likes where postid=${id}`
        dbcon.query(fetchLikes, (err, resultb) => {
            if (err) throw err
            const likes = JSON.parse(JSON.stringify(resultb))[0].likes
            const posts = {
                username: username,
                post: post,
                likes: likes
            }
            res.json(posts)
        })
    })
})

app.get('/user/:user', (req, res) => {
    const sql = `select username, name, about from user where username="${req.params.user}"`
    dbcon.query(sql, (err, result) => {
        if (err) throw err
        //res.send(String(JSON.parse(JSON.stringify(result))[0]))
        if(String(JSON.parse(JSON.stringify(result))[0]) == "undefined") {
            res.status(404).send()
        } else {
            res.json(result)
        }
    })
})

app.listen(port, () => { console.log(`server is running on ${port}`) }) 