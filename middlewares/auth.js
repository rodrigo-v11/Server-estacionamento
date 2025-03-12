import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

const auth = (req, res, next) => {
    
    const token = req.headers.authorization;

    console.log(token);
    if (!token){ return res.status(401).json({ message: 'Acesso negado.' });} 
    
    try {
        const verified = jwt.verify(token.replace('Bearer ',''), JWT_SECRET);
        req.userId = verified.id ;
        
    } catch (err) {
        res.status(400).json({ message: 'Token inválido.' });
        return;
    }

    next();
};

export default auth;