const colorsCollection = require('./colors');
const adjectivesCollection = require('./adjectives');
const animalsColletion = require('./animals');

// Variáveis dos arquivos
const fs = require("fs")
const filename = `./messages/bate_papo.txt`;

// Usernames, Colors já escolhidos e todas mensagem do Chat.
const username = [];
const colors = [];
const messagesStored = [];

/** 
 * @return { JSON[] } Retorna as mensagens carregadas em messagesStored
 * 
 */ 
function getMessage() {
    return messagesStored;
}

/**
 * @function load
 * 
 * Lê todas mensagens salvas e busca todos usuarios e carrega as variaveis necessarias:
 * message: 1 - 12/03/1991 - name_fulano - cor_user - message_'\n'
 * message: 2 - 12/03/1991 - name_fulana - cor_user - message_'\n'
 * 
 */
async function load() {
    // Read files: https://tutorialedge.net/nodejs/reading-writing-files-with-nodejs/
    await fs.readFile(filename, 'utf8', (err, data) => {
        if(err) 
            console.log(err);
        
            if(!data)
                return;

        let messages = [];
        messages = data.split('\n');
    
        // Se não mensagens...
        if(messages.length < 1) return;
    
        // carrega todas mensagens anteriores
        messages.forEach((message) => {
            const segMessage = message.split('-');
            messagesStored.push({
                id: segMessage[0],
                date: segMessage[1],
                fromuser: segMessage[2],
                color: segMessage[3],
                content: segMessage[4],
            });
          
            // Carrega usuário
            if(!username.includes(segMessage[2])) {
                username.push(segMessage[2]);
                colors.push(segMessage[3]);
            }      
        });
    });
}

/** @argument { any[] } arr */
function randomItemFromArray (arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * @return { JSON } retorna um novo usuário com um nome e cor únicas.
 */
function newUSer() {

	let name = `${randomItemFromArray(adjectivesCollection)} ${randomItemFromArray(animalsColletion)}`;

	// Bonus 2: Garante que novo usuario não tem um nome e cor repetido.
	while(username.includes(name)) {
        // Busca o número no final do nome.
        let number = name.match(/\d+/);

		// Elimina números do nome.
		name = name.replace(/\d+/g,'');

		// adiciona um número ao final
		if(number == null)
			name = name + '1';
        
        // acrescenta o ID no final do nome.
		else {
			let num = parseInt(number) + 1;
			name = name + num.toString();
		}
	}

    // Escolhe uma cor que não escolhida.
	let color = randomItemFromArray(colorsCollection);	
	while(colors.includes(color)) color = randomItemFromArray(colorsCollection);
	
	const user = {
		name: name,
		color: color,
    }
    
    // Adiciona a coleção
    username.push(name);
    colors.push(color);

	return user;
}

module.exports = {
    newUSer, load, getMessage
}