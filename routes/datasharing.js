const database = require('./postgress')
// 1 - LOGB
// 2 - Johari
// 3 - MBTI
async function checkandcreate(id,link,tests){
    var re = new RegExp('^[a-z0-9]+$','i');
    link = encodeURIComponent(link)
    console.log(link)
    console.log(re.test(link))
    if(link.length <= 15 && re.test(link)){
//Check if link is taken
    ins = await database.exec()
    auth = await ins.query('SELECT * FROM HR_links WHERE links = $1',[link])
    if(auth.rows.length != 0){
        await ins.end()
        return new Promise(resolve => {
            resolve(['Taken',401])
          });
    }
    else{
        //Check if tests are valid
        // tests = tests.slice(1, -1);
        split_string = tests.split(",");
        for(var i = 0; i<split_string.length; i++){
            try{
                if(Number(split_string[i]) > 0 && Number(split_string[i]) < 4){
                    continue;
                }
                else{
                    await ins.end()
                    return new Promise(resolve => {
                        resolve(['Bad Request',400])
                      });
                }
            }
            catch(err){
                await ins.end()
                return new Promise(resolve => {
                    resolve(['Bad Request',400])
                  });
            }
        }
        await ins.query('INSERT INTO HR_links(user_id,links) VALUES($1, $2)',[id,link])
        for(var i = 0; i<split_string.length; i++){
            await ins.query('INSERT INTO links_test(link,tests) VALUES($1, $2)',[link,Number(split_string[i])])
        }
        await ins.end()
        return new Promise(resolve => {
            resolve(['OK',200])
          });
        // await ins.query('INSERT INTO HR_links(user_id,links) VALUES($1, $2)',[id,link])
    }
    }
    await ins.end()
    return new Promise(resolve => {
        resolve(['Error',400])
      });
}

async function check(link){
    var re = new RegExp("^[a-z0-9]+$",'i');
    link = encodeURIComponent(link)
    if(link.length <= 15 && re.test(link)){
//Check if link is taken
    ins = await database.exec()
    auth = await ins.query('SELECT * FROM HR_links WHERE links = $1',[link])
    console.log(auth.rows)
    if(auth.rows.length != 0){
        await ins.end()
        return new Promise(resolve => {
            resolve(['OK',200])
          });
    }
}
await ins.end()
return new Promise(resolve => {
    resolve(['Not Found',404])
  });
}

async function adding(id,link){ // Allow link to access your data
    var re = new RegExp("^[a-z0-9]+$",'i');
    link = encodeURIComponent(link)
    console.log(re.test(link))
    if(link.length <= 15 && re.test(link)){
//Check if link is taken
    ins = await database.exec()
    auth = await ins.query('SELECT * FROM HR_links WHERE links = $1;',[link])
    console.log(auth.rows)
    if(auth.rows.length != 0){
        c = await ins.query('SELECT * FROM data_sharing WHERE link = $1 AND user_id = $2;',[link,id])
        // console.log(c.rows)
        if(c.rows.length == 0){
            await ins.query('INSERT INTO data_sharing(user_id,link) VALUES ($1,$2);',[id,link])
        }
        console.log('kkkk')
        await ins.end()
        return new Promise(resolve => {
            resolve(['OK',200])
          });
    }
}
await ins.end()
return new Promise(resolve => {
    resolve(['Not Found',404])
  });
}

async function getdata(id){ //My Test Data

    ins = await database.exec()
    auth = await ins.query('SELECT * FROM tests_data WHERE user_id = $1',[id])
    var tempo = {};
    var str;
    for(var lmn = 0; lmn<auth.rows.length; lmn ++){
        mno = auth.rows[lmn]['tests']
        if(mno == 1){str='LOGB'}
        else if(mno == 2){str='Johari'}
        else{str='MBTI'}
        tempo[String(str)] = String(auth.rows[lmn]['result'])  

    }
    await ins.end()
    return new Promise(resolve => {

        resolve(tempo)

      });

}

async function mylinks(id){ //What links do I own
    ins = await database.exec()
    auth = await ins.query('SELECT tests, link FROM links_test WHERE link in (SELECT links FROM HR_links WHERE user_id=$1)',[id])
    await ins.end()
    return new Promise(resolve => {
        resolve(auth.rows)
      });
}

async function shared_links(id){
    ins = await database.exec()
    auth = await ins.query('SELECT link FROM data_sharing WHERE user_id=$1',[id])
    // auth = await ins.query('SELECT link FROM data_sharing')
    console.log(auth)
    await ins.end()
    return new Promise(resolve => {
        resolve(auth.rows)
      });
}

async function table_fetch(id){
    ins = await database.exec()
    auth = await ins.query('SELECT hr_links.links, user_reg.username, user_reg.email, links_test.tests, tests_data.result FROM hr_links INNER JOIN data_sharing on hr_links.links = data_sharing.link INNER JOIN user_reg on data_sharing.user_id = user_reg.user_id INNER JOIN links_test on data_sharing.link = links_test.link INNER JOIN tests_data on links_test.tests = tests_data.tests AND user_reg.user_id = tests_data.user_id where hr_links.user_id = $1',[id])
    //console.log(auth)
    await ins.end()
    return new Promise(resolve => {
        resolve(auth.rows)
      });
}

module.exports.checkandcreate = checkandcreate
module.exports.check = check
module.exports.adding = adding
module.exports.getdata = getdata
module.exports.mylinks = mylinks
module.exports.shared_links = shared_links
module.exports.table_fetch = table_fetch