const express = require('express')
const jwt = require('jsonwebtoken')
const crypto = require('crypto') 
const Users = require('../models/Users')
const { isAuthenticated } = require('../auth')

const router = express.Router()


const signToken = (_id) => {
    return jwt.sign({ _id }, 'mi-secreto', {
        expiresIn: 60 * 60 * 24 * 365,
    })
}
//ruta del registro de usuario
router.post('/register', (req,res) => { 
    const { email, password } = req.body
    //bytes aleatorios     
    crypto.randomBytes(16, ( err, salt) => {
        //transforma la variable tipo buffer a tipo string de base 64
        const newSalt = salt.toString('base64')
        //se encripta el password,  pbkdf2(password, salt, iteraciones, longitud de la llave, algoritmo, función callback)
        crypto.pbkdf2(password, newSalt, 10000, 64, 'sha1', (err, key) => {
            const encryptedPassword =  key.toString('base64')
            //consultamos si el usuario está en la base de datos
            Users.findOne({ email }).exec()
                .then( user => {
                    if(user){
                        return res.send('El usuario ya existe')
                    }
                    //se crea el usuario
                    Users.create({
                        email,
                        password: encryptedPassword,
                        salt: newSalt,
                    }).then(() => {
                        res.send('Usuario creado con éxisto')
                    })
                })
        })
    })
})

router.post('/login', (req, res) => { 
    const { email, password } = req.body
    Users.findOne({ email }).exec()
        .then(user => { 
            if(!user){
                console.log("error")
                return res.send('Usuario y/o contraseña incorrectas')
            }else{
                crypto.pbkdf2(password, user.salt , 10000, 64, 'sha1', (err, key) => {
                    const encryptedPassword = key.toString('base64')
                    if(user.password === encryptedPassword){
                        const token = signToken(user._id)
                        return res.send({ token })
                    }
                    res.send('Usuario y/o contraseña incorrectas')
                })
            }
            
        })
})

router.get('/me', isAuthenticated, (req, res) => {
    res.send(req.user)
})

module.exports = router