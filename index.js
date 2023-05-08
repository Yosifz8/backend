const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const uuid = require('uuid');

const app = express();
const port = process.env.PORT || 3000; // The server port
const dataFilePath = './data.json'; // The data file location

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' })); // Set the limit to 10mb


// GET endpoint to retrieve data from the file. Based on the username
app.get('/posts', (req, res) => {
    const data = JSON.parse(fs.readFileSync(dataFilePath));

    const username = req.query.username;
    const userPosts = req.query.userPosts;
    if (userPosts == 'true') {
        const filteredData = data.filter(item => item.username == username);
        res.json(filteredData);
    } else {
        const filteredData = data.filter(item => item.username != username);
        res.json(filteredData);
    }
});

// POST endpoint to save data to the file
app.post('/posts', (req, res) => {
    const newData = req.body;

    const imageData = Buffer.from(newData.image, 'base64');
    const filename = uuid.v4();

    fs.writeFile(`photos/${filename}.jpg`, imageData, (err) => {
        if (err) {
            console.error(err);
            return;
        }
    });

    const newPost = {
        id: uuid.v4(),
        username: newData.username,
        title: newData.title,
        description: newData.description,
        imgUrl: `photos/${filename}.jpg`
    }

    if (newData.longitude) {
        newPost.longitude = newData.longitude
    }

    if (newData.latitude) {
        newPost.latitude = newData.latitude
    }

    const currentData = JSON.parse(fs.readFileSync(dataFilePath));
    const updatedData = [...currentData, newPost];
    fs.writeFileSync(dataFilePath, JSON.stringify(updatedData, null, 2));
    res.json(newPost);
});

// PUT endpoint to update data of specific post
app.put('/posts', (req, res) => {
    const updatedData = req.body;

    const data = JSON.parse(fs.readFileSync(dataFilePath));

    const itemIndex = data.findIndex(item => item.id === updatedData.id);

    // if the item is found, update its properties
    if (itemIndex !== -1) {
        const item = data[itemIndex]
        item.title = updatedData.title;
        item.description = updatedData.description;
        if (updatedData.longitude) {
            item.longitude = updatedData.longitude
        }

        if (updatedData.latitude) {
            item.latitude = updatedData.latitude
        }
    }

    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    res.json({ success: true });
});

// DELETE endpoint to delete specific post
app.delete('/posts', (req, res) => {
    const updatedData = req.body;

    const data = JSON.parse(fs.readFileSync(dataFilePath));

    const itemIndex = data.findIndex(item => item.id === updatedData.id);
    if (itemIndex !== -1) {
        data.splice(itemIndex, 1);
    }

    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
    res.json({ success: true });
});

// Serve photos from the 'photos' folder
app.use('/photos', express.static('photos'));

app.get('/photos/:photoName', (req, res) => {
    const photoName = req.params.photoName;
    res.send(`Displaying photo: ${photoName}`);
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});