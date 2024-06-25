import express from "express"
import cors from 'cors'
//importamos la conexión a la DB
import db from "./database/db.js"
//importamos nuestro enrutador
import publicRoutes from './routes/routes.js'
import protectedRoutes from './routes/authRoute.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use('/', publicRoutes)
app.use('/auth', protectedRoutes)


try {
    await db.authenticate()
    console.log('Conexión exitosa a la DB')
} catch (error) {
    console.log(`El error de conexión es: ${error}`)
}

/* app.get('/', (req, res)=>{
    res.send('HOLA MUNDO')
}) */

app.listen(8000, () => {
    console.log('Server UP running in http://localhost:8000/')
})