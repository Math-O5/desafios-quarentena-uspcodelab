const serverAddress = 'http://localhost:8080';
const messageFormElement = document.getElementById('message-form');
const messagesContainerElem = document.getElementById('messages-container');
const messageTemplateElem = document.getElementById('message-template');
const userInfoElem = document.querySelector('#info-user-container div');
const userButtonElem = document.querySelector('#info-user-container form');

const monthNames = ["January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December"];

/**
* @typedef {{
	text: string,
	sender: { name: string, color: string },
}} Message This is the type a message
* should assume. */

/**
 * @type { Message[] }
 * This variable will hold all messages that were already
* rendered to the client.
*/
const renderedMessages = [];

/*
* This is an IIFE (Immediatly involked function expression). An IIFE is a function
* that is called immediatly after it's declaration, without really storing it into
* a variable. This pattern is commonly used in JavaScript to allow for "scoped"
* functions (functions that are only visible inside the scope), or to group logic
* into a single scope.
* Learn more about IIFE here:
* https://developer.mozilla.org/en-US/docs/Glossary/IIFE
*/
/** @argument { any[] } arr */
function randomItemFromArray (arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

let myself;

(async() => {
	// This part is to store the "self" into the localstorage. This is to allow for
	// the user to come back as themselves later.
	// The localstorage save info session in the broswer of the user.
	// https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
	const myselfSession = localStorage.getItem('self-info');
	if (myselfSession) {
		parseMyself = JSON.parse(myselfSession);
		setInfoUser(parseMyself);
		myself = parseMyself;
		return;
	}

	try {
		const response =  await fetch(`${serverAddress}/user`, {
			 								headers: { 'Content-Type': 'application/json' },
										});
										
		const newMyself = await response.json();
		localStorage.setItem('self-info', JSON.stringify(newMyself));
		console.log('new user', newMyself);
		setInfoUser(newMyself);
		myself = newMyself;
	} catch(e) {
		console.log('Error ao  trocar nome e cor\n', e);
	}
})();


/**
 * Calcula a data e format MM DD, YYYY
 * @returns { string } Date from now
 */
function answerDate() {
    let date  = new Date();
    let month = monthNames[date.getMonth()];
    let day   = String(date.getDate()).padStart(2, '0');
	let year  = date.getFullYear();
	let hour = date.getHours();
	let minute = date.getMinutes();
    return month + ' ' + day  + ',' + year + ': ' + hour + ':' + minute;
}

// Function executed when the user "sends" the message
/**
 * This is an event. It fires when the user press send. Then, it identify the user who press the button,
 * create an object to put the name of the user and his message.  
 */
messageFormElement.addEventListener('submit', event => {
	event.preventDefault();

	// Data no formato DD/MM/AA
	const date = answerDate();
	
	// Selects the input from the form
	const messageElement = messageFormElement.querySelector('input[name=message-value]');
	const messageText = messageElement.value;
	if (!messageText) return;

	// Envia mensagem
	const message = { 
		content: messageText, 
		fromuser: myself.name, 
		color: myself.color, 
		date: date 
	};
	sendMessageToServer(message);

	// Clears the message text input
	messageElement.value = '';
});

/**
 * Cria um novo usuário, atualiza as informações e recarrega a página.
 */
userButtonElem.addEventListener('submit', async(event) => {
	event.preventDefault();
	try {
		const response =  await fetch(`${serverAddress}/user`, {
			headers: {'Content-Type': 'application/json'},
		});
		const newMyself = await response.json();
		myself = newMyself;
		//setInfoUser(newMyself);
		localStorage.setItem('self-info', JSON.stringify(newMyself));
		window.location.reload();
	} catch(e) {
		console.log('Error ao  trocar nome e cor\n', e);
	}
});

/**
 * 
 * @param { JSON } myself {name, color}
 * Atualiza as informações no panel esquerdo. 
 */
function setInfoUser(myself) {
	userInfoElem.innerHTML = `<h2>Ùser:</h2> ${myself.name} <h3>Color:</h3><p>${myself.color}</p>`;
}

/**
* @argument { Message } message
* This send the message to the server, and insert the http headers.
*/
async function sendMessageToServer (message) {
	try {
		await fetch(`${serverAddress}/messages`, {
			body: JSON.stringify(message),
			headers: { 'Content-Type': 'application/json' },
			method: 'POST',
		});
	} catch (e) {
		console.error(e);
	}
}

/**
 * @argument { Message } message
 * Create the label where the user read the message.
 */
function createMessageOnUI (message) {
	const messageNode = messageTemplateElem.content.cloneNode(true);
	const messageContainerElement = messageNode.querySelector('.message-container');
	const messageNameElement = messageNode.querySelector('.message-name');
	const messageTextElement = messageNode.querySelector('.message-text');
	
	messageContainerElement.setAttribute("id", message.id);
	messageNameElement.innerHTML = '<p>' +  message.date + '</p>' + ' ' + '<h3>' + message.fromuser + '<\h3>';
	messageNameElement.style.color = message.color;
	messageTextElement.innerText = message.content;	

	// If I was the sender, push the message element to the right
	if (message.fromuser === myself.name) {
		messageContainerElement.style.marginLeft = 'auto';
	}
	
	messagesContainerElem.appendChild(messageNode);
}

/**
 * This update all message from the server./
 */
async function fetchMessagesFromServer () {
	if(!myself) return;
	
	/** @type { Message[] } */
	let data = [];
	try {
		// Note that, by deafault, the `fetch` function makes uses a `GET` request method.
		const resp = await fetch(`${serverAddress}/messages`);
		data = await resp.json();
	} catch (e) {
		console.error(e);
		return;
	}
	
	if(!data.length) return;
	/**
	 * Contains all messages returned from the server that were not yet rendered.
	 * The ideia is that if the array of messages on the server is larger than the
	 * array of messages on the client, then that means some messages are new.
	 * Since the messages are placed in order on the array, you just have to get the
	 * last elements of the server message's array.
	 */
	const unrenderedMessages = data.slice(renderedMessages.length);
	
	unrenderedMessages.forEach(newMessage => {
		createMessageOnUI(newMessage);
		renderedMessages.push(newMessage);
	});
}

setInterval(fetchMessagesFromServer, 500);