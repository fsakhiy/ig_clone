require('dotenv').config()
const express = require('express')
const app = express()
const mysql = require('mysql')
const port = process.env.PORT || 4000
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const jwtSecretKey = process.env.JWT_SECRET
const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public")
    },
    filename: (req, file, cb) => {
        const name = Date.now() + path.parse(file.originalname).ext
        cb(null, name)
    }
})

const upload = multer({storage: storage})

app.use(express.json())
app.use('/static', express.static(__dirname + '/public'))

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

app.post('/likes', auth, (req, res) => {
    const postid = req.body.postid
    const sql = `insert into likes(postid, userid) value (${postid}, ${req.userid})`
    dbcon.query(sql, (err) => {
        if (err) throw err
        res.status(200).send()
    })
})

app.post('/comments', auth, (req, res) => {
    const {comment, postid} = req.body, userid = req.userid
    const sql = `insert into comments (postid, userid, comment) value (${postid}, ${userid}, "${comment}")`
    dbcon.query(sql, (err) => {
        if (err) throw err
        res.status(200).send()
    })
})

app.post('/likecomments', auth, (req, res) => {
    const {postid, commentid} = req.body, userid = req.userid
    const sql = `insert into commentlikes(commentid, postid, userid) value (${commentid}, ${postid}, ${userid})`
    dbcon.query(sql, (err) => {
        if (err) throw err
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
            const fetchComments = `select t1.username, t2.comment from user t1 right join comments t2 on t2.userid=t1.id`
            dbcon.query(fetchComments, (err, resultc) => {
                if (err) throw err
                const comments = resultc
                const commentid = JSON.parse(JSON.stringify(resultc)).id
                const posts = {
                    username: username, 
                    post: post,
                    likes: likes,
                    comments: comments
                }
                res.json(posts)
            })
        })
    })
})

app.post('/upload',  upload.single('public'), (req, res) => {
    res.send()
})

app.get('/commentlikes/:postid/:commentid', (req, res) => {
    const {postid, commentid} = req.params
    sql = `select count(*) as likes from commentlikes where postid=${postid} && commentid=${commentid}`
    dbcon.query(sql, (err, result) => {
        if (err) throw err
        res.json(result)
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