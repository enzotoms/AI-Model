import express from 'express';
import cors from 'cors';
import ImageKit from 'imagekit';
import mongoose from 'mongoose';
import UserChats from './models/userChats.js';
import Chat from './models/chat.js';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

const app = express();
const port = process.env.PORT || 3001;


app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
})
);

// middleware to parse the incoming request body to JSON from the newPrompt
app.use(express.json());

// connecting to MongoDB database using mongoose
const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGO)
        console.log("Connected to MongoDB");
    } catch (err) {
        console.log(err);
    }
}

const imagekit = new ImageKit({
    urlEndpoint: process.env.IMAGE_KIT_ENDPOINT,
    publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
    privateKey: process.env.IMAGE_KIT_PRIVATE_KEY
  });

app.get("/api/upload", (req,res) => {
    const result = imagekit.getAuthenticationParameters();
    res.send(result);
});


// app.get("/api/test", ClerkExpressRequireAuth(), (req, res) =>{
//     const userId = req.auth.userId;
//     console.log(userId);
//     res.send("Success!!");
// });

app.post("/api/chats",  ClerkExpressRequireAuth(), async (req,res) => {
    const userId = req.auth.userId;
    const {text} = req.body;
    
    try {
        // CREATING A NEW CHAT
        const newChat = new Chat({
            userId: userId,
            history: [{role: "user", parts: [{ text }] }]
        });

        const savedChat = await newChat.save()


        // CHECK IF USER CHAT EXISTS
        const userChats = await UserChats.find({userId: userId}); 

        // IF USER CHAT DOES NOT EXIST, CREATE A NEW ONE TO THE ARRAY
        if(!userChats.length) {
            const newUserChats = new UserChats({
                userId: userId,
                chats: [
                    {
                        _id: savedChat._id,
                     title: 
                        // to display only the first 40 characters of the text on the user history dashboard
                        text.substring(0,40),
                    },
                ],
            });

            await newUserChats.save();
        }else{
            // IF USER CHAT EXISTS, ADD THE NEW CHAT TO THE ARRAY
            await UserChats.updateOne({userId: userId}, {
                $push:{
                    chats:{
                        _id:savedChat._id,
                        title: text.substring(0,40),
                    },
                },
        });

        res.status(201).send(newChat._id);
    }
        
    } catch (err) {
        console.log(err);
        res.status(500).send("Error generating chat!");
    }
});

app.get("/api/userChats", ClerkExpressRequireAuth(), async (req,res) => {
    const userId = req.auth.userId;

    try {
        const userChats = await UserChats.find({userId});
        res.status(200).send(userChats[0].chats);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error fetching user chats!");
    }
});

// GETTING A SPECIFIC CHAT
app.get("/api/chats/:id", ClerkExpressRequireAuth(), async (req,res) => {
    const userId = req.auth.userId;

    try {
        const chat = await Chat.findOne({_id: req.params.id, userId});  
        res.status(200).send(chat);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error fetching chat!");
    }
});


// ADDING A NEW MESSAGE TO THE CHAT
app.put("/api/chats/:id", ClerkExpressRequireAuth(), async (req,res) => {
    const userId = req.auth.userId;
    const {question, answer, img} = req.body;

    const newItems = [
      ...(question
         ? [{ role: "user", parts: [{ text: question }], ...(img && { img }) }] : []),
        { role: "model", parts: [{ text: answer }] }
    ];

    try {
        const updatedChat = await Chat.updateOne({_id: req.params.id, userId}, {
            $push: {
                history: {
                    $each: newItems,
                },
            }
        }); 
        res.status(200).send(updatedChat);
    } catch (err) {
        console.log(err);
        res.status(500).send("Error adding message to chat!");
    }
});

// middleware access for backend clerk authentication
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(401).send('Unauthenticated!')
  });


app.listen(port, () => {
    connect()
    console.log(`Server is running on port ${port}`);
    });