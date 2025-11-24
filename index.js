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
    const artistsCollection = db.collection("artists");
    const favoritesCollection = db.collection("favorites");

    app.get("/artworks", async (req, res) => {
      const query = {
        visibility: "public",
      };
      const cursor = artworksCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/artworks", async (req, res) => {
      const data = req.body;
      const result = await artworksCollection.insertOne(data);
      res.send(result);
    });

    app.post("/artists", async (req, res) => {
      const { name, photo, arts } = req.body;
      const existingArtist = await artistsCollection.findOne({ name });

      const query = {
        name: name,
      };

      if (existingArtist) {
        const update = {
          $push: {
            arts: arts[0],
          },
          $inc: {
            total_artworks: 1,
          },
        };

        const result = await artistsCollection.updateOne(query, update);
        res.send(result);
      } else {
        const newArtist = {
          name,
          photo,
          total_artworks: 1,
          arts: arts,
        };
        const result = await artistsCollection.insertOne(newArtist);
        res.send(result);
      }
    });

    app.get("/latest-artworks", async (req, res) => {
      const cursor = artworksCollection
        .find()
        .sort({ created_at: -1 })
        .limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/search", async (req, res) => {
      const search_text = req.query.search;
      const query = {};
      if (search_text) {
        query.title = {
          $regex: search_text,
          $options: "i",
        };
      }
      const cursor = artworksCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/artworks/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await artworksCollection.findOne(query);
      res.send(result);
    });

    app.get("/my-gallery", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.user_email = email;
      }
      const cursor = artworksCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/artworks/artist/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const artwork = await artworksCollection.findOne(query);

      const filter = { name: artwork.artist_name };
      const artist = await artistsCollection.findOne(filter);

      res.send({ artwork, artist });
    });

    app.patch("/likes/:id", async (req, res) => {
      const id = req.params.id;
      // const data = req.body
      const query = { _id: new ObjectId(id) };
      const update = {
        $inc: {
          likes_count: 1,
        },
      };
      const result = await artworksCollection.updateOne(query, update);
      res.send(result);
    });

    app.put("/artworks/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: data,
      };
      const result = await artworksCollection.updateOne(query, update);
      res.send(result);
    });

    app.delete('/artworks/:id', async(req, res) => {
      const id = req.params.id 
      const query = {_id: new ObjectId(id)}
      const result = await artworksCollection.deleteOne(query)
      res.send(result)
    })

    app.get('/favorites', async(req, res) => {
      const cursor = favoritesCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    app.post("/favorites", async (req, res) => {
      const data = req.body;
      const results = await favoritesCollection.insertOne(data);
      res.send(results);
    });

    app.delete('/favorites/:id', async(req, res) => {
      const id = req.params.id 
      const query = {_id: new ObjectId(id)}
      const result = await artworksCollection.deleteOne(query)
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
