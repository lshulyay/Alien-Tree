/* This controller class contains most tree growing functions and some generic utility functions */
ig.module(
	'game.director.controller'
)
.requires(
	'impact.impact'
)
.defines(function(){

ig.Controller = ig.Class.extend({
	acidRain: { chance: 2,
				active: false},
	snow: { chance: 2,
			active: false},

	quake: {	chance: 2,
				active: false},

	conditionDanger: 0,

	init: function() {
	},

	checkEnvironment: function() {
		// Checking acid rain
		var chance = this.randomFromTo(0,70);
		if (chance <= this.acidRain.chance && !this.acidRain.active && !this.snow.active && ig.game.currentYear >= 5) {
		//	console.log('snow active: ' + this.snow.active);
			this.acidRain.active = true;
			var velX = ig.game.controller.randomFromTo(-50,50);
			for (var i = 0; i < 800; i++) {
				ig.game.spawnEntity(EntityWeather, 0,0, {vel: {x: velX, y: 100}, kind: 'acidrain', danger: this.acidRain.chance});
			}
		}
		else {
			// Checking snow chance
			chance = this.randomFromTo(0,70);
		//	console.log('snow chance: ' + chance);
			if (chance <= this.snow.chance && !this.snow.active && !this.acidRain.active) {
				this.snow.active = true;
				for (var i = 0; i < 300; i++) {
					var velX = ig.game.controller.randomFromTo(-50,50);
			//		console.log('snowing');
					ig.game.spawnEntity(EntityWeather, 0,0, {vel: {x: velX, y: 100}, kind: 'snow', danger: this.snow.chance});
				}
			}

			else {
				chance = this.randomFromTo(0,70);
				if (chance <= this.quake.chance && ig.game.currentYear >= 3) {
					this.quake.active = true;
					ig.game.screenShaker.timedShake(100, 4); // visual effect
					this.destroyRandomBranches();
				}
			}
		}
	},

	destroyRandomBranches: function() {
		this.updateAllTreeNodes();
		// Iterate backwards for speed
		for (var i = 0; i <= ig.game.tree.allBranchNodes.length-1; i++) {
			var branch = ig.game.tree.allBranchNodes[i];
			var randInt = this.randomFromTo(0,30);
			if (randInt <= this.quake.chance && !branch.baseBranch.touches(ig.game.pointer)) {
				this.healthMod(branch, -branch.health);

			}
		}
	},

	growTrunk: function() {
		this.updateAllTreeNodes();
		// Go through each tree node...
		for (var i = 0; i < ig.game.tree.allTreeNodes.length; i++) {
			var treeNode = ig.game.tree.allTreeNodes[i];
			// If the tree node belongs to the TRUNK...
			if (treeNode.active && treeNode.kind === 'trunk') {
				// Calculate target X and Y positions and size for the new node.
				var posX = treeNode.pos.x + ig.game.controller.randomFromTo(-treeNode.posVariation.x,treeNode.posVariation.x);
				var posY = treeNode.pos.y - treeNode.growthInterval + ig.game.controller.randomFromTo(-treeNode.posVariation.y,treeNode.posVariation.y);
				var size = treeNode.size.x - 5 + ig.game.controller.randomFromTo(-treeNode.sizeVariation,treeNode.sizeVariation);

				// Spawn the new node and set current node to inactive.
				ig.game.spawnEntity(EntityTreeNode, treeNode.pos.x, treeNode.pos.y, {parentEntity: treeNode, endPos: {x: posX, y: posY}, size: {x: size, y: size}, kind: 'trunk'});
				treeNode.active = false;
			}
		}
	},

	checkBranchGrowth: function() {
		// 50% chance that a new branch will grow. Possibly change this to depend on health, conditions, etc later
		var randInt = this.randomFromTo(0,2);
		if (randInt === 1) {
			this.createNewBranch();
		}
	},

	checkDisease: function() {
		this.updateAllTreeNodes();
		for (var i = 0; i < ig.game.tree.allTreeNodes.length; i++) {
			var node = ig.game.tree.allTreeNodes[i];
		}
	},

	createNewBranch: function() {
		this.updateAllTreeNodes();
		if (ig.game.tree.allTreeNodes.length > 1) {
			var randInt = this.randomFromTo(1,ig.game.tree.allTrunkNodes.length-1);
			var trunkNode = ig.game.tree.allTrunkNodes[randInt];
			var growthInterval = null; // Dictates whether branch grows to right or left of trunk
			// If the tree node does not already own a branch and is part of the trunk...
			if (trunkNode.branchParent === false) {
				trunkNode.branchParent = true;	// Indicate that it DOES now own a branch
				trunkNode.baseBranch = trunkNode; // Set itself as its own base branch
				trunkNode.branchFertility = this.randomFromTo(20,100); // Less is more fertile
				
				//  Choose which direction the branch grows in
				if (ig.game.currentLevel === LevelTitle) {
					// If this is the title screen, always grow to the left (text is on the right)
					randInt = 0;
				}
				else {
					// Else choose direction randomly
					randInt = this.randomFromTo(0,1);
				}

				if (randInt === 0) {
					growthInterval = trunkNode.growthInterval;
				}

				else if (randInt === 1) {
					growthInterval = -trunkNode.growthInterval;
				}

				// Set target X and Y positions and size of the next branch node
				var posX = trunkNode.pos.x - growthInterval + ig.game.controller.randomFromTo(-ig.game.tree.branchPosVariation.x,ig.game.tree.branchPosVariation.x);
				var posY = trunkNode.pos.y + ig.game.controller.randomFromTo(-ig.game.tree.branchPosVariation.y,ig.game.tree.branchPosVariation.y);
				var size = trunkNode.size.x - 10 + ig.game.controller.randomFromTo(-trunkNode.sizeVariation,trunkNode.sizeVariation);
				// Spawn branch node
				ig.game.spawnEntity(EntityTreeNode, trunkNode.pos.x, trunkNode.pos.y, {parentEntity: trunkNode, baseBranch: trunkNode, endPos: {x: posX, y: posY}, size: {x: size, y: size}, kind: 'branch'});
			}
		}
	},

	growBranch: function(branch) {
		var growthInterval = null;
		if (branch.active) {
			if (branch.pos.x > ig.game.tree.pos.x) {
				growthInterval = branch.growthInterval;
			}

			else {
				growthInterval = -branch.growthInterval;
			}

			var posX = branch.pos.x + growthInterval + ig.game.controller.randomFromTo(-ig.game.tree.branchPosVariation.x,ig.game.tree.branchPosVariation.x);
			var posY = branch.pos.y + ig.game.controller.randomFromTo(-ig.game.tree.branchPosVariation.y,0);
			var size = branch.size.x - 5 + ig.game.controller.randomFromTo(-branch.sizeVariation,branch.sizeVariation);
			if (ig.game.currentLevel === LevelMain) {
				this.growLeaves(branch);
			}
			ig.game.spawnEntity(EntityTreeNode, branch.pos.x, branch.pos.y, {parentEntity: branch, baseBranch: branch.baseBranch, endPos: {x: posX, y: posY}, size: {x: size, y: size}, kind: 'branch', lastBranch: true});
			branch.active = false;
			branch.lastBranch = false;
		}
		
	},

	growFruit: function(corebranch) {
		var branch = null;
		if (ig.game.tree.idealHealth > 75) {
			if (ig.game.tree.allBranchNodes.length > 0) {
				if (!corebranch) {
					branch = ig.game.controller.pickRandomNode('branch');
				}
				else {
					branch = corebranch;
				}
				if (branch && !branch.diseased) {  // (Fix this. Branch should always be chosen.)
					var healthPercentageRemainder = 100 - ig.game.tree.healthPercentage;
					var growthChance = this.randomFromTo(0,branch.baseBranch.branchFertility);
					if (growthChance <= 10) {
						var fruitQuantity = this.randomFromTo(1,2);
						for (var i = 0; i < fruitQuantity; i++) {
							var posX = branch.pos.x + ig.game.controller.randomFromTo(-branch.posVariation.x,branch.posVariation.x);
							var posY = branch.pos.y + ig.game.controller.randomFromTo(-branch.posVariation.y,branch.posVariation.y);
							ig.game.spawnEntity(EntityFruit, posX, posY, {parentEntity: branch});
						}
					}
				}
				else {
					if (corebranch) {
						this.growFruit(corebranch);
					}
					else {
						this.growFruit();
					}
				}
			}
		}
	},

	growLeaves: function(branch) {
		// One in three chance to grow leaves
		if (ig.game.tree.idealHealth > 30 || branch.baseBranch.fertilized) {
			var randInt = this.randomFromTo(0,branch.baseBranch.branchFertility/10);
			if  (randInt < 2) {
				var leafQuantity = this.randomFromTo(1,3);
				var posVariation = {x: 50, y: 50};
				for (var i = 0; i < leafQuantity; i++) {
					var posX = branch.pos.x + ig.game.controller.randomFromTo(-posVariation.x,posVariation.x);
					var posY = branch.pos.y + ig.game.controller.randomFromTo(-posVariation.y,posVariation.y);
					ig.game.spawnEntity(EntityLeaf, posX, posY, {parentEntity: branch});
					this.growFruit(branch);
				}
			}
		}
	},

	killBranch: function(branch) {
		// Get all entities that depend on branch being killed
		var allNodes = ig.game.getEntitiesByType(EntityTreeNode);	// Get all tree entities
		var allLeaves = ig.game.getEntitiesByType(EntityLeaf);		// Get all leaf entities
		var allFruit = ig.game.getEntitiesByType(EntityFruit);		// Get all fruit entities
		var allAffected = allNodes.concat(allLeaves,allFruit);		// Combine the above into one array
		branch.gravityFactor = 500;									// Have branch start falling
		branch.active = false;										// Branch is no longer active, can't grow
		// Kill all entities belonging to this branch except for fruits that have already been picked.
		for (var i = 0; i < allAffected.length; i++) {
			var entity = allAffected[i];
			if (entity.parentEntity === branch && !entity.pickedFruit) {
				ig.game.controller.healthMod(entity,-entity.health);
			}
		}
	},

	healthMod: function(entity, healthValue) {
		entity.health += healthValue;
		// Ideal health is set to maximum health reached thus far
		if (entity.idealHealth < entity.health) {
			entity.idealHealth = entity.health;
		}

		// Set health percentage of entity
		entity.healthPercentage = this.calcPercentage(entity.health,entity.idealHealth);

		// Update tree health to combination of the health of all branches and trunk pieces
		if (entity !== ig.game.tree) {
			this.updateAllTreeNodes();
			var treeHealth = 0;
			for (var i = 0; i < ig.game.tree.allTreeNodes.length; i++) {
				if (ig.game.tree.allTreeNodes[i].health > 0) {
					treeHealth += ig.game.tree.allTreeNodes[i].health;
				}
			}
			ig.game.tree.health = Math.round(treeHealth);
		}

		// Leaf health affects the health of the leaf's parent branch
		if (entity.kind === 'leaf') {
			this.healthMod(entity.parentEntity,healthValue);
		}
	},

	pickRandomNode: function(kind) {
		this.updateAllTreeNodes();
		var randInt = ig.game.controller.randomFromTo(0,ig.game.tree.allTreeNodes.length - 1);
		var randNode = ig.game.tree.allTreeNodes[randInt];

		if (randNode.kind === kind) {
			return randNode;
		}
		else {
			this.pickRandomNode(kind);
		}
	},

	pickRandomLeaf: function() {
		var allLeaves = ig.game.getEntitiesByType(EntityLeaf);
		if (allLeaves.length > 0) {
			var randInt = ig.game.controller.randomFromTo(0,allLeaves.length - 1);
			var randLeaf = allLeaves[randInt];
			return randLeaf;
		}
	},


	fadeToDeath: function(entity) {
		entity.gravityFactor = 500;
		if (entity.alpha > 0.02) {
			entity.alpha -= 0.02;
		}

		else {
			// If this branch is the first in line after a branchParent trunk node, clear up branchParent node to grow more branches
			if (entity.parentEntity && entity.parentEntity.branchParent) {
				entity.parentEntity.branchParent = false;
			}
			entity.kill();
			this.updateAllTreeNodes();
		}
	},

	updateAllTreeNodes: function() {
		ig.game.tree.allTreeNodes = ig.game.getEntitiesByType(EntityTreeNode);
		var branchNodes = [];
		var trunkNodes = [];
		var branchQuantity = 0;
		var trunkQuantity = 0;
		for (var i = 0; i < ig.game.tree.allTreeNodes.length; i++) {
			var node = ig.game.tree.allTreeNodes[i];
			if (node.kind === 'branch') {
				branchQuantity++;
				branchNodes.push(node);
			}
			else if (node.kind === 'trunk') {
				trunkQuantity++;
				trunkNodes.push(node);
			}
		}
		ig.game.tree.branchQuantity = branchQuantity;
		ig.game.tree.trunkQuantity = trunkQuantity;
		ig.game.tree.allBranchNodes = branchNodes;
		ig.game.tree.allTrunkNodes = trunkNodes;

	},

	degradeWorld: function() {
		switch (ig.game.currentYear) {
		case 0:
			break;
		case 1:
			this.acidRain.chance += 2;
			break;
		case 2:
			this.acidRain.chance += 2;
			break;
		case 3:
			this.acidRain.chance += 2;
			this.snow.chance += 3;
			break;
		case 4:
			this.acidRain.chance += 2;
			this.snow.chance += 3;
			break;
		case 5:
			this.acidRain.chance += 2;
			this.snow.chance += 3;
			ig.game.tree.damagePerTick++;
			break;
		case 6:
			this.acidRain.chance += 3;
			break;
		case 7:
		//	this.acidRain.chance += 3;
		//	this.quake.change += 3;
			break;
		case 8:
		//	this.acidRain.chance += 3;
		//	this.quake.change += 3;
			break;
		case 9:
		//	this.acidRain.chance += 3;
		//	this.quake.change += 3;
			break;
		case 10:
		//	this.acidRain.chance += 3;
			this.quake.change += 3;
			break;
		}
	},

	// Random tips for game over text
	generateTip: function() {
		var tips = ["The alien tree is most vulnerable when young",
					"Avoid overwatering...and underwatering.",
					"Water balance is important.",
					"Careful when pruning...branches provide health.",
					"Some branches produce more fruit than others",
					"The alien tree uses more water during the day",
					"Rub a cold branch to heat it up",
					"When a branch is red with disease, prune it before infection spreads"];
		return tips[this.randomFromTo(0,tips.length-1)];
	},

	/******* UTILITY FUNCTIONS *******/

	randomFromTo: function(from, to) {
       return Math.floor(Math.random() * (to - from + 1) + from);
    },

    inArray: function(arr, obj) {
		return (arr.indexOf(obj) != -1);
	},

	// Calculate what percentage of value2 value1 is.
	calcPercentage: function(value1,value2) {
		return 100 * value1 / value2;
	},

	// Calculate a value2 for targetpercent of value1;
	calcTargetPercentageValue: function(targetpercent,value1) {
		return targetpercent * value1 / 100;
	},

	pickRandomColor: function(rFrom,rTo,gFrom,gTo,bFrom,bTo) {
		var r = this.randomFromTo(rFrom,rTo);
		var g = this.randomFromTo(gFrom,gTo);
		var b = this.randomFromTo(bFrom,bTo);
		return {r: r, g: g, b: b};
	},

	transitionColor: function(currentColor,targetColor) {
		if (currentColor > targetColor) {
			currentColor--;
		}
		else if (currentColor < targetColor) {
			currentColor++;
		}
		return currentColor;
	}

});

});