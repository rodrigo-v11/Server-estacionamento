import express from 'express';
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient()

const router = express.Router();
 
const JWT_SECRET = process.env.JWT_SECRET

router.post('/cadastro', async (req, res) => {
  try{
    const user = req.body;
    
    if(!user.name || !user.email || !user.password){
      res.status(400).json({message: 'Preencha todos os campos.', user});
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(user.password, salt);

    const userdb = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashpassword,
      },
    });
    res.status(200).json(userdb);
  }catch(err){
    if (err.code === 'P2002') { // Código do Prisma para violação de unicidade (placa já cadastrada)
      return res.status(400).json({ message: 'Placa já cadastrada.' });
  }
    res.status(500).json({message: 'Erro ao cadastrar usuário, tente novamente mais tarde.'});  
  }
});

router.post('/login', async (req, res) => {
    try{
    const userInfo = req.body; 
    const user = await prisma.user.findUnique({
      where: {email: userInfo.email },
    })
    if(!user){
      res.status(404).json({message: 'Usuário não encontrado.'});
      return;
    }
    const validPassword = await bcrypt.compare(userInfo.password, user.password);
    if(!validPassword){
      res.status(400).json({message: 'Senha inválida.'});
      return;
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    const Userid = user.id

    res.status(200).json({ token , Userid});
    
  }catch(err){
    res.status(500).json({message: 'Erro ao logar usuário, tente novamente mais tarde.'}); 
    return; 
  }
});

export default router;