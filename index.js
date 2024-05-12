const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 5000;
const app = express();

const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'https://assignment-11-b5225.web.app',

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

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.syw0uxl.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // await client.connect();
        const assignmentCollection = client.db('GroupGrid').collection('assignments');
        const TakeAssignmnetCollection = client.db('GroupGrid').collection('takeAssignemnt')



        // Jwt Start Here
        app.post('/jwt', async (req, res) => {
            const email = req.body
            const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '365d',
            }).
                res
                .cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                })
                .send({ success: true })
        })



        // Clear Web Token On Logout
        app.get('/logout', (req, res) => {
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 0,
            }).send({ success: true });
        });




        app.get('/assignment', async (req, res) => {
            const cursor = assignmentCollection.find();
            const result = await cursor.toArray();
            res.send(result);

        });

        app.get('/submited', async (req, res) => {

            const cursor = TakeAssignmnetCollection.find();
            const result = await cursor.toArray();
            res.send(result);

        });





        app.post('/assignment', async (req, res) => {

            const newAssignment = req.body;
            console.log(newAssignment);
            const result = await assignmentCollection.insertOne(newAssignment);
            res.send(result);

        });



        app.post('/submited', async (req, res) => {
            const submitAssignment = req.body;
            console.log(submitAssignment);
            const result = await TakeAssignmnetCollection.insertOne(submitAssignment);
            res.send(result);

        });



        app.get('/submited/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await TakeAssignmnetCollection.findOne(query);
            res.send(result);
        });



        app.put('/submited/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateMark = req.body;
            const Mark = {
                $set: {
                    result: updateMark.result,
                    feedback: updateMark.feedback,
                }
            }
            const result = await TakeAssignmnetCollection.updateOne(filter, Mark, options);
            res.send(result);
        })



        app.put('/assignment/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateAssignment = req.body;
            const assign = {
                $set: {
                    title: updateAssignment.title,
                    thumbnailURL: updateAssignment.thumbnailURL,
                    marks: updateAssignment.marks,
                    difficultyLevel: updateAssignment.difficultyLevel,
                    description: updateAssignment.description,
                    dueDate: updateAssignment.dueDate,
                }
            }
            const result = await assignmentCollection.updateOne(filter, assign, options);
            res.send(result);
        })


        app.get('/assignment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await assignmentCollection.findOne(query);
            res.send(result);
        });

        app.delete('/assignment/:id', async (req, res) => {

            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await assignmentCollection.deleteOne(query);
            res.send({ deletedCount: result.deletedCount });

        });








        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // No need to close client here
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('GroupGrid Study Room Server Is Running');
});

app.listen(port, () => {
    console.log(`GroupGrid Server Is Running on port ${port}`);
});
