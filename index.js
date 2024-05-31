const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware 
app.use(cors())
app.use(express.json())

// functionreq, res, next) {
//     const authorize = req.headers.authorization;
//     if (!authorize) {
//         return res.status(401).send({ message: "Unauthorize access!" })
//     }
//     // console.log(authorize);
//     const token = authorize.split(" ")[1];
//     jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
//         if (err) {
//             // console.log("err");
//             return res.status(403).send({ message: "Forbidden access" })
//         }
//         req.decoded = decoded;
//         next()
//     });
// }


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sj400.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nbflg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const OrderCollection = client.db("poristhanFashion").collection("orders");
        const MemoCollection = client.db("poristhanFashion").collection("memoSerials");
        const UserCollection = client.db("poristhanFashion").collection("users");
        const MarchentNameCollection = client.db("poristhanFashion").collection("marchentName");

        // get all orders
        app.get('/orders', async (req, res) => {
            const query = {};
            const result = await OrderCollection.find(query).toArray();
            res.send(result)
        })



        // get order by memo no.
        app.get('/order/:value', async (req, res) => {
            const value = req.params.value;

            if (value.length === 11) {
                const filterID = { recipient_phone: value };
                const result = await OrderCollection.find(filterID).toArray();
                if (result.length > 0) {
                    res.send({ success: true, result })
                }
                else {
                    res.send({ success: false, message: `${value} phone number not found!` })

                }

            } else if (value.length === 8) {
                const filterID = { bookingID: value };
                const result = await OrderCollection.findOne(filterID)
                if (!result) {
                    res.send({ success: false, message: `${value} no booking ID not found!` })

                }
                else {
                    res.send({ success: true, result })
                }
                // res.send(value)

            } else if (value.length < 8) {
                const filterMemo = { memo: parseInt(value) };
                const result = await OrderCollection.findOne(filterMemo)
                if (!result) {
                    res.send({ success: false, message: `${value} no memo entry not found!` })
                }
                else {
                    res.send({ success: true, result })
                }

            } else {
                res.send({ success: false, message: `Invalid input, Please enter a memo no or booking ID` })
            }

            // res.send(result)

        })


        // get order by seller name and date
        app.get('/orders/:sellerName', async (req, res) => {
            const sellerName = req.params.sellerName;
            const bookingDate = req.query.bookingDate;
            if (sellerName === "all") {

                const fiter = {
                    bookingDate: bookingDate
                };
                const result = await OrderCollection.find(fiter).toArray()
                res.send(result)
            }
            else {
                const fiter = {
                    sellerName: sellerName,
                    bookingDate: bookingDate
                };
                const result = await OrderCollection.find(fiter).toArray()
                res.send(result)
            }
        })

        // // post orders 
        app.post('/orders', async (req, res) => {
            const orderInfo = req.body;
            const filterMemo = { memo: orderInfo.memo };
            const filterID = { bookingID: orderInfo.bookingID };
            const existMemo = await OrderCollection.findOne(filterMemo)
            const existID = await OrderCollection.findOne(filterID)
            if (existMemo) {
                res.send({ success: false, message: `Memo number aleady exist!` })
            }
            else if (existID) {
                res.send({ success: false, message: `Booking ID aleady exist!` })
            }
            else {
                const result = await OrderCollection.insertOne(orderInfo)
                if (result.insertedId) {
                    res.send({ success: true, message: `Successfuly sell add for ${orderInfo.sellerName}` })
                }
                else {
                    res.send({ success: false, message: `Somthing is wrong! Please try again` })
                }
            }

        })

        // update entry by id
        app.put("/order/update/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const orderInfo = req.body;
            const updateDoc = {
                $set: orderInfo
            };
            const result = await OrderCollection.updateOne(filter, updateDoc);
            res.send(result)
        })
        // // update entry by memo
        // app.put("/order/update/:id", async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: ObjectId(id) };
        //     const orderInfo = req.body;
        //     const updateDoc = {
        //         $set: orderInfo
        //     };
        //     const result = await OrderCollection.updateOne(filter, updateDoc);
        //     res.send(result)
        // })




        // delete order 
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await OrderCollection.deleteOne(filter);
            res.send(result)
        })




        // memo 
        app.get('/memo', async (req, res) => {
            const query = {};
            const result = await MemoCollection.find(query).toArray();
            res.send(result)
        })

        // add memo 
        app.put("/addMemo/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const memoInfo = req.body;
            const updateDoc = {
                $set: memoInfo
            };
            const result = await MemoCollection.updateOne(filter, updateDoc);
            res.send(result)
        })


        // marchentName 
        app.get('/marchentName', async (req, res) => {
            const query = {};
            const result = await MarchentNameCollection.find(query).toArray();
            res.send(result)
        })

        // update marchent name 
        app.put("/changeMarchentName/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const marchentName = req.body;
            const updateDoc = {
                $set: marchentName
            };
            const result = await MarchentNameCollection.updateOne(filter, updateDoc);
            res.send(result)
        })




        //  create user
        app.put('/user/:email', async (req, res) => {
            const user = req.body;
            const email = req.params.email;
            const filte = { email: email }
            const options = { upsert: true };
            const updatedDoc = {
                $set: user
            }
            const result = await UserCollection.updateOne(filte, updatedDoc, options);
            // const token = jwt.sign({ email: email }, process.env.SECRET_KEY, { expiresIn: '60d' });
            res.send({ result })
        })

        // get all users
        app.get('/users', async (req, res) => {
            const query = {};
            const result = await UserCollection.find(query).toArray();
            res.send(result)
        })


        // get role 
        app.get('/role/:email', async (req, res) => {
            const userEmail = req.params.email;
            const user = await UserCollection.findOne({ email: userEmail })
            // const isAdmin = user.role === 'admin';
            if (user?.role) {
                res.send({ role: user?.role })
            }
            else {
                res.send({ role: undefined })
            }

        })

        // // get admin 
        // app.get('/admin/:email', async (req, res) => {
        //     const userEmail = req.params.email;
        //     const user = await UserCollection.findOne({ email: userEmail })
        //     const isAdmin = user.role === 'admin';
        //     res.send({ admin: isAdmin })
        // })

        // Edit Role
        app.put("/user/editRole/:email", async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: user.role }
            };
            const result = await UserCollection.updateOne(filter, updateDoc);
            res.send(result)
        })


        // // make admin
        // app.put("/user/makeAdmin/:email", verfyAdmin, async (req, res) => {
        //     const email = req.params.email;
        //     const filter = { email: email };
        //     const updateDoc = {
        //         $set: { role: 'admin' }
        //     };
        //     const result = await UserCollection.updateOne(filter, updateDoc);
        //     res.send(result)
        // })

        // // delete admin
        // app.put("/user/deleteAdmin/:email", verfyAdmin, async (req, res) => {
        //     const email = req.params.email;
        //     const filter = { email: email };
        //     const options = { upsert: true };
        //     const updateDoc = {
        //         $set: { role: '' }
        //     };
        //     const result = await UserCollection.updateOne(filter, updateDoc, options);
        //     res.send(result)
        // })



        async function verfyAdmin(req, res, next) {
            const requisterEmail = req.decoded.email;
            const requister = await UserCollection.findOne({ email: requisterEmail })
            if (requister.role === "admin") {
                next()
            }
            else {
                res.status(403).send({ message: 'forbidden' })
            }
        }

        // create payment 
        // app.post("/create-payment-intent", async (req, res) => {
        //     const { price } = req.body;
        //     const amount = price * 100;

        //     // Create a PaymentIntent with the order amount and currency
        //     const paymentIntent = await stripe.paymentIntents.create({
        //         amount: amount,
        //         currency: "usd",
        //         payment_method_types: ['card']
        //     });
        //     res.send({
        //         clientSecret: paymentIntent.client_secret,
        //     });
        // });





        // // update profile
        // app.put('/profile/:email', verifyJwt, async (req, res) => {
        //     const userProfile = req.body;
        //     const email = req.params.email;
        //     // console.log(userProfile, email);
        //     const filter = { email: email }
        //     const options = { upsert: true };
        //     const updatedDoc = {
        //         $set: userProfile
        //     }
        //     const result = await UserProfileCollection.updateOne(filter, updatedDoc, options);
        //     res.send(result)
        // })
        // // get profile
        // app.get('/profile/:email', verifyJwt, async (req, res) => {
        //     const email = req.params.email;
        //     // console.log(email);
        //     const fiter = { email: email };
        //     const result = await UserProfileCollection.findOne(fiter)
        //     res.send(result)
        // })

        // // get all parts 
        // app.get('/parts', async (req, res) => {
        //     const query = {};
        //     const result = await partsCollection.find(query).toArray();
        //     res.send(result)
        // })

        // // get sigle parts 
        // app.get('/part/:id', verifyJwt, async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: ObjectId(id) };
        //     const result = await partsCollection.findOne(filter)
        //     res.send(result)
        // })

        // // post part 
        // app.post('/part', verifyJwt, async (req, res) => {
        //     const part = req.body;
        //     const result = await partsCollection.insertOne(part)
        //     if (result.insertedId) {
        //         res.send({ success: true, message: `Successfuly Added ${part.name}` })
        //     }
        //     else {
        //         res.send({ success: false, message: `Somthing is Wrong` })
        //     }

        // })

        // // delete parts
        // app.delete('/part/:id', verifyJwt, async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: ObjectId(id) };
        //     const result = await partsCollection.deleteOne(filter);
        //     res.send(result)
        // })



        // // post orders 
        // app.post('/orders', verifyJwt, async (req, res) => {
        //     const orderInfo = req.body;
        //     const result = await orderCollection.insertOne(orderInfo)
        //     res.send(result)
        // })

        // // make payment order
        // app.patch('/order/:id', verifyJwt, async (req, res) => {
        //     const id = req.params.id;
        //     const payment = req.body;
        //     const filter = { _id: ObjectId(id) };
        //     const updatedDoc = {
        //         $set: {
        //             paid: true,
        //             transectionId: payment.transectionId
        //         }
        //     }
        //     const result = await orderCollection.updateOne(filter, updatedDoc);
        //     res.send(result)
        // })

        // // ship order 
        // app.put("/orderShip/:id", verifyJwt, verfyAdmin, async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: ObjectId(id) };
        //     const updateDoc = {
        //         $set: { shipped: true }
        //     };
        //     const result = await orderCollection.updateOne(filter, updateDoc);
        //     res.send(result)
        // })

        // // get all orders
        // app.get('/orders', verifyJwt, async (req, res) => {
        //     const quary = {};
        //     const result = await orderCollection.find(quary).toArray()
        //     res.send(result)
        // })

        // // get my order
        // app.get('/orders/:email', verifyJwt, async (req, res) => {
        //     const email = req.params.email;
        //     const fiter = { customerEmail: email };
        //     const result = await orderCollection.find(fiter).toArray()
        //     res.send(result)
        // })


        // // get sigle order 
        // app.get('/order/:id', verifyJwt, async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: ObjectId(id) };
        //     const result = await orderCollection.findOne(filter)
        //     res.send(result)
        // })

        // // delete order
        // app.delete('/order/:id', verifyJwt, async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: ObjectId(id) };
        //     const result = await orderCollection.deleteOne(filter);
        //     res.send(result)
        // })

        // // get all review 
        // app.get('/reviews', async (req, res) => {
        //     const quary = {};
        //     const result = await reviewCllection.find(quary).toArray()
        //     res.send(result)
        // })

        // // post reviews 
        // app.post('/reviews', async (req, res) => {
        //     const review = req.body;
        //     // console.log(review);
        //     const result = await reviewCllection.insertOne(review)
        //     res.send(result)
        // })


    } finally {

    }
}
run().catch(console.dir)





app.get('/', (req, res) => res.send('Welcome to Poristhan Fashion'))
app.listen(PORT, () => console.log('Port is', PORT))