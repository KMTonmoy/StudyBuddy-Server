const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const port = process.env.PORT || 5000;
const app = express();

const corsOptions = {
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://solosphere.web.app',
    ],
    credentials: true,
    optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const verifyToken = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) return res.status(401).send({ message: 'Unauthorized access' });
    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                console.error(err);
                return res.status(401).send({ message: 'Unauthorized access' });
            }
            console.log(decoded);
            req.user = decoded;
            next();
        });
    }
};

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
        app.get('/assignment', async (req, res) => {
            try {
                const result = await assignmentCollection.find().toArray();
                res.send(result);
            } catch (error) {
                console.error('Error fetching assignments:', error);
                res.status(500).send({ message: 'Internal Server Error' });
            }
        });

        app.get('/submited', async (req, res) => {
            try {
                const result = await TakeAssignmnetCollection.find().toArray();
                res.send(result);
            } catch (error) {
                console.error('Error fetching assignments:', error);
                res.status(500).send({ message: 'Internal Server Error' });
            }
        });




        app.post('/assignment', async (req, res) => {
            try {
                const assignmentData = req.body;
                const result = await assignmentCollection.insertOne(assignmentData);
                res.send(result.ops[0]);
            } catch (error) {
                console.error('Error creating assignment:', error);
                res.status(500).send({ message: 'Internal Server Error' });
            }
        });

        app.put('/assignment/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updateAssignment = req.body;
            const Data = {
                $set: {
                    title: updateAssignment.title,
                    thumbnailURL: updateAssignment.thumbnailURL,
                    marks: updateAssignment.marks,
                    difficultyLevel: updateAssignment.difficultyLevel,
                    description: updateAssignment.description,
                    dueDate: updateAssignment.dueDate,

                }
            }


            const result = await assignmentCollection.updateOne(filter, Data, options);
            res.send(result);
        })

        app.post('/submited', async (req, res) => {
            try {
                const submitData = req.body;
                const result = await TakeAssignmnetCollection.insertOne(submitData);
                res.send(result);
            } catch (error) {
                console.error('Error creating assignment:', error);
                res.status(500).send({ message: 'Internal Server Error' });
            }
        });



        app.get('/assignment/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await assignmentCollection.findOne(query);
                if (!result) {
                    return res.status(404).send({ message: 'assignment not found' });
                }
                res.send(result);
            } catch (error) {
                console.error('Error fetching assignment:', error);
                res.status(500).send({ message: 'Internal Server Error' });
            }
        });

        app.delete('/assignment/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await assignmentCollection.deleteOne(query);
                res.send({ deletedCount: result.deletedCount });
            } catch (error) {
                console.error('Error deleting assignment:', error);
                res.status(500).send({ message: 'Internal Server Error' });
            }
        });

        app.get('/logout', (req, res) => {
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
                maxAge: 0,
            }).send({ success: true });
        });




        // app.get('/myAssignment/:uid', async (req, res) => {
        //     const uid = req.params.uid
        //     const query = { uid }
        //     const result = await TakeAssignmnetCollection.find(query).toArray()
        //     res.send(result)
        // })

        // app.get('/assignmentReq/:uid', async (req, res) => {
        //     const uid = req.params.uid
        //     const query = { 'student.uid': uid }
        //     const result = await TakeAssignmnetCollection.find(query).toArray()
        //     res.send(result)
        // })




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
