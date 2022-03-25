const mongoose = require('mongoose');
const mods = require('./mongmodels.js');
const url = 'mongodb+srv://psychology:0OuU0jBK8jLCcElE@cluster0.kee1v.mongodb.net/psychology1?retryWrites=true&w=majority'

const joharimod = mods.johari_window;

async function johari(data){
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
        tosend = {'e':e,'f':f}
      await conn1.close()
        return new Promise(resolve => {
            resolve(tosend)
          });

    }
}
//{'1':'2'} where key is qno and value is answer
johari({'1':'5','2':'2','3':'2','4':'4','5':'5'}).then((data) => {
    console.log(data)
})