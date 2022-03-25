const mongoose = require('mongoose');

const johari_window=new mongoose.Schema({
    Q_no:Number,
    Q1:String,
    Q2:String,
    determines:Boolean, // true determines E and false determines F
    score:Boolean // true --> 1 or 2 , false --> 4 or 5
});

const mbti = new mongoose.Schema({
    Q_exists: Boolean,
    Q_no: Number,
    Q_statement:String,
    optionA:[String,String,Number],
    optionB:[String,String,Number],
    optionC:[String,String,Number]
});

const logb = new mongoose.Schema({
    Q_no:Number,
    wordL:String,
    wordO:String,
    wordG:String,
    wordB:String
});


module.exports.johari_window = mongoose.model('johari window', johari_window, 'johari window');
module.exports.logb = mongoose.model('logb', logb, 'logb');
module.exports.mbti = mongoose.model('mbti', mbti, 'mbti');