const bcrypt = require('bcryptjs');

// Senha que você quer criptografar
const senha = '08111997'; // Substitua pela senha desejada

// Gerar o hash da senha
bcrypt.hash(senha, 10, (err, hash) => {
    if (err) {
        console.error('Erro ao gerar hash:', err);
    } else {
        console.log('Senha:', senha);
        console.log('Hash gerado:', hash);
    }
});