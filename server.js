const ejs = require('ejs');
const qr = require('qrcode');
const path = require('path');
const express = require('express');
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const http = require('http');
const app = express();



app.set('view engine' , 'ejs' );
app.set('views' , path.join(__dirname,'views'));
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect("mongodb+srv://admin-mansour:Mansour1372001@cluster0.sqscyxb.mongodb.net/QrCode", { useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error);
    });
const Qrcode_Schema = mongoose.Schema({
    name:String,
    links:[
        {
            socialName:String,
            link:String,
        }
    ],
    qrcodeImg: String ,
    num_links:Number,
})
Qrcode_Schema.statics.createUser = function(userData) {
    return this.create(userData);
};


const User = mongoose.model('User' , Qrcode_Schema)

app.use(express.static(path.join(__dirname, 'public')));


const findOrCreate = async (name)=>{
    try {
        let user = await User.findOne({ name:name });
        if (!user) {
            user = await User.createUser({ name });
        }
        return user;
    } catch (error) {
        console.log(error);
        throw error;
    }
}


app.get('/' , (req,res)=>{
    res.render('info');
})
app.get('/login',(req , res)=>{
    res.render('login')
})

app.get('/create' , (req,res)=>{
    res.render('create_Links')
})

app.get('/data/:name' , (req,res)=>{
    const name = req.params.name;
    User.findOne({name : name})
        .then(result =>{
            res.render('data' , {
                name : result.name,
                links:result.links,
                numLinks : result.num_links,
            })
        }).catch(err => res.render('error' , {error : err} ))
})

app.get('/admin/:name' , (req ,res)=>{
    const name = req.params.name;
    User.findOne({name : name})
        .then(result =>{
            res.render('Admin' , {
                name : result.name,
                links:result.links,
                numLinks : result.num_links,
                qrCodeUrl : result.qrcodeImg,
            })
        }).catch(err => res.render('error' , {error : 'invalid name or create new QR code '} ))
})

app.get('/admin' , (req, res)=>{
res.render('my_qrcode');
})
app.post('/admin' ,(req, res)=>{
    const username = req.body.username;
    User.findOne({name : username})
        .then(()=>{
            res.redirect(`admin/${username}`)
        }).catch(err => res.render('error' , {error : err}))
})

app.post('/delete' , (req,res)=>{
    const deleted_Link = req.body.delete;
    const name = req.body.Client_name;
    console.log( name, deleted_Link);
    User.findOneAndUpdate({name : name} ,
        {
        $pull:{links: {_id :deleted_Link } } })
        .then(()=>{
            console.log('success deleted');
            res.redirect(`/Admin/${name}`)
        })
        .catch(err => res.render('error' , {error : err}))
  })

app.get('/qr-code/:name?',(req,res)=> {
        const username = req.params.name;

        let url = `https://qr-code-qxdk.onrender.com/data/${username}`;
        let jsonData = JSON.stringify(url);
        qr.toDataURL(jsonData,(err,qrResponse)=>{
            if(err)
                res.render('error' , {error: 'QR code generation failed.'})
            else {
                User.findOneAndUpdate({name:username} , {qrcodeImg : qrResponse})
                    .then(()=>{
                        res.render('qr-code', {qrCodeUrl: qrResponse, username: username});
                    }).catch(err =>res.render('error' , {error:err}))
            }
        })
})



app.post('/submit', async (req, res) => {
    try {
        let name_of_user = req.body.username;
        let links_with_ref = [];
        let numLinks = +req.body.linkCount;
        for (let i = 1; i <= numLinks; i++) {
            let link = req.body[`link${i}`];
            let Name = req.body[`name${i}`];
            let socialName = Name.charAt(0).toUpperCase() + Name.slice(1).toLowerCase()
            links_with_ref.push({ socialName , link });
        }


        const user = await findOrCreate(name_of_user);

        user.links.push(...links_with_ref);
        user.num_links = numLinks;

        await user.save();

        res.redirect(`/qr-code/${name_of_user}`);
    } catch (error) {
        console.log(error);
        res.render('error', { error: error });
    }
});



const port = 8080;

http.createServer(app).listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
