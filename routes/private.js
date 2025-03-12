import express from 'express';
import { PrismaClient } from '@prisma/client';
import auth from '../middlewares/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// Listar usuários
router.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true
            }
        });
        res.status(200).json({ message: 'Usuários listados com sucesso', users });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao buscar usuários, tente novamente mais tarde.' });
    }
});

// Rota para listar os carros de um usuário
router.get('/user/:userId/carros', auth, async (req, res) => {
    const userId = req.params.userId; // Usando o userId da URL, não do token
    try {
        const carros = await prisma.userCarros.findMany({
            where: { userId: userId } // Filtrando carros por userId
        });

        // Em vez de retornar 404, retornamos 200 com a lista vazia
        res.status(200).json({ carros }); // Se carros for vazio, retornará []
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao carregar carros.' });
    }
});

//deletar carros
router.delete('/carros/:carroId', auth, async (req, res) => {
    const { carroId } = req.params; // ID do carro a ser excluído
    const userId = req.userId; // ID do usuário autenticado

    try {
        const carro = await prisma.userCarros.findUnique({
            where: { id: carroId },
        });

        
        if (!carro || carro.userId !== userId) {
            return res.status(404).json({ message: 'Carro não encontrado ou não autorizado.' });
        }

        await prisma.userCarros.delete({
            where: { id: carroId },
        });

        res.status(200).json({ message: 'Carro deletado com sucesso.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao deletar o veículo.' });
    }
});

// Cadastro de Carro
router.post('/cadastroCarro', async (req, res) => {
    try {
        const { nameCarro, placa, cor, marca, userId } = req.body;

        // Verificação de campos obrigatórios
        if (!nameCarro || !placa || !cor || !marca || !userId) {
            return res.status(400).json({ message: 'Preencha todos os campos corretamente.' });
        }

        // Criando o carro no banco
        const novoCarro = await prisma.userCarros.create({
            data: {
                nameCarro,
                placa,
                cor,
                marca,
                userId // Incluindo o userId
            },
        });

        res.status(201).json({ message: 'Carro cadastrado com sucesso!', novoCarro });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erro ao cadastrar veículo, tente novamente mais tarde.' });
    }
});

export default router;
