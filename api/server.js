const fs = require('fs');

const express = require('express');
const cors = require('cors')
const multer = require('multer')

const Tesseract = require("tesseract.js");
const { createWorker } = Tesseract;

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

    for (let i = 0; i < result.data.words.length; i++) {
        const word = result.data.words[i].text.toLowerCase()
        if (trie.search(word)) {
            boxes.push(result.data.words[i].bbox);
            found.add(word);
        }
    }

    const words = [];
    found.forEach(word => words.push(word));

    return { found: words, boxes: boxes }
}


let trie = {}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'images/')
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname)
    },
  })
  
const upload = multer({ storage: storage })

const app = express()

app.use(cors({
    origin: "http://localhost:5173"
}));

app.use(express.json());

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

app.post("/processimg", upload.single('file'), async (req, res) => {

    const worker = await createWorker('eng');


    const result = await worker.recognize(`./images/${req.file.originalname}`, {
        tessedit_char_blacklist: '0123456789!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~', // Ignore numbers and special characters
        oem: 1
    })

    
    const final = retrieveFoundAllergens(result, trie)

    console.log(final.found)
    worker.terminate();
    
    fs.unlink(`./images/${req.file.originalname}`, (err) => {
        if (err) {
            console.error(err)
            return
        }
        console.log(`successfully deleted ${req.file.originalname}`)
    })
    res.json({ success: true, result: {words: final.found, boxes: final.boxes} });
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`app is running on port ${PORT}`)
})

module.exports = app