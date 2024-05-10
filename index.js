const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
require('dotenv').config()
const port = process.env.PORT || 5000
const app = express()

const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://solosphere.web.app',
    ],
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

const verifyToken = (req, res, next) => {
    const token = req.cookies?.token
    if (!token) return res.status(401).send({ message: 'unauthorized access' })
    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                console.log(err)
                return res.status(401).send({ message: 'unauthorized access' })
            }
            console.log(decoded)

            req.user = decoded
            next()
        })
    }
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.syw0uxl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const assignmentCollection = client.db('GroupGrid').collection('assignments')

        // await client.connect();
        // Send a ping to confirm a successful connection

        // await client.db("admin").command({ ping: 1 });



        // jwt generate
        // app.post('/jwt', async (req, res) => {
        //     const email = req.body
        //     const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
        //         expiresIn: '365d',
        //     }).
        //         res
        //         .cookie('token', token, {
        //             httpOnly: true,
        //             secure: process.env.NODE_ENV === 'production',
        //             sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        //         })
        //         .send({ success: true })
        // })

        app.get('/assignemt', async (req, res) => {
            const result = await assignmentCollection.find().toArray()
            res.send(result)
        })

        app.post('/assignemt', async (req, res) => {
            const assignmentData = req.body
            const result = await assignmentCollection.insertOne(assignmentData)
            res.send(result)
        })
        app.get('/assignemt/:id', async (req, res) => {
            const id = req.params.id 
            const query = { _id: new ObjectId(id) }
            const result = await assignmentCollection.findOne(query)
            res.send(result)
        }) 

 

        // Clear token on logout
        app.get('/logout', (req, res) => {
            res
                .clearCookie('token', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                    maxAge: 0,
                })
                .send({ success: true })
        })




        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('GroupGrid Study Room Server Is Running')
})

app.listen(port, () => {
    console.log(`GroupGrid Server Is Running on port ${port}`)
})