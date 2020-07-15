const express = require('express');
const process = require('process');
const user = require('./user');

const cors = require('cors');

const app = express();
const port = process.env.PORT || 8080;

// Carrega informações salvas
user.load();
const messages = user.getMessage();
let messageId = 1;

// variaveis referente ao armaazenamento de mensagens
const fs = require("fs")
const filename = `./messages/bate_papo.txt`;

app.use(cors());
app.use(express.json());

/**
 *	 Retorna todas mensagens
 *   @return { JSON[] } messages :  [{item1}, {item2}, ..., {itemN}]
 * 	
 * 	 item = {
 *       id,
 *       date,
 * 		 fromuser,
 * 	     color,
 *       content
 *   }
 * 
 **/
app.get('/messages', (req, res) => {
	res.send(messages);
});

/**
 *	 POsta mensagem no chat e a salva
 *   @param { JSON } req.body
 * 	
 * 	 item = {
 *       id,
 *       date,
 * 		 fromuser,
 * 	     color,
 *       content
 *   }
 * 
 **/
app.post('/messages', (req, res) => { 
	const data = req.body;

	if(messages.length > 0) {
		messageId = parseInt(messages.length + 1);
	}

	messages.push({
		id: messageId,
		date: data.date,
		fromuser: data.fromuser,
		color: data.color,
		content: data.content,
	});
	
	// Escreve a menagem no arquivo.
	fs.appendFile(filename, 
		`${messageId}-${data.date}-${data.fromuser}-${data.color}-${data.content}\n`,
		(err) => (err)? console.error(err) : console.log('succes')
		);

	res.send({});
});

/**
 * Cria e retorna um novo usuário único. 
 * @return { JSON.stringify } user
 * 
 * user = {
 * 		name,
 * 		color
 * }
 */
app.get('/user', (req, res) => {
	const newUser = user.newUSer();
	res.send(JSON.stringify(newUser));
});

app.listen(port, () => console.log(`Ready! Server listening on port ${port}`));