const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../views/index.html'))
})

router.get('/bible', (req,res) =>{
    res.sendFile(path.resolve(__dirname, '../views/bible.html'))
})

module.exports = router;