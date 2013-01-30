ig.module( 
	'game.entities.tree'
)
.requires(
	'impact.entity'
)
.defines(function(){
EntityTree = ig.Entity.extend({
	// Core
	size: {x: 50, y:50},
	gravityFactor: 0,
	friction: {x: 0, y: 0},
    zIndex: 4,
    branchColor: {b1: 255, b2: 255, b3: 255},
    alpha: 1,
	active: true,
   //	pickedUp: false,
	clickable: false,

	// Watering 
	minWater: 0,
	water: 30,
	maxWater: 60,
	waterDepletion: 1,
	waterDamagePerTick: 1,
	waterDepletionTimer: null,
	overwaterFill:  {r:0,g:109,b:231},
	underwaterFill: {r:88,g:51,b:3},
	waterIndicatorFillstyle: {r: 255, g: 255, b: 255},
	waterIndicatorAlpha: 0,
	// Health
	healthDepletion: 1,
	damagePerTick: 0,
	deathCauses: {
				dehydration: false,
				overwatering: false},
	health: 1,
	idealHealth: 1,

	// Growth
    growthRate: 10,
    growthSpeed: 0.5,
    growthTimer: null,
    growthInterval: 50,
	startedGrowing: false,
    posVariation: {x: 10, y: 10},
    sizeVariation: 5,
    branchPosVariation: {x: 10, y: 25},
    allTreeNodes: [],
    allBranchNodes: [],
    allTrunkNodes: [],

	// Branch and Trunk
    branchQuantity: 0,
    trunkQuantity: 0,

    // Fruit and Leaves
    fruitColor: {color1: {r: null, g: null, b: null},
				color2: {r: null, g: null, b: null}},

    leafColor: {color1: {r: null, g: null, b: null},
				color2: {r: null, g: null, b: null}},

	type: ig.Entity.TYPE.NEVER,
	collides: ig.Entity.COLLIDES.NEVER,

    animSheet: new ig.AnimationSheet( 'media/seed.png', 50, 50 ),

	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		ig.game.sortEntitiesDeferred();
		this.ctx = ig.system.context;
		ig.game.tree = this;
        this.anims.Idle = new ig.Animation( this.animSheet, 1, [0] );
        this.anims.Watered = new ig.Animation( this.animSheet, 1, [1]);
        this.currentAnim = this.anims.Idle;


	//	this.branchColor = 'rgba(255, 255, 255, ' + this.alpha + ')';
		this.growthSpeed = this.growthSpeed * ig.game.coreSpeed;
		this.growthTimer = new ig.Timer(this.growthRate);
		this.waterDepletionTimer = new ig.Timer(this.waterDepletion);
		this.healthDepletionTimer = new ig.Timer(this.healthDepletion);
		this.growthTimer.pause();
		if (ig.game.currentLevel === LevelTitle) {
			this.waterSeed();
			this.growthRate = 10;
		}

		else if (ig.game.currentLevel === LevelMain) {
			this.growthRate = 5;
			this.fruitColor.color1 = ig.game.controller.pickRandomColor(0,255,0,200,0,200);
			this.fruitColor.color2 = {r: 0, g: 0, b: 0};
		//	this.fruitColor.color2 = ig.game.controller.pickRandomColor();
			this.leafColor.color1 = ig.game.controller.pickRandomColor(0,255,0,255,0,255);
			this.leafColor.color2 = ig.game.controller.pickRandomColor(0,255,0,255,0,255);
			this.waterIndicatorFillstyle = {r: 255, g: 255, b: 255};
		//	this.underwaterFill = {r:88,g:51,b:3};
		//	this.overwaterFill = {r:0,g:109,b:231};


		}
	},

	update: function() {
		this.parent();
		if (ig.game.currentLevel === LevelMain) {
			if (this.startedGrowing) {
				this.growTree();
				this.depleteWater();
				this.depleteHealth();
			}
			if (this.idealHealth < this.health) {
				this.idealHealth = this.health;
				this.healthPercentage = ig.game.controller.calcPercentage(this.health,this.idealHealth);
			}
			this.updateWaterIndicator();
			if (this.health === 0 && !ig.game.gameover) {
				ig.game.gameover = true;
				ig.game.tip = ig.game.controller.generateTip();
				ig.game.spawnEntity(EntityTrigger, ig.system.width / 2 - 36, ig.system.height / 5 + 70 + 25 + 44 + 44, {kind: 'begin', size: {x: 70, y: 28}});

			}
		}

		else if (ig.game.currentLevel === LevelTitle) {
			this.growTree();
		}
	},

/*	clicked: function() {
        console.log('clicking tool!');
        if (!this.pickedUp) {
            console.log('picking up');
            this.pickedUp = true;
            this.gravityFactor = 0;
            // this.size = {x: 5, y: 5};
        }

        else {
        	this.dropSeed();
        }
	}, 

    dropSeed: function() {
        console.log('dropping');
        this.pickedUp = false;
        this.gravityFactor = 500;
        this.collides = ig.Entity.COLLIDES.NEVER;
        if (this.pos.y > ig.game.ground.pos.y) {
            this.pos.y = ig.game.ground.pos.y - 100;
        }
        this.size = {x: 50, y: 50};
    }, */

	setWaterDepletionTimer: function(value) {
		this.waterDepletion = value;
		this.waterDepletionTimer.set(this.waterDepletion);
	},

	updateWaterIndicator: function() {
		if (this.water < this.minWater + 10) {
			this.waterIndicatorFillstyle = {r: this.underwaterFill.r, g: this.underwaterFill.g, b: this.underwaterFill.b};
			if (this.waterIndicatorAlpha < 1) {
				this.waterIndicatorAlpha += 0.005;
			}
		}
		else if (this.water > this.maxWater - 10) {
			this.waterIndicatorFillstyle = {r: this.overwaterFill.r, g: this.overwaterFill.g, b: this.overwaterFill.b};

		//	this.waterIndicatorFillstyle = 'rgba(0,109,231,' + this.waterIndicatorAlpha + ')';
			if (this.waterIndicatorAlpha < 1) {
				this.waterIndicatorAlpha += 0.005;
			}
		}

		else if (this.water <= this.maxWater - 10 && this.water >= this.minWater + 10) {
			// this.waterIndicatorFillstyle = {r: this.overwaterFill.r, g: this.overwaterFill.g, b: this.overwaterFill.b};

			if (this.waterIndicatorAlpha >= 0.011) {
				this.waterIndicatorAlpha -= 0.01;
			}

			else if (this.waterIndicatorAlpha <= 0.1) {
				this.waterIndicatorFillstyle = {r: 255, g: 255, b: 255};
			}
		}
	},

	growTree: function() {
		if (this.growthTimer) {
			if (this.growthTimer.delta() > 0) {
				ig.game.controller.updateAllTreeNodes();
				ig.game.controller.checkBranchGrowth();
				for (var i = 0; i < ig.game.tree.allTreeNodes.length; i++) {
					var node = ig.game.tree.allTreeNodes[i];
					if (node.pos.x === node.endPos.x && node.pos.y === node.endPos.y && node.active && node.kind === 'trunk') {
					//	console.log('growing');
						ig.game.controller.growTrunk();
					}

					if (node.pos.x === node.endPos.x && node.pos.y === node.endPos.y && node.active && node.kind === 'branch') {
						ig.game.controller.growBranch(node);
					//	ig.game.controller.growFruit();
					}
				}
				// this.mainTimer.reset();
				if (ig.game.currentLevel === LevelMain) {
					ig.game.controller.growFruit();
				//	ig.game.controller.checkDisease();
					ig.game.controller.checkEnvironment();
				}
				this.growthTimer.reset();
			}
		}
	},

	depleteWater: function() {
		if (this.waterDepletionTimer.delta() > 0) {
			this.water--;
			this.waterDepletionTimer.reset();
			if (this.water < 0 && !this.deathCauses.dehydration) {
				this.deathCauses.dehydration = true;
				this.updateDpt(1);
			}
			else if (this.water >= 0 && this.deathCauses.dehydration) {
				this.deathCauses.dehydration = false;
				this.updateDpt(-1);
			}
			
			if (this.water > this.maxWater && !this.deathCauses.overwatering) {
				this.deathCauses.overwatering = true;
				this.updateDpt(1);
			}
			else  if (this.water <= this.maxWater && this.deathCauses.overwatering) {
				this.deathCauses.overwatering = false;
				this.updateDpt(-1);
			}
		}
	},

	depleteHealth: function() {
		if (this.healthDepletionTimer.delta() > 0 && ig.game.tree.allTreeNodes.length > 0) {
		//	console.log('damage: ' + this.damagePerTick);
			this.damageTree(this.damagePerTick);
			this.healthDepletionTimer.reset();
		}
	},

	damageTree: function(damage) {
		var entityToDamage = null;
		if (ig.game.getEntitiesByType(EntityLeaf).length > 0) {
			entityToDamage = ig.game.controller.pickRandomLeaf();
		}
		else if (this.branchQuantity > 0) {
			entityToDamage = ig.game.controller.pickRandomNode('branch');
		}
		else if (this.trunkQuantity > 0) {
			entityToDamage = ig.game.controller.pickRandomNode('trunk');
		}
		if (entityToDamage) {
			ig.game.controller.healthMod(entityToDamage,-damage);
		}
	},

	updateGrowthTimer: function(rate) {
		this.growthTimer.set(rate);
	},

	updateDpt: function(value) {
		this.damagePerTick += value;
	},

	waterSeed: function() {
	//	this.clickable = false;
    //    this.currentAnim = this.anims.Watered;
		var posX = this.pos.x + ig.game.controller.randomFromTo(-this.posVariation.y,this.posVariation.y);
		var posY = this.pos.y - this.growthInterval + ig.game.controller.randomFromTo(-this.posVariation.x,this.posVariation.x);
		var size = this.size.x - 5 + ig.game.controller.randomFromTo(-this.sizeVariation,this.sizeVariation);
		ig.game.spawnEntity(EntityTreeNode, this.pos.x, this.pos.y, {parentEntity: this, endPos: {x: posX, y: posY}, size: {x: size, y: size}, kind: 'trunk'});
		ig.game.controller.updateAllTreeNodes();
		
		this.active = false;
		this.updateGrowthTimer(this.growthRate);
		this.growthTimer.unpause();
		this.startedGrowing = true;
	},

	waterTree: function(amount) {
		if (!this.startedGrowing) {
			this.waterSeed();
		}
		if (ig.game.tree.allTreeNodes.length > 0) {
			this.water += amount;
		//	var node = null;
			if (!this.deathCauses.overwatering) {
				if (this.branchQuantity > 0) {
					var node = ig.game.controller.pickRandomNode('branch');
					if (node) {
						ig.game.controller.healthMod(node,amount);
					}
				}
			}

			else if (this.deathCauses.overwatering) {
			//	console.log('removing health watering');
				this.damageTree(this.waterDamagePerTick);
			/*	if (this.branchQuantity > 0) {
					var leaf = ig.game.controller.pickRandomLeaf();
					if (leaf) {
						console.log('dam leaf');
						ig.game.controller.healthMod(leaf,-this.waterDamagePerTick);
					}
				} */
			}
		}
	},

	draw: function() {
		if (ig.game.currentLevel === LevelTitle) {
			this.ctx.fillStyle = 'rgba(' + this.branchColor.b1 + ',' + this.branchColor.b2 + ',' + this.branchColor.b3 + ',' + this.alpha + ')';
			this.ctx.fillRect(this.pos.x,this.pos.y,this.size.x,this.size.y);
		}
	//	this.ctx.fillStyle = 'rgba(88,51,3,' + this.underwaterAlpha + ')';
	//	this.ctx.fillRect(this.pos.x,this.pos.y,this.size.x,this.size.y);
		if (ig.game.currentLevel === LevelMain) {
		//	console.log('drawing this: ' + this.waterIndicatorFillstyle + ' alpha: ' + this.waterIndicatorAlpha);
			// Water indicator
		//	console.log('fillstyle: ' + this.waterIndicatorFillstyle + ' alpha: ' + this.waterIndicatorAlpha)
			if (this.startedGrowing) {
				ig.game.ctx.fillStyle = 'rgba(' + this.branchColor.b1 + ',' + this.branchColor.b2 + ',' + this.branchColor.b3 + ',' + this.alpha + ')';
				ig.game.ctx.fillRect(this.pos.x - ig.game.screen.x,this.pos.y - ig.game.screen.y,this.size.x,this.size.y);
				

				//this.ctx.fillStyle = 'rgba(' + this.waterIndicatorFillstyle.r + ',' + this.waterIndicatorFillstyle.g + ',' + this.waterIndicatorFillstyle.b + ',' + this.waterIndicatorAlpha + ')';
				//this.ctx.fillRect(this.pos.x,this.pos.y,this.size.x,this.size.y);

				// add linear gradient
				var grd = ig.game.ctx.createLinearGradient(this.pos.x + this.size.x, this.pos.y, this.pos.x + this.size.x, this.pos.y + this.size.y);
				grd.addColorStop(0, '#ffffff');
				// dark blue
				grd.addColorStop(1, 'rgba(' + this.waterIndicatorFillstyle.r + ',' + this.waterIndicatorFillstyle.g + ',' + this.waterIndicatorFillstyle.b + ',' + this.waterIndicatorAlpha + ')');
				ig.game.ctx.fillStyle = grd;
				ig.game.ctx.fillRect(this.pos.x - ig.game.screen.x, this.pos.y - ig.game.screen.y, this.size.x, this.size.y);
			}
			if (!this.startedGrowing) {
				this.parent();
			}

		}

	}
});


EntityTreeNode = ig.Entity.extend({
	size: {x: 1, y: 1},
	pos: {x: 0, y: 0},
	gravityFactor: 0,
	maxVel: {x: 500, y: 500},
	minBounceVelocity: 0,
	bounciness: 0,
	friction: { x: 200, y: 200 },
	deathTime: 1,

	active: true,
	parentEntity: null,
	branchParent: false,
	branchId: null,
	kind: null,
//	onGround: false,

    growthInterval: 50,
    posVariation: {x: 10, y: 10},
    sizeVariation: 5,
    endPosX: null,
    sizeY: null,
    zIndex: 4,
    branchColor: {b1: 255, b2: 255, b3: 255},
    alpha: 1,

    healthValue: 1,
    idealHealth: 1,
    health: 1,
    childEntity: null,

    // Conditions
    diseased: false,
    freezing: false,
    heatLevel: 0,
    startedHeating: false,
    heatingCheck: 0,

	type: ig.Entity.TYPE.B,
	collides: ig.Entity.COLLIDES.NEVER,


//	animSheet: new ig.AnimationSheet( 'media/gui/next.png', 300, 150 ),

	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.parentEntity.childEntity = this;
	//	console.log('child entity: ' + this.parentEntity.childEntity);
		ig.game.sortEntitiesDeferred();
		ig.game.controller.updateAllTreeNodes();

		if (this.size.x < 4) {
			this.active = false;
			this.lastBranch = true;
		}

		if (ig.game.currentLevel === LevelMain) {
			this.healthValue = Math.round(this.size.x / 4);
			if (this.healthValue < 1) {
				this.healthValue = 1;
			}
			ig.game.controller.healthMod(ig.game.tree,this.healthValue);
			this.healthPercentage = ig.game.controller.calcPercentage(this.health,this.idealHealth);
		//	ig.game.controller.updateBranchColors(this);

			this.deathTimer = new ig.Timer(this.deathTime);
			this.deathTimer.pause();
		}
	},

	update: function() {
		this.parent();
		if (this.endPos) {
			if (this.pos.x > this.endPos.x) {
				this.pos.x -= ig.game.tree.growthSpeed;
			}
			else if (this.pos.x < this.endPos.x) {
				this.pos.x += ig.game.tree.growthSpeed;
			}

			if (this.pos.y > this.endPos.y) {
				this.pos.y -= ig.game.tree.growthSpeed;
			}
			else if (this.pos.y < this.endPos.y) {
				this.pos.y += ig.game.tree.growthSpeed;
			}

			// if (ig.game.currentLevel === LevelTitle) {
				this.growAllNodes();
			//	console.log('growth timer lol ' + this.active);

			// }
		}

		if (ig.game.currentLevel === LevelMain) {
			if (this.kind === 'branch' && this.diseased) {
				this.runDisease();
			}

			else if (this.freezing) {
				this.runFreeze();	
			}

			else if (this.unfreezing) {
				this.runUnfreeze();
			}

			else {
				switch (true) {
					case (this.healthPercentage < 50 && this.healthPercentage > 40):
						this.branchColor.b1 = ig.game.controller.transitionColor(this.branchColor.b1,226);
						this.branchColor.b2 = ig.game.controller.transitionColor(this.branchColor.b2,226);
						this.branchColor.b3 = ig.game.controller.transitionColor(this.branchColor.b3,226);
						break;
					case (this.healthPercentage <= 40 && this.healthPercentage > 30):
						this.branchColor.b1 = ig.game.controller.transitionColor(this.branchColor.b1,198);
						this.branchColor.b2 = ig.game.controller.transitionColor(this.branchColor.b2,198);
						this.branchColor.b3 = ig.game.controller.transitionColor(this.branchColor.b3,198);
						break;
					case (this.healthPercentage <= 30 && this.healthPercentage > 20):
						this.branchColor.b1 = ig.game.controller.transitionColor(this.branchColor.b1,171);
						this.branchColor.b2 = ig.game.controller.transitionColor(this.branchColor.b2,171);
						this.branchColor.b3 = ig.game.controller.transitionColor(this.branchColor.b3,171);
						break;
					case (this.healthPercentage <= 20 && this.healthPercentage > 10):
						this.branchColor.b1 = ig.game.controller.transitionColor(this.branchColor.b1,142);
						this.branchColor.b2 = ig.game.controller.transitionColor(this.branchColor.b2,142);
						this.branchColor.b3 = ig.game.controller.transitionColor(this.branchColor.b3,142);
						break;
					case (this.healthPercentage <= 10):
						this.branchColor.b1 = ig.game.controller.transitionColor(this.branchColor.b1,102);
						this.branchColor.b2 = ig.game.controller.transitionColor(this.branchColor.b2,102);
						this.branchColor.b3 = ig.game.controller.transitionColor(this.branchColor.b3,102);
						break;
					}
			}

			if (this.health <= 0 && this.gravityFactor === 0) {
				ig.game.branchCrackSound.play();
				ig.game.controller.killBranch(this);
				this.deathTimer.unpause();
			}

			if (this.deathTimer.delta() > 0) {
				ig.game.controller.fadeToDeath(this);
			}
		}
	},

	growAllNodes: function() {
		if (this.pos.x === this.endPos.x && this.pos.y === this.endPos.y && this.active && this.kind === 'trunk') {
		//	console.log('growing');
			ig.game.controller.growTrunk();
		}

		if (this.pos.x === this.endPos.x && this.pos.y === this.endPos.y && this.active && this.kind === 'branch') {
			ig.game.controller.growBranch(this);
		}
	},

	adjustAlpha: function() {
		if (this.alpha > this.targetAlpha) {
			this.alpha -= 0.05;
		}

		else if (this.alpha < this.targetAlpha) {
			this.alpha += 0.05;
		}
	},

	/* clicked: function() {
		var posX = this.pos.x + ig.game.controller.randomFromTo(-this.posVariation.y,this.posVariation.y);
		var posY = this.pos.y - this.growthInterval + ig.game.controller.randomFromTo(-this.posVariation.x,this.posVariation.x);
		var size = this.size.x - 5 + ig.game.controller.randomFromTo(-this.sizeVariation,this.sizeVariation);
		ig.game.spawnEntity(EntityTreeNode, posX, posY, {parentEntity: this, size: {x: size, y: size}});
		this.active = false;
	}, */

	// CONDITIONS
	runDisease: function() {
		this.branchColor.b1 = ig.game.controller.transitionColor(this.branchColor.b1, 255);
		this.branchColor.b2 = ig.game.controller.transitionColor(this.branchColor.b2, 0);
		this.branchColor.b3 = ig.game.controller.transitionColor(this.branchColor.b3, 0);
		ig.game.controller.healthMod(this,-0.01);
	//	console.log('health: ' + this.health);
		if (this.healthPercentage < 50 && this.parentEntity) {
			if (!this.parentEntity.diseased && !this.parentEntity.freezing) {
				this.parentEntity.diseased = true;
			}
		}
	},

	runFreeze: function() {
		this.branchColor.b1 = ig.game.controller.transitionColor(this.branchColor.b1, 0);
		this.branchColor.b2 = ig.game.controller.transitionColor(this.branchColor.b2, 130);
		this.branchColor.b3 = ig.game.controller.transitionColor(this.branchColor.b3, 184);
		if (this.size.x <= 5) {
			ig.game.controller.healthMod(this,-0.01);
		}
		else {
			ig.game.controller.healthMod(this,-0.001);
		}
	//	this.checkHeat();
		if (this.healthPercentage < 50 && this.parentEntity) {
			if (!this.parentEntity.freezing) {
				this.parentEntity.freezing = true;
			}
		}
	},

	runUnfreeze: function() {
		this.branchColor.b1 = ig.game.controller.transitionColor(this.branchColor.b1, 255);
		this.branchColor.b2 = ig.game.controller.transitionColor(this.branchColor.b2, 255);
		this.branchColor.b3 = ig.game.controller.transitionColor(this.branchColor.b3, 255);
		if (this.branchColor.b1 === 255 && this.branchColor.b2 === 255 && this.branchColor.b3 === 255) {
			this.unfreezing = false;
		}
		//	ig.game.controller.healthMod(this,-0.001);
	//	this.checkHeat();
	/*	if (this.healthPercentage < 50 && this.parentEntity) {
			if (!this.parentEntity.freezing) {
				this.parentEntity.freezing = true;
			}
		} */
	},


	checkHeat: function() {
		if (this.heatingCheck === 0 && this.touches(ig.game.pointer)) {
			this.heatingCheck = 1;
			this.heatLevel++;
		//	console.log('heat level 1: ' + this.heatLevel);
		}
		else if (this.parentEntity && this.heatingCheck === 1 && this.parentEntity.touches(ig.game.pointer)) {
			this.heatingCheck = 0;
			this.heatLevel++;
		//	console.log('heat level 2: ' + this.heatLevel);
		}
		if (this.heatLevel > 10) {
			this.freezing = false;
			this.unfreezing = true;
		}
	},

	draw: function() {
		ig.game.ctx.save();
		ig.game.ctx.fillStyle = 'rgba(' + this.branchColor.b1 + ',' + this.branchColor.b2 + ',' + this.branchColor.b3 + ',' + this.alpha + ')';
		ig.game.ctx.fillRect(this.pos.x - ig.game.screen.x,this.pos.y - ig.game.screen.y,this.size.x,this.size.y);
		ig.game.ctx.beginPath();
		if (this.kind === 'trunk') {
			// If a trunk is pruned or dies, sever connection with previous node
			if (this.parentEntity === null || this.health <= 0 && this.parentEntity.health > 0) {
				ig.game.ctx.fillRect(this.pos.x - ig.game.screen.x, this.pos.y - ig.game.screen.y,this.size.x,this.size.y);
				if (this.parentEntity !== null) {
					this.parentEntity = null;
				}
			}

			else {
				ig.game.ctx.moveTo(this.parentEntity.pos.x - ig.game.screen.x, this.parentEntity.pos.y - ig.game.screen.y);
				ig.game.ctx.lineTo(this.parentEntity.pos.x + this.parentEntity.size.x - ig.game.screen.x, this.parentEntity.pos.y - ig.game.screen.y);
				ig.game.ctx.lineTo(this.pos.x + this.size.x - ig.game.screen.x, this.pos.y - ig.game.screen.y);
				ig.game.ctx.lineTo(this.pos.x - ig.game.screen.x, this.pos.y - ig.game.screen.y);
			}

		}

		else if (this.kind === 'branch') {

			// If a branch is pruned or dies, sever connection with previous node
			if (this.parentEntity === null || this.health <= 0 && this.parentEntity.health > 0) {
				ig.game.ctx.fillRect(this.pos.x - ig.game.screen.x, this.pos.y - ig.game.screen.y,this.size.x,this.size.y);
				if (this.parentEntity !== null) {
					this.parentEntity = null;
				}
			}

			else {
				// Draw main branch
				ig.game.ctx.moveTo(this.parentEntity.pos.x - ig.game.screen.x, this.parentEntity.pos.y - ig.game.screen.y);
				ig.game.ctx.lineTo(this.parentEntity.pos.x - ig.game.screen.x,this.parentEntity.pos.y + this.parentEntity.size.y - ig.game.screen.y);
				ig.game.ctx.lineTo(this.pos.x - ig.game.screen.x, this.pos.y + this.size.y - ig.game.screen.y);
				ig.game.ctx.lineTo(this.pos.x - ig.game.screen.x, this.pos.y - ig.game.screen.y);
            	//ig.game.ctx.strokeStyle = '#ff0000';
            	//ig.game.ctx.lineWidth = 10;
			}
		//	ig.game.mainFont.draw(this.health + '/' + this.idealHealth, this.pos.x, this.pos.y - 15, ig.Font.ALIGN.LEFT);


		}
		ig.game.ctx.closePath();
		ig.game.ctx.fill();

		ig.game.ctx.restore();
	}

});
});