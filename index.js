const express = require("express");
const cookieParser = require("cookie-parser");
const path = require('path');
const jf = require('./routes/joharifetch.js')
const lf = require('./routes/logbfetch.js')
const mf = require('./routes/mbtifetch')
const authentication = require('./routes/auth');
const { redirect } = require("express/lib/response");
const locker = require('./routes/lock')
const linkworker = require('./routes/datasharing')

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/static'));
app.set('trust proxy', true)

app.get('/', (req,res) =>{
    res.sendFile('pages/landing.html', {root: __dirname })
});

app.get('/login', (req,res) => {
    res.sendFile('pages/login.html', {root: __dirname })
})

app.get('/register', (req,res) => {
    res.sendFile('pages/regform.html', {root: __dirname })
})

app.get('/about', (req,res) => {
    locker.cc(req.cookies['session_cookie']).then((data) =>{
        if(data[1] == 400){
            res.redirect('/')
        }
        else{
            linkworker.getdata(data[0]).then((xyz)=>{
                temp = {'everything':xyz}
                console.log(temp)
                res.render('about.ejs',temp)
            })
            }

    })
    // res.sendFile('pages/about.html', {root: __dirname })
})

app.get('/error/test', (req,res) => {
    res.sendFile('pages/error501.html', {root: __dirname })
})

app.get('/home', (req,res) => {
    locker.cc(req.cookies['session_cookie']).then((data) =>{
        if(data[1] == 400){
            res.redirect('/')
        }
        else{res.sendFile('pages/home.html', {root: __dirname})}

    })
})

app.get('/tests/johari', (req,res) =>{
    locker.cc(req.cookies['session_cookie']).then((data) =>{
        if(data[1] == 400){
            res.redirect('/')
        }
        else{
        
            jf.joharifetch().then((data)=>{
                if(data == '400' || data == 'Nodata'){
                    res.sendFile('pages/error501.html', {root: __dirname });
                }
                res.render('JohariWindow.ejs',{'data':data})
            });
        
        }

    })
});

app.get('/link/gen', (req,res) => {
    locker.cc(req.cookies['session_cookie']).then((data) =>{
        if(data[1] == 400){
            res.redirect('/')
        }
        else{
            res.sendFile('pages/genlinks.html', {root: __dirname})
        }
    })
})

app.get('/mydata', (req,res) =>{
    locker.cc(req.cookies['session_cookie']).then((data) =>{
        if(data[1] == 400){
            res.redirect('/')
        }
        else{
            linkworker.table_fetch(data[0]).then((xyz)=>{
                res.render('viewdata.ejs',{'mydata':xyz})
            })
        }
    })
})


app.get('/mylinks', (req,res) =>{
    locker.cc(req.cookies['session_cookie']).then((data) =>{
        if(data[1] == 400){
            res.redirect('/')
        }
        else{
            linkworker.mylinks(data[0]).then((xyz)=>{
                linkworker.shared_links(data[0]).then((abc) =>{
                    console.log(abc)
                    res.render('managelinks.ejs',{'mydata':xyz,'otherdata':abc})
                })
            });
        }

    })
})

// app.get('/mylinks', (req,res) =>{
//     res.render('managelinks.ejs')
// })

app.get('/tests/logb', (req,res) =>{
    locker.cc(req.cookies['session_cookie']).then((data) =>{
        if(data[1] == 400){
            res.redirect('/')
        }
        else{
            lf.logbfetch().then((data)=>{
                res.render('LOGB.ejs',{'data':data})
            });
        }

    })
    
});

app.get('/tests/mbti', (req,res) =>{
    locker.cc(req.cookies['session_cookie']).then((data) =>{
        if(data[1] == 400){
            res.redirect('/')
        }
        else{
            mf.mbtifetch().then((data)=>{
                res.render('MBTI.ejs',{'data':data})
            });
        }

    })
    
});

app.get('/link/:id', (req,res) => {
//Check if link is valid
linkworker.check(req.params.id).then((data) => {
    console.log(data)
    if(data[1] == 404){
        res.sendFile('pages/error404.html', {root: __dirname });
    }
    else{
        res.cookie('toshare',req.params.id)
        locker.cc(req.cookies['session_cookie']).then((data) =>{
            if(data[1] == 400){
                res.redirect('/register')
            }
            else{
                res.cookie('toshare',req.params.id)
                res.render('sharedata.ejs')
            }
    
        })
    }
})
})

app.post('/link/share', (req,res) =>{
    var result = req.cookies['toshare']
    console.log(req.get('origin'))
    locker.cc(req.cookies['session_cookie']).then((data) =>{
        if(data[1] == 400){
            res.redirect('/')
        }
        else{
            linkworker.adding(data[0],result).then((xyz) => {
                if(xyz[1] == 404){
                    res.sendFile('pages/error404.html', {root: __dirname });
                }
                else{
                    res.redirect('/home')
                }
            })
        }
    })  
})


app.post('/link/gen', (req,res) => {
    locker.cc(req.cookies['session_cookie']).then((data) =>{
        if(data[1] == 400){
            res.redirect('/')
        }
        else{
            linkworker.checkandcreate(data[0],req.body.link,req.body.tests).then((data) => {
                res.send(data)
            })
        }
    })
})


app.post('/tests/logb', (req,res) => {
    locker.cc(req.cookies['session_cookie']).then((data) =>{
        if(data[1] == 400){
            res.redirect('/login')
        }
        else{
            lf.logbeval(req.body,data[0]).then((xyz)=>{
                res.send(xyz)
            });
        }

    })
});

app.post('/tests/johari', (req,res) => {
    locker.cc(req.cookies['session_cookie']).then((data) =>{
        if(data[1] == 400){
            res.redirect('/login')
        }
        else{
            jf.joharieval(req.body,data[0]).then((xyz)=>{
                res.send(xyz)
            });
        }

    })
});

app.post('/tests/mbti', (req,res) => {
    locker.cc(req.cookies['session_cookie']).then((data) =>{
        if(data[1] == 400){
            res.redirect('/login')
        }
        else{
            mf.mbtieval(req.body,data[0]).then((xyz)=>{
                res.send(xyz)
            });
        }

    })
});

app.post('/login', (req,res) => {
    console.log(req.body)
    authentication.login(req.body.username,req.body.pswd).then((data)=>{
        console.log(data)
        if(data[1] == 200){
            res.cookie('session_cookie',String(data[2]));
            res.redirect('/home')
        }
        else{
            res.send(String(data[1]))
        }
    })
});

app.post('/register', (req,res) => {
    console.log(req.body)
    authentication.register(req.body.username,req.body.pswd,req.body.email,req.body.name,req.body.linkedin).then((data)=>{
        console.log(data)
        if(data[1] == 200){
            res.redirect('/login')
        }
        else{
            res.send(String(data[1]))
        }
    })
});

app.get('/logout',(req,res) =>{
    res.cookie('session_cookie','');
    res.clearCookie('session_cookie');
    res.redirect('/')
  })

app.get('*', (req, res) => {
    res.sendFile('pages/error404.html', {root: __dirname });
  });


app.listen(process.env.PORT || 1964, () => console.log("Listening..."));