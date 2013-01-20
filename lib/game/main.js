ig.module( 
	'game.main'
)
.requires(
	// Impact Core
	'impact.game',
	'impact.font',

	// Entities
	'game.entities.tree',
	'game.entities.pointer',
	'game.entities.growth',
	'game.entities.ground',
	'game.entities.tool',
	'game.entities.trigger',
	'game.entities.sky',

	// Levels
	'game.levels.main',
	'game.levels.title',

	// Plugins
	'game.director.controller',

	// Other
	'impact.debug.debug'
)
.defines(function(){

MyGame = ig.Game.extend({
	
	// Load a font
	font: new ig.Font( 'media/04b03.font.png' ),
	titleFont: new ig.Font('media/titlefont.png'),
	mainFont: new ig.Font('media/mainfont.png'),
	smallFont: new ig.Font('media/smallfont.png'),

	// Music
	mainMusic: new ig.Sound('media/music/music.*'),

	controller: new ig.Controller(),
	currentLevel: null,
	gravity: 1,
	coreSpeed: 0.5,		// growthSpeed of tree is always multiplied by coreSpeed - main pace of the game.
	allTreeNodes: [],	// All branch or trunk nodes of the tree
	currentYear: 0,		// How man years have passed since start of game
	fruitCollected: 0,
	gameover: false,
	tip: null,			// Shows up on the Game Over screen

	init: function() {
		// Key Bindings
		ig.input.bind( ig.KEY.MOUSE1, 'click' );
		this.ctx = ig.system.context;
		this.loadLevel(LevelTitle);
		ig.music.add( this.mainMusic, ['mainmusic'] );
		ig.music.volume = 0;

	},

	loadLevel: function( data ) {
		this.currentLevel = data;
		this.parent( data );
		this.spawnEntity( EntityPointer, 0, 0 );
		// Reset all tree stats
		this.allTreeNodes.length = 0;
		this.currentYear = 0;
		this.fruitCollected = 0;
		this.gameover = false;
		if (this.currentLevel === LevelMain) {
			ig.game.controller.updateAllTreeNodes();
			this.coreSpeed = 0.5;
			this.spawnEntity(EntityTree, ig.system.width/2 - 25, ig.system.height - 152);
			this.spawnEntity(EntitySky, 0, 0);
			this.spawnEntity(EntityGround, 0, ig.system.height - 100);
			this.spawnEntity(EntityTool, ig.game.tree.pos.x - 200, ig.system.height - 200, {kind: 'prune'});
			this.spawnEntity(EntityTool, ig.game.tree.pos.x - 300, ig.system.height - 200, {kind: 'water'});
			this.spawnEntity(EntityTool, 0, ig.system.height - 200, {kind: 'test'});
			ig.music.play(['mainmusic']);
		//	this.mainTimer = new ig.Timer(0.3);
		}
		else if (this.currentLevel === LevelTitle) {
			this.coreSpeed = 1;
			this.spawnEntity(EntityTree, ig.system.width/3, ig.system.height - 100);
			this.spawnEntity(EntityTrigger, this.tree.pos.x + 50, ig.system.height / 5 + 70 + 44, {kind: 'begin', size: {x: 70, y: 28}});
			this.spawnEntity(EntityTrigger, this.tree.pos.x + 50, ig.system.height / 2 + 50, {kind: 'jhowe', size: {x: 400, y: 20}});
			this.spawnEntity(EntityTrigger, this.tree.pos.x + 50, ig.system.height / 2 + 90, {kind: 'gameicons', size: {x: 300, y: 20}});
		//	this.mainTimer = new ig.Timer(0.3);
		}
	},

	update: function() {
		// Update all entities and backgroundMaps
		this.parent();
	},
	
	// Draw main title screen on LevelTitle
	drawTitle: function() {
		if (this.tree) {
			var x = this.tree.pos.x + 50;
			var y = ig.system.height / 5;
			this.titleFont.draw( 'Alien Tree', x, y, ig.Font.ALIGN.LEFT );
			y += 70;
			this.mainFont.draw("Don't kill anything.", x, y, ig.Font.ALIGN.LEFT);
			y += 44;
			ig.game.mainFont.draw('Begin.', x, y, ig.Font.ALIGN.LEFT);
		}
	},

	drawCredits: function() {
		if (this.tree) {
			var x = this.tree.pos.x + 50;
			var y = ig.system.height / 2;
			this.mainFont.draw( 'Thank you...', x, y, ig.Font.ALIGN.LEFT );
			y += 35;
			x += 15;
			this.smallFont.draw( 'Jonathan Howe for music', x, y, ig.Font.ALIGN.LEFT );
			y += 15;
			this.smallFont.draw( 'www.youtube.com/user/TodayIWillprobably', x, y, ig.Font.ALIGN.LEFT );
			y += 25;
			this.smallFont.draw( 'GameIcons for tool sprites', x, y, ig.Font.ALIGN.LEFT );
			y += 15;
			this.smallFont.draw( 'www.game-icons.net', x, y, ig.Font.ALIGN.LEFT );
		}
	},

	// Draw text in main level
	drawLevelText: function() {
		if (ig.game.tree && !this.gameover) {
		/*	var x = 0;
			var y = 0;
			this.mainFont.draw("Tree health: " + ig.game.tree.health, x, y, ig.Font.ALIGN.LEFT);
			y += 25;
			this.mainFont.draw("Max tree health: " + ig.game.tree.idealHealth, x, y, ig.Font.ALIGN.LEFT);
			y += 25;
			this.mainFont.draw("Tree water: " + ig.game.tree.water, x, y, ig.Font.ALIGN.LEFT);
			y += 25;
			this.mainFont.draw("DPT: " + ig.game.tree.damagePerTick, x, y, ig.Font.ALIGN.LEFT); */
			var y = 5;
			var x = ig.system.width - 5;
			this.mainFont.draw("Year " + this.currentYear, x, y, ig.Font.ALIGN.RIGHT);
			y += 25;
			this.mainFont.draw(this.fruitCollected + " pieces of fruit collected", x, y, ig.Font.ALIGN.RIGHT);
		}
	},

	// Game over text appears on same level as main.
	drawGameOver: function() {
		if (this.gameover) {
			var x = ig.system.width / 2,
				y = ig.system.height / 5;
			this.titleFont.draw( 'You killed it', x, y, ig.Font.ALIGN.CENTER );
			y += 70;
			this.mainFont.draw(this.tip, x, y, ig.Font.ALIGN.CENTER);
			y += 44;
			ig.game.mainFont.draw('Begin.', x, y, ig.Font.ALIGN.CENTER);
		}
	},

	// Main draw function
	draw: function() {
	//	ig.system.context.clearRect( 0 ,0, ig.system.realWidth, ig.system.realHeight );

		// Draw all entities and backgroundMaps
		this.parent();
		if (this.currentLevel === LevelTitle) {
			this.drawTitle();
			this.drawCredits();
		}

		else {
			this.drawLevelText();
			this.drawGameOver();
		}

		// To ensure buttons are always clickable, draw them last and on top of everything else.
		var triggers = this.getEntitiesByType(EntityTrigger);
		for (var i = 0; i < triggers.length; i++) {
			var trigger = triggers[i];
			trigger.draw();
		}
	}
});

ig.main( '#canvas', MyGame, 60, window.innerWidth, window.innerHeight, 1 );
// window.addEventListener('resize', resizeCanvas, false);

// Function to resize canvas on window resize. Currently unsued. Add event listener if required.
function resizeCanvas() {
	console.log('resizing');
	ig.system.resize(window.innerWidth,window.innerHeight, 1);
}

});
