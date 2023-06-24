const qr = require('qrcode');
const {findOrCreate , User} = require('../models/model.db')
const home =  (req,res)=>{
    res.render('info');
}
const login = (req , res)=>{
    res.render('login')
}

const create =  (req,res)=>{
    res.render('create_Links')
}


const admin= (req, res)=>{
    res.render('my_qrcode');
}
const getNameOfUser =  (req,res)=>{
    const name = req.params.name;
    User.findOne({name : name})
        .then(result =>{
            res.render('data' , {
                name : result.name,
                links:result.links,
                numLinks : result.num_links,
            })
        }).catch(err => res.render('error' , {error : err} ))
}

const getAdminName = (req ,res)=>{
    const name = req.params.name;
    User.findOne({name : name})
        .then(result =>{
            res.render('Admin' , {
                name : result.name,
                links:result.links,
                numLinks : result.num_links,
                qrCodeUrl : result.qrcodeImg,
            })
        })
        .catch(err => res.render('error' , {error : 'invalid name or create new QR code '} ))
}

const setAdmin = (req, res)=>{
    const username = req.body.username;
    User.findOne({name : username})
        .then(()=>{
            res.redirect(`admin/${username}`)
        }).catch(err => res.render('error' , {error : err}))
}

const deleteItem =  (req,res)=>{
    const deleted_Link = req.body.delete;
    const name = req.body.Client_name;
    console.log( name, deleted_Link);
    User.findOneAndUpdate({name : name} ,
        {
            $pull:{links: { _id : deleted_Link } } })
        .then(()=>{
            console.log('success deleted');
            res.redirect(`/Admin/${name}`)
        })
        .catch(err => res.render('error' , {error : err}))
}

 const qr_codeName =  (req,res)=> {
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
}



const submit =  async (req, res) => {
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
}

module.exports = {
    home,
    login,
    admin,
    create,
    submit,
    setAdmin,
    deleteItem,
    qr_codeName,
    getAdminName,
    getNameOfUser,
}