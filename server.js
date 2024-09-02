const express = require('express');
const admin = require('./firebase-config'); // Certifique-se de que este caminho está correto
const app = express();

app.use(express.json());

// Middleware para verificar o token JWT
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Espera "Bearer TOKEN"

  if (token == null) {
    console.log('Token não fornecido');
    return res.status(401).json({ error: 'Token não fornecido' }); // Se não houver token, retorna 401
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    console.log('Token válido', decodedToken);
    next(); // O token é válido, prossegue para a rota protegida
  } catch (error) {
    console.error('Erro ao verificar o token:', error.message);
    res.status(403).json({ error: 'Token inválido' }); // Retorna 403 se o token não for válido
  }
}

// Rota de autenticação
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Autentica o usuário com Firebase Authentication (esta parte é feita no cliente)
    // Obtém o ID token do cliente após a autenticação
    // Este exemplo presume que o cliente já forneceu um ID token válido

    // Verifica se o e-mail está cadastrado no Firebase
    const userRecord = await admin.auth().getUserByEmail(email);
    if (!userRecord) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Simula a criação do ID token (o cliente deve obter o ID token real do Firebase Authentication)
    // O cliente deve autenticar-se e obter o ID token real
    const idToken = await admin.auth().createCustomToken(userRecord.uid); // Apenas um exemplo; substitua pelo ID token real do cliente
    res.status(200).json({ token: idToken });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Rota protegida
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: `Olá ${req.user.email}, esta é uma rota protegida.` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
