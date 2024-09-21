require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;
const mongos = process.env.MONGO;
console.log(mongos);
const uri = "mongodb+srv://hardik286:mongodbsucks@cluster0.uz7pb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const urlSchema = new mongoose.Schema({
  shortUrl: {
    type: Number,
    required:true,
    unique:true
  },
  url: {
    type: String,
    required: true,
    unique:true
  },
  // timestamp: true
});
const Url = mongoose.model('Url', urlSchema);


app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});
app.post('/api/shorturl', async function(req, res) {
  var newUrl = req.body.url;
  if(!/^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g.test(newUrl)){
    return res.json({
      error: "invalid url"
    })
  }
  var found = await Url.find({
    url:newUrl
  })
  if((found.length!==0)) {
    return res.json({
      url: found[0].url,
      shortUrl: found[0].shortUrl
    })
  }
  var count = await Url.estimatedDocumentCount()|| 0;
  var newUrl = new Url({url: req.body.url,
    shortUrl: count+1
  });
  var a=await newUrl.save();
  return res.json({
    original_url: a.url,
      short_url: a.shortUrl
  })
});

app.get('/api/shorturl/:shorturl',  async function (req, res) {
  const { shorturl } = req.params;
  var result =await Url.findOne({
    shortUrl: shorturl
  });
  if (!result) {
    return res.json({
      err: 'no matching URL'
    });
  } else {
    // returns a document matching the short url, forward toward the unshortened url
    return res.redirect(result.url);
  }
}); // get request block
// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

