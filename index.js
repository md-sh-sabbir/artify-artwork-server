const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// artwork-db
// quVjmbYw314n2jdR

const uri =
  "mongodb+srv://artwork-db:quVjmbYw314n2jdR@cluster0.enlhfah.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const db = client.db("artwork-db");
    const artworksCollection = db.collection("artworks");
    const artistsCollection = db.collection('artists')

    app.get("/artworks", async(req, res) => {
      const cursor = artworksCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get('/latest-artworks', async(req, res) => {
      const cursor = artworksCollection.find().sort({created_at : -1}).limit(6)
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get('/search', async(req, res) => {
      const search_text = req.query.search 
      const query = {}
      if(search_text){
        query.title = {
          $regex: search_text,
          $options: "i"
        }
      }
      const cursor = artworksCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get('/artworks/:id', async(req, res) => {
      const id = req.params.id 
      const query = {_id: new ObjectId(id)}
      const result = await artworksCollection.findOne(query)
      res.send(result)
    })

    app.get('/artworks/artist/:id', async(req, res) => {
        const id = req.params.id 

        const query = {_id: new ObjectId(id)}
        const artwork = await artworksCollection.findOne(query)

        const filter = {name: artwork.artist_name}
        const artist = await artistsCollection.findOne(filter)

        res.send({artwork, artist})
    })

    app.patch('/likes/:id', async(req, res) => {
      const id = req.params.id 
      // const data = req.body 
      const query = {_id: new ObjectId(id)}
      const update = {
        $inc : {
          likes_count: 1
        }
      }
      const result = await artworksCollection.updateOne(query, update)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
