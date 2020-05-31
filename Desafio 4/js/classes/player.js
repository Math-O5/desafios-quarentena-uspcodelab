const PLAYER_SIZE = new Vector(50, 50);

/**
* This is a class declaration
* This class is responsible for defining the player behavior
* There should be only one player in the game, so this is a Singleton class.
* If you'd like to know more about the singleton pattern, see this link:
* https://en.wikipedia.org/wiki/Singleton_pattern
*
* There should be only one player in the game, so this is a Singleton class.
* If you'd like to know more about the singleton pattern, see this link:
* https://en.wikipedia.org/wiki/Singleton_pattern
*
* This class extends the Entity class, which is responsible for binding the element's
* positons and directions. If you'd like to know more about class inheritance in javascript, see this link
* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes#Sub_classing_with_extends
*/
class Player extends Entity {
	/**
	* Will hold the player instance
	* @type { Player | null }
	*/
	static instance = null;

	/**
	* @argument { HTMLDivElement } containerElement The HTML element in which the player should be created
	*/
	constructor (containerElement) {
		// The `super` function will call the constructor of the parent class.
		// If you'd like to know more about class inheritance in javascript, see this link
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes#Sub_classing_with_extends
		super(containerElement, PLAYER_SIZE, new Vector(0, -120));

		// Assigns the player's image to it's element
		this.rootElement.style.backgroundImage = "url('assets/player.svg')";

		// Creates the player's hook instance.
		const hookOffset = new Vector(0, PLAYER_SIZE.y / 2 + HOOK_SIZE.y / 2 - 10);
		const hookPosition = this.position.add(hookOffset);
		// The onGoldHooked.bind is a function that will bind the `this` variable to it's
		// proper value. If you'd like to know more about this, see this link
		// https://www.freecodecamp.org/news/function-prototype-bind-and-function-prototype-length-in-javascript-explained/
		this.hook = new Hook(containerElement, hookPosition, this.onGoldHooked.bind(this));

		// Will hold the player's total score.
	    this.score = 0;

		// Will holde the player's dinamit amount
		this.dinamits = 3;

		Player.instance = this;
	}

	/**
	* This funtion will be called whenever the hook catches gold, and it updates the
	* player's total score
	* @argument { Gold } goldElement
	*/
	onGoldHooked (goldElement) {
		this.score += goldElement.calculateScore();
		InfoGame.atualizaScore(this.score);
		GameMap.instance.verifyIfLevelIsOver();
		GameMap.instance.gameOver();
	}

	throwHook () {
		this.hook.throw();
	}

	releaseHook () {
		// if there is no diminat to thow out
		if(this.dinamits === 0) return;
		this.dinamits--;
		InfoGame.atualizarDinamite(this.dinamits);
		this.hook.releaseHook();
	}
}