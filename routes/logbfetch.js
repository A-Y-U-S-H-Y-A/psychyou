const mongoose = require('mongoose');
const mods = require('./mongmodels.js');
const url = 'mongodb+srv://psychology:0OuU0jBK8jLCcElE@cluster0.kee1v.mongodb.net/psychology1?retryWrites=true&w=majority'
const database = require('./postgress')
const logbmod = mods.logb;

async function logbfetch(){
    await mongoose.connect(url)
    const conn1 = mongoose.connection
    try{
        tosend = await logbmod.find().sort({Q_no:1})
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
// logbfetch().then((data)=>{
//     console.log(data)
// });

async function logbeval(data,id){
  var l=0;
  var o=0;
  var g=0;
  var b=0;
  for(var i=1;i<=Object.keys(data).length;i++){
    try {
      key = i.toString()
      user_response = data[i]
      // user_response = user_response.slice(1, -1);
      split_string = user_response.split(",");
      l += Number(split_string[0])
      o += Number(split_string[1])
      g += Number(split_string[2])
      b += Number(split_string[3]) 
    } catch (error) {
      return new Promise(resolve => {
        resolve(['Bad Request',400])
      });
    }
  }
  if(l + o + g + b != 100){
    return new Promise(resolve => {
      resolve(['Bad Request',400])
    });
  }
  temp = []
  temp.push(l);
  temp.push(o);
  temp.push(g);
  temp.push(b);

  var indexOfMaxValue = temp.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);
  var thevalue= temp[indexOfMaxValue]
  var ans = ''
  if(temp[0] == thevalue){ans = ans.concat('L')}
  if(temp[1] == thevalue){ans = ans.concat('O')}
  if(temp[2] == thevalue){ans = ans.concat('G')}
  if(temp[3] == thevalue){ans = ans.concat('B')}

  ins = await database.exec()
  auth = await ins.query('SELECT * FROM tests_data WHERE user_id = $1 AND tests = 1;',[id])
  console.log(auth)
  if(auth.rows.length == 0){
    await ins.query('INSERT INTO tests_data(user_id, tests, result) VALUES ($1,$2,$3);',[id,1,ans])
  }
  else{
    await ins.query('UPDATE tests_data SET result = $1 WHERE user_id = $2 AND tests = 1',[ans,id])
  }
  await ins.end()
  return new Promise(resolve => {
      resolve([ans,200])
    });
}
//{'1':'[1,2,3,4]'} where key is qno and value is array of LOGB in String Format
// logbeval({'1':'[1,2,3,4]','2':'[4,1,2,3]','3':'[4,2,3,1]'}).then((data) => {
// console.log(data)
// })

module.exports.logbfetch = logbfetch
module.exports.logbeval = logbeval