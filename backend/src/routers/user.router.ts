import {Router} from 'express';
import { sample_users } from '../data';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { User, UserModel } from '../models/user.model';
import { HTTP_BAD_REQUEST } from '../constants/http_status';
import bcrypt from 'bcryptjs';
import dbConnect from "../configs/database.config";
const router = Router();

router.get("/seed", asyncHandler(
    async (req, res) => {
        const usersCount = await UserModel.countDocuments();
        if(usersCount> 0){
            res.send("Seed is already done!");
            return;
        }

        await UserModel.create(sample_users);
        res.send("Seed Is Done!");
    }
))

router.post("/login", asyncHandler(
    async (req, res) => {
        const { email, password } = req.body;

        try {
            // Realiza la consulta para obtener el usuario con el correo electrónico proporcionado
            const user = await dbConnect`
        SELECT * FROM "user"
        WHERE email = ${email}
      `;

            if (user.length === 0) {
                // Si no se encuentra ningún usuario con el correo electrónico proporcionado, devuelve un error
                res.status(HTTP_BAD_REQUEST).send("Usuario o contraseña inválido!");
                return;
            }

            // Obtén el primer usuario de la lista (debería haber solo uno)
            const userData = user[0];

            // Compara la contraseña proporcionada con la contraseña almacenada en la base de datos
            if (await bcrypt.compare(password, userData.password)) {
                // Si las contraseñas coinciden, genera un token de autenticación y responde con él
                res.send(generateTokenReponse(userData));
            } else {
                // Si las contraseñas no coinciden, devuelve un error
                res.status(HTTP_BAD_REQUEST).send("Usuario o contraseña inválido!");
            }
        } catch (error) {
            // Si ocurre un error durante la consulta, devuelve un error de servidor
            console.error("Error durante el login:", error);
            res.status(500).send("Error interno del servidor!");
        }
    }
));


//se modificó el endpoint para que guarde los datos del usuario en BD postgres
router.post('/register', asyncHandler(
    async (req, res) => {
        const {name, email, password, address} = req.body;
        const encryptedPassword = await bcrypt.hash(password, 10);

        //constante que guarda los datos del usuario en la BD, espera la respuesta de la BD
        //se cambiaron las variables con mayusculas por minusculas ya que se cambió de mongo a postgres y provoca error
        const dbUser = await dbConnect `insert into "user" (name, email, password, address, isadmin) 
        values (${name}, ${email}, ${encryptedPassword}, ${address}, false) returning *`;

        res.send(generateTokenReponse(dbUser));
    }
))

const generateTokenReponse = (user : any) => {
    const token = jwt.sign({
        id: user.id, email:user.email, isadmin: user.isadmin
    },'Secreto',{
        expiresIn:"30d"
    });

    return {
        id: user.id,
        email: user.email,
        name: user.name,
        address: user.address,
        isadmin: user.isadmin,
        token: token
    };
}


export default router;
