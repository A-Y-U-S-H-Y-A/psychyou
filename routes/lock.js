const Joi = require('joi');
var crypto = require('crypto');
const database = require('./postgress')

async function cc(cookie){
    var re = new RegExp("^[0-9A-Fa-f]+$");
    cookie = encodeURIComponent(cookie)
    console.log(cookie.length)
    if(cookie.length == 64 && re.test(cookie)){
        console.log('ka')
        ins = await database.exec()
        auth = await ins.query('SELECT * FROM user_reg WHERE cookie = $1',[cookie])
        console.log(auth.rows)
        if(auth.rows.length == 1){
            await ins.end()
            return new Promise(resolve => {
                resolve([auth.rows[0].user_id,200])
            });
        }
        else{
            await ins.end()
            return new Promise(resolve => {
            resolve(['Invalid',400])
        });
    }
    }
    else{
        await ins.end()
        return new Promise(resolve => {
            resolve(['Invalid',400])
        });
    }
}

module.exports.cc = cc