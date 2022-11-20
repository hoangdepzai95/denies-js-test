import express from 'express';
import path from 'path'

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, './public')));

app.get('*', function (request, response) {
    console.log(__dirname)
    response.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`App starting at localhost:${PORT}`)
})
