const mongoose = require('mongoose');
const mods = require('./mongmodels.js');
const url = 'mongodb+srv://psychology:0OuU0jBK8jLCcElE@cluster0.kee1v.mongodb.net/psychology1?retryWrites=true&w=majority'
const database = require('./postgress')
const mbti = mods.mbti;

async function mbtifetch(){
    await mongoose.connect(url)
    const conn1 = mongoose.connection
    try{
        tosend = await mbti.find().sort({Q_no:1})
    }
    catch (err) {
        conn1.close()
        return new Promise(resolve => {
            resolve('400')
          });
    }
    if(!tosend){
        await conn1.close()
          return new Promise(resolve => {
              resolve('Nodata')
            });
    }
    else{
        await conn1.close()
          return new Promise(resolve => {
              resolve(tosend)
            });
    }
}


async function mbtieval(data,id){
  await mongoose.connect(url)
  const conn1 = mongoose.connection
  try{
      tosend = await mbti.find().sort({Q_no:1})
  }
  catch (err) {
      conn1.close()
    console.log(err)
      return new Promise(resolve => {
          resolve('400')
        });
  }
  if(!tosend){
  await conn1.close()
    console.log('ND')
      return new Promise(resolve => {
          resolve('Nodata')
        });
  }
  else{
      var scoring={'E':0,'I':0,'S':0,'N':0,'T':0,'F':0,'J':0,'P':0}
      for(var i=1;i<=tosend.length;i++){
        try{
          key = i.toString()
          user_response = data[key]
          user_response = Number(user_response)
          obj = tosend[i-1]
          if(user_response == 1){
              console.log('A')
              obj = obj.optionA
          }
          else if(user_response == 2){
              obj = obj.optionB
          }
          else if(user_response == 3){
              obj = obj.optionC
          }
          else{
              console.log(user_response)
              throw 'NOOOOOOOOO'
          }
          det = obj[1]
          score = obj[2]
          oldscore = scoring[det]
          oldscore = Number(oldscore)
          oldscore += Number(score)
          scoring[det] = oldscore
        }
        catch(error){
            console.log(error)
          await conn1.close()
          return new Promise(resolve => {
            resolve(['Bad Request',400])
          });
        }
      }
      var answer = []
      if(scoring.E >= scoring.I){
          answer.push('E')
      }
      else {answer.push('I')}
      if(scoring.N >= scoring.S){
          answer.push('N')
      }
      else {answer.push('S')}
      if(scoring.T >= scoring.F){
          answer.push('T')
      }
      else {answer.push('F')}
      if(scoring.P >= scoring.J){
          answer.push('P')
      }
      else {answer.push('J')}
      answer = answer.toString()
      ins = await database.exec()
      auth = await ins.query('SELECT * FROM tests_data WHERE user_id = $1 AND tests = 3;',[id])
if(auth.rows.length == 0){
  await ins.query('INSERT INTO tests_data(user_id, tests, result) VALUES ($1,$2,$3);',[id,3,answer])
}
else{
  await ins.query('UPDATE tests_data SET result = $1 WHERE user_id = $2 AND tests = 3',[answer,id])
}
    await conn1.close()
    tosend = ['OK',200]
    await ins.end()
      return new Promise(resolve => {
          resolve(tosend)
        });

  }
}

module.exports.mbtieval = mbtieval
module.exports.mbtifetch = mbtifetch