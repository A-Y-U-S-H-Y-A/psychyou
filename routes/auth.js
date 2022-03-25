const Joi = require('joi');
var crypto = require('crypto');
const idgen = require('./id.js');
const database = require('./postgress')


const Joischema = Joi.object({
    username: Joi.string().min(3).max(30).pattern(new RegExp('^[a-zA-Z0-9]([._-](?![._-])|[a-zA-Z0-9]){3,18}[a-zA-Z0-9]$')),
    password: Joi.string().min(8).max(40),
    email: Joi.string().min(4).max(50).email(),
    fullname: Joi.string().min(4).pattern(new RegExp('^[a-zA-Z]{4,}(?: [a-zA-Z]+){0,2}$'))
});


function hashing(data) {
    var hash = crypto.createHash('sha256').update(data).digest('hex');
    return hash        
}

async function cookie(id){
    var mid = crypto.randomBytes(20).toString('hex')
    var cookie = mid + String(id)
    var cookie = crypto.createHash('sha256').update(cookie).digest('hex')
    return new Promise(resolve =>{resolve(cookie)});

}


async function login(username,password){
        ins = await database.exec()
        // console.log(ins)
        em = false
        if(username.indexOf('@')>-1){
            try {
                value = await Joischema.validateAsync({email: username,password:password});
            }
            catch (err) {
                console.log(err)
                await ins.end()
                return new Promise(resolve => {
                    resolve(['Invalid',400])
                  });
            }
            em = true
        }
        else{
            try {
                value = await Joischema.validateAsync({username: username,password:password});
            }
            catch (err) {
                console.log(err)
                await ins.end()
                return new Promise(resolve => {
                    resolve(['Invalid',400])
                });
            }
        }
        password = hashing(password)
        username = username.toLowerCase()
        username = encodeURIComponent(username)
        try{
            if(em == false){
                console.log('Username')
                auth = await ins.query('SELECT * FROM user_reg WHERE username = $1 and password = $2',[username,password])
            }
            else{
                console.log('Email')
                auth = await ins.query('SELECT * FROM user_reg WHERE email = $1 and password = $2',[username,password])
            }
            
        }
        catch(err){
            console.log(err)
            await ins.end()
            return new Promise(resolve => {
                resolve(['Internal',501])
            });
        }
        console.log(username)
        console.log(password)
        console.log(auth.rows)
        if(auth.rows.length>=1){
            console.log('k')
            var c = await cookie(auth.rows[0].user_id)
            if(em == false){
                await ins.query('UPDATE user_reg SET cookie = $1, timing = to_timestamp($2 / 1000.0) WHERE username = $3',[c,Date.now(),username])
            }
            else{
                await ins.query('UPDATE user_reg SET cookie = $1, timing = to_timestamp($2 / 1000.0) WHERE email = $3',[c,Date.now(),username])
            }
            console.log('l')
            await ins.end()
            return new Promise(resolve => {
                    resolve([auth.rows[0].user_id,200,c])
            });
        }
        else{
            await ins.end()
            return new Promise(resolve => {
                resolve(['NP',401])
        });
        }
        }


async function register(username,password,email,fullname,linkedin){
    ins = await database.exec()
    try {
        value = await Joischema.validateAsync({username: username,password:password,email:email,fullname:fullname});
    }
    catch (err) {
        console.log(err)
        await ins.end()
        return new Promise(resolve => {
            resolve(['Invalid',400])
          });
    }
    username = username.toLowerCase()
    username = encodeURIComponent(username)
    email = email.toLowerCase()
    email = encodeURIComponent(email)
    fullname =  encodeURIComponent(fullname)
    linkedin = linkedin.toLowerCase()
    linkedin = encodeURIComponent(linkedin)
    try{
        var data = await ins.query('SELECT * FROM user_reg WHERE username = $1',[username])
        }
        catch(err){
            await ins.end()
            return new Promise(resolve => {
                resolve(['ServerErr',500])
            });
        }
        if(data.rows.length>=1){
            await ins.end()
            return new Promise(resolve => {
                resolve(['UsernameTaken',406])
            });
        }
    try{
        var data = await ins.query('SELECT * FROM user_reg WHERE email = $1',[email])
        }
            catch(err){
                await ins.end()
                return new Promise(resolve => {
                    resolve(['ServerErr',500])
                });
            }
            if(data.rows.length>=1){
                await ins.end()
                return new Promise(resolve => {
                    resolve(['EmailTaken',406])
                });
            }
    
    newid = await idgen.idgen()
    password = hashing(password)
    try{
        await ins.query('INSERT INTO user_reg(user_id,username,password,name,email,linkedid) VALUES ($1,$2,$3,$4,$5,$6)',[newid,username,password,fullname,email,linkedin])
    }
    catch(err){
        ins = await database.exec()
        await ins.query('INSERT INTO user_reg(user_id,username,password,name,email,linkedid) VALUES ($1,$2,$3,$4,$5,$6)',[newid,username,password,fullname,email,linkedin])
    }
    await ins.end()
    return new Promise(resolve => {
        resolve(['Success',200])
    });
}

module.exports.login = login;
module.exports.register = register;