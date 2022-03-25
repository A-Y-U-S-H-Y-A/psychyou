const database = require('./postgress')

async function idgen(){
ins =  await database.exec()
auth = await ins.query('SELECT count(user_id) FROM user_reg')
console.log(auth.rows)
id = auth.rows[0].count
await ins.end()
    return new Promise(resolve =>{resolve(id)});
    
}
module.exports.idgen = idgen;