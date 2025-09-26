import express from 'express'

const PORT = 8000

const app = express();

app.use(express.json());

app.get('/',  (req, res) => {
    res.send("Hello")
})

app.listen(PORT, () => {
    console.log(`app is listening to the ${PORT}`);
})