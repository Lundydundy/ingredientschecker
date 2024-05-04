const express = require('express');
const cors = require('cors')
const tesseract = require("tesseract.js")
const multer = require('multer');

const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage });


class Trie {
    constructor() {
        this.children = {};
    }

    insert(word) {
        let curr = this.children;
        for (let i = 0; i < word.length; i++) {
            if (curr[word[i]]) {
                curr = curr[word[i]];
            } else {
                curr = curr[word[i]] = {};
            }
        }
        curr["isWord"] = true;
    }

    search(word) {
        let curr = this.children;
        for (let i = 0; i < word.length; i++) {
            if (curr[word[i]]) {
                curr = curr[word[i]];
            } else {
                return false;
            }
        }
        return curr["isWord"];
    }
}
function createTrie(allergies) {
    const trie = new Trie()
    allergies.forEach((allergy) => {
        trie.insert(allergy);
    })
    return trie;
}

function retrieveFoundAllergens(result, trie) {

    const found = new Set();
    const boxes = [];

    for (let i = 0; i < result.length; i++) {
        const word = result[i].text.toLowerCase()
        if (trie.search(word)) {
            boxes.push(result[i].bbox);
            found.add(word);
        }
    }

    const words = [];
    found.forEach(word => words.push(word));

    return { found: words, boxes: boxes }
}


let trie = {}


const app = express()

app.use(cors({
    origin: "https://ingredientschecker.vercel.app",
    // origin: "http://localhost:5173"
}));

app.use(express.json({limit: '2000mb'}));


app.use((req, res, next) => {

    console.log(`${req.method} - ${req.url}`)
    next()
})

app.post("/", (req, res) => {
    console.log("req.body:", req.body.allergies)
    req.allergies = req.body.allergies
    trie = createTrie(req.body.allergies)
    res.json({ trie: trie })
})

app.post("/processimg", async (req, res) => {

    const result = req.body.result
 
    const final = retrieveFoundAllergens(result, trie)
    console.log(final.found)
    res.json({ success: true, result: {words: final.found, boxes: final.boxes} });
})

app.post("/test", upload.single('image'), async (req, res) => {

    
    const imageBuffer = req.file.buffer;
    
    const config = {
        lang: "eng",
        oem: 1,
        psm: 3
    }

    const worker = await tesseract.createWorker("eng", 1)
    worker.setParameters({tessedit_char_blacklist: '0123456789!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'})

    worker
    .recognize(imageBuffer, config)
  .then((text) => {

    const result = retrieveFoundAllergens(text.data.words, trie)
    res.json(result)
  })
  .catch((error) => {
    console.log("error message: ",error.message)
    res.send(error)
  })
    
    
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`app is running on port ${PORT}`)
})

module.exports = app;