const mongoose = require('mongoose');
const mods = require('./mongmodels.js');
const database = require('./postgress')

const url = 'mongodb+srv://psychology:0OuU0jBK8jLCcElE@cluster0.kee1v.mongodb.net/psychology1?retryWrites=true&w=majority'

const joharimod = mods.johari_window;

async function joharifetch(){
    await mongoose.connect(url)
    const conn1 = mongoose.connection
    try{
        tosend = await joharimod.find({},'-determines -score').sort({Q_no:1})
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
        await conn1.close()
          return new Promise(resolve => {
              resolve(tosend)
            });
    }
}


async function johari(data,id){
  await mongoose.connect(url)
  const conn1 = mongoose.connection
  try{
      tosend = await joharimod.find().sort({Q_no:1})
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
      var e=0;
      var f=0;
      for(var i=1;i<=tosend.length;i++){
        try{
          key = i.toString()
          user_response = data[i]
          user_response = Number(user_response)
          obj = tosend[i-1]
          det = obj['determines']
          score = obj['score']
          if(score == false && (user_response == 4 || user_response == 5)){
              if(det){
                  e+=1
              }
              else{
                  f+=1
              }
          }
          else if(score == true && (user_response == 1 || user_response == 2)){
              if(det){
                  e+=1
              }
              else{
                  f+=1
              }
          }
        }
        catch(error){
          await conn1.close()
          return new Promise(resolve => {
            resolve(['Bad Request',400])
          });
        }
      }
      tosend = [{'e':e,'f':f},200]
      if(tosend[0].e > 10 || tosend.f > 10){
        await conn1.close()
        return new Promise(resolve => {
          resolve(['Bad Request',400])
        });
      }
      var ans = [e,f]
      ans = ans.toString()
      ins = await database.exec()
  auth = await ins.query('SELECT * FROM tests_data WHERE user_id = $1 AND tests = 2;',[id])
  if(auth.rows.length == 0){
    await ins.query('INSERT INTO tests_data(user_id, tests, result) VALUES ($1,$2,$3);',[id,2,ans])
  }
  else{
    await ins.query('UPDATE tests_data SET result = $1 WHERE user_id = $2 AND tests = 2',[ans,id])
  }
  tosend = ['OK',200]
    await conn1.close()
    await ins.end()
      return new Promise(resolve => {
          resolve(tosend)
        });

  }
}

module.exports.joharifetch = joharifetch;
module.exports.joharieval = johari;