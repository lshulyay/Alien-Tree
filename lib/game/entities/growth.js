ig.module( 
	'game.entities.growth'
)
.requires(
	'impact.entity'
)
.defines(function(){
EntityFruit = ig.Entity.extend({
	size: {x: 5, y:5},
	active: true,
	clickable: true,
	healthValue: 1,
	health: 5,
	lifetime: 1,
	gravityFactor: 0,
	maxVel: {x: 500, y: 500},
	minBounceVelocity: 0,
	bounciness: 0.5,
	friction: { x: 0, y:0 },
	radius: 0,
	targetRadius: 0,
	minRadius: 5,
	maxRadius: 20,
    growthInterval: 50,
    posVariation: {x: 10, y: 10},
    sizeVariation: 5,
    zIndex: 5,
    alpha: 1,
	growthSpeed: 0.7,
	onGround: false,

	type: ig.Entity.TYPE.B,
	collides: ig.Entity.COLLIDES.PASSIVE,


	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.growthSpeed = this.growthSpeed * ig.game.coreSpeed;
		this.targetRadius = ig.game.controller.randomFromTo(this.minRadius, this.maxRadius);
		this.lifetime = this.targetRadius / 3;
		this.lifetimeTimer = new ig.Timer(this.lifetime);
		this.size.x = this.targetRadius * 2;
		this.size.y = this.targetRadius * 2;
	},

	update: function() {
		this.parent();
		if (this.radius < this.targetRadius) {
			this.radius += this.growthSpeed;
		}

		if (this.health < 1) {
			ig.game.controller.fadeToDeath(this);
		}

		if (this.lifetimeTimer.delta() > 0 && this.gravityFactor === 0) {
			ig.game.controller.healthMod(this,-this.health);
		}
	},

	collideWith: function ( other, axis ) {
		if (!this.onGround && this.pickedFruit) {
			this.onGround = true;
			ig.game.fruitDropSound.play();
		}
	},

	clicked: function() {
		if (!ig.game.tool.pickedUp) {
			this.pickedFruit = true;
			this.gravityFactor = 500;
			this.active = false;
			ig.game.fruitCollected++;
		}
	},

	draw: function() {
		ig.game.ctx.save();
		ig.game.ctx.beginPath();
		ig.game.ctx.arc(this.pos.x + this.size.x / 2 - ig.game.screen.x, this.pos.y + this.size.y / 2 - ig.game.screen.y, this.radius, 0 , 2 * Math.PI, false);
		ig.game.ctx.fillStyle = 'rgba(' + ig.game.tree.fruitColor.color1.r + ',' + ig.game.tree.fruitColor.color1.g + ',' + ig.game.tree.fruitColor.color1.b + ',' + this.alpha + ')';
		ig.game.ctx.fill();
		ig.game.ctx.lineWidth = 2;
		ig.game.ctx.strokeStyle = 'rgba(' + ig.game.tree.fruitColor.color2.r + ',' + ig.game.tree.fruitColor.color2.g + ',' + ig.game.tree.fruitColor.color2.b + ',' + this.alpha + ')';
		ig.game.ctx.stroke();
		ig.game.ctx.restore();
	}
});


EntityLeaf = ig.Entity.extend({
	size: {x: 1, y:1},
	active: true,
	healthValue: 1,
	health: 5,
	gravityFactor: 0,
	radius: 0,
	targetRadius: 0,
	minRadius: 20,
	maxRadius: 80,
    growthInterval: 50,
    posVariation: {x: 10, y: 10},
    sizeVariation: 5,
    zIndex: 3,
    alpha: 0.5,
    kind: 'leaf',
	growthSpeed: 0.5,

	type: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER,


	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		this.growthSpeed = this.growthSpeed * ig.game.coreSpeed;
		this.targetRadius = ig.game.controller.randomFromTo(this.minRadius, this.maxRadius);
		this.health = this.targetRadius / 10;
		this.healthValue = this.health;
		ig.game.controller.healthMod(this.parentEntity,this.healthValue);
		var randInt = ig.game.controller.randomFromTo(0,3);
		if (randInt === 0) {
			this.zIndex = 5;
		}
		ig.game.sortEntitiesDeferred();
	},

	update: function() {
		this.parent();
		if (this.radius < this.targetRadius) {
			this.radius += this.growthSpeed;
		}

		if (this.health < 1) {
			ig.game.controller.fadeToDeath(this);
		}

	},

	draw: function() {
		ig.game.ctx.save();
		this.radgrad = ig.game.ctx.createRadialGradient(this.pos.x, this.pos.y, 0, this.pos.x, this.pos.y, this.radius);
		
		this.radgrad.addColorStop(0,'rgba(' + ig.game.tree.leafColor.color1.r + ',' + ig.game.tree.leafColor.color1.g + ',' + ig.game.tree.leafColor.color1.b + ',' + this.alpha + ')');
		this.radgrad.addColorStop(0.75,'rgba(' + ig.game.tree.leafColor.color2.r + ',' + ig.game.tree.leafColor.color2.g + ',' + ig.game.tree.leafColor.color2.b + ',' + this.alpha + ')');

		ig.game.ctx.beginPath();
		ig.game.ctx.arc(this.pos.x - ig.game.screen.x, this.pos.y - ig.game.screen.y, this.radius, 0 , 2 * Math.PI, false);
		ig.game.ctx.fillStyle = this.radgrad;
		ig.game.ctx.fill();
		ig.game.ctx.lineWidth = 2;
		ig.game.ctx.restore();
	}
});
});