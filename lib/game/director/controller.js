/* This controller class contains most tree growing functions and some generic utility functions */
ig.module(
	'game.director.controller'
)
.requires(
	'impact.impact'
)
.defines(function(){

ig.Controller = ig.Class.extend({

	init: function() {
	},

	growTrunk: function() {
		this.updateAllTreeNodes();
		// Go through each tree node...
		for (var i = 0; i < ig.game.allTreeNodes.length; i++) {
			var treeNode = ig.game.allTreeNodes[i];
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
		var randInt = this.randomFromTo(0,1);
		if (randInt === 1) {
			this.createNewBranch();
		}
	},

	checkDisease: function() {
		this.updateAllTreeNodes();
		for (var i = 0; i < ig.game.allTreeNodes.length; i++) {
			var node = ig.game.allTreeNodes[i];
			if (node.kind === 'branch' && node.size.x < 4) {
				node.diseased = true;

			}
		}
	},

	createNewBranch: function() {
		console.log('create new branch');
		this.updateAllTreeNodes();
		if (ig.game.allTreeNodes.length > 1) {
			var randInt = this.randomFromTo(1,ig.game.allTreeNodes.length-1);
			var treeNode = ig.game.allTreeNodes[randInt];
			var growthInterval = null; // Dictates whether branch grows to right or left of trunk
			// If the tree node does not already own a branch and is part of the trunk...
			if (treeNode.branchParent === false && treeNode.kind === 'trunk') {
				treeNode.branchParent = true;	// Indicate that it DOES now own a branch
				treeNode.baseBranch = treeNode; // Set itself as its own base branch
				treeNode.branchFertility = this.randomFromTo(20,100); // Less is more fertile
				
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
					growthInterval = treeNode.growthInterval;
				}

				else if (randInt === 1) {
					growthInterval = -treeNode.growthInterval;
				}

				// Set target X and Y positions and size of the next branch node
				var posX = treeNode.pos.x - growthInterval + ig.game.controller.randomFromTo(-ig.game.tree.branchPosVariation.x,ig.game.tree.branchPosVariation.x);
				var posY = treeNode.pos.y + ig.game.controller.randomFromTo(-ig.game.tree.branchPosVariation.y,ig.game.tree.branchPosVariation.y);
				var size = treeNode.size.x - 10 + ig.game.controller.randomFromTo(-treeNode.sizeVariation,treeNode.sizeVariation);
				// Spawn branch node
				ig.game.spawnEntity(EntityTreeNode, treeNode.pos.x, treeNode.pos.y, {parentEntity: treeNode, baseBranch: treeNode, endPos: {x: posX, y: posY}, size: {x: size, y: size}, kind: 'branch'});
			}

			else {
				// If the selected node DOES already own a branch or is NOT a trunk node, try again.
			//	this.createNewBranch();
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
			ig.game.spawnEntity(EntityTreeNode, branch.pos.x, branch.pos.y, {parentEntity: branch, baseBranch: branch.baseBranch, endPos: {x: posX, y: posY}, size: {x: size, y: size}, kind: 'branch'});
			branch.active = false;
		}
		
	},

	growFruit: function() {
		if (ig.game.tree.idealHealth > 75) {
			if (ig.game.tree.branchQuantity > 0) {
				console.log('growing fruit');
				var branch = ig.game.controller.pickRandomNode('branch');
				if (branch) {  // (Fix this. Branch should always be chosen.)
					var healthPercentageRemainder = 100 - ig.game.tree.healthPercentage;
					var growthChance = this.randomFromTo(0,branch.baseBranch.branchFertility);
					console.log('fruit growth chance: ' + growthChance);
					if (growthChance <= 10) {
						var fruitQuantity = this.randomFromTo(1,3);
						for (var i = 0; i < fruitQuantity; i++) {
							var posX = branch.pos.x + ig.game.controller.randomFromTo(-branch.posVariation.x,branch.posVariation.x);
							var posY = branch.pos.y + ig.game.controller.randomFromTo(-branch.posVariation.y,branch.posVariation.y);
							ig.game.spawnEntity(EntityFruit, posX, posY, {parentEntity: branch});
						}
					}
				}
				else {
					this.growFruit();
				}
			}
		}
	},

	growLeaves: function(branch) {
		// One in three chance to grow leaves
		if (ig.game.tree.idealHealth > 30) {
			var randInt = this.randomFromTo(0,branch.baseBranch.branchFertility/10);
			console.log('leaf randInt: ' + randInt);
			if  (randInt < 2) {
				var leafQuantity = this.randomFromTo(1,3);
				var posVariation = {x: 50, y: 50};
				for (var i = 0; i < leafQuantity; i++) {
					var posX = branch.pos.x + ig.game.controller.randomFromTo(-posVariation.x,posVariation.x);
					var posY = branch.pos.y + ig.game.controller.randomFromTo(-posVariation.y,posVariation.y);
					ig.game.spawnEntity(EntityLeaf, posX, posY, {parentEntity: branch});
					this.growFruit();
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

		// If entity is a branch or trunk node, update its color based on health
		// if (entity.kind === 'branch' || entity.kind === 'trunk') {
		//	this.updateBranchColors(entity);
		// }

		// Update tree health to combination of the health of all branches and trunk pieces
		if (entity !== ig.game.tree) {
			this.updateAllTreeNodes();
			var treeHealth = 0;
			for (var i = 0; i < ig.game.allTreeNodes.length; i++) {
				if (ig.game.allTreeNodes[i].health > 0) {
					treeHealth += ig.game.allTreeNodes[i].health;
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
		var randInt = ig.game.controller.randomFromTo(0,ig.game.allTreeNodes.length - 1);
		var randNode = ig.game.allTreeNodes[randInt];
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

	// Fix this...make transitions smoother
	updateBranchColors: function(branch) {
		switch (true) {
			case (branch.healthPercentage < 50 && branch.healthPercentage > 40):
				branch.branchColor = {b1: 226, b2: 226, b3: 226};
				break;
			case (branch.healthPercentage <= 40 && branch.healthPercentage > 30):
				branch.branchColor = {b1: 198, b2: 198, b3: 198};
				break;
			case (branch.healthPercentage <= 30 && branch.healthPercentage > 20):
				branch.branchColor = {b1: 171, b2: 171, b3: 171};
				break;
			case (branch.healthPercentage <= 20 && branch.healthPercentage > 10):
				branch.branchColor = {b1: 142, b2: 142, b3: 142};
				break;
			case (branch.healthPercentage <= 10):
				branch.branchColor = {b1: 102, b2: 102, b3: 102};
				break;
		/*	case (branch.healthPercentage <= 40 && branch.healthPercentage > 30):
				branch.branchColor = {b1: 81, b2: 81, b3: 81};
				break;
			case (branch.healthPercentage <= 30):
				branch.branchColor = {b1: 67, b2: 67, b3: 67};
				break; */
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
		ig.game.allTreeNodes = ig.game.getEntitiesByType(EntityTreeNode);
		var branchQuantity = 0;
		var trunkQuantity = 0;
		for (var i = 0; i < ig.game.allTreeNodes.length; i++) {
			var node = ig.game.allTreeNodes[i];
			if (node.kind === 'branch') {
				branchQuantity++;
			}
			else if (node.kind === 'trunk') {
				trunkQuantity++;
			}
		}
		ig.game.tree.branchQuantity = branchQuantity;
		ig.game.tree.trunkQuantity = trunkQuantity;

	},

	// Random tips for game over text
	generateTip: function() {
		var tips = ["The alien tree is most vulnerable when young",
					"Avoid overwatering...and underwatering.",
					"Water balance is important.",
					"Careful when pruning...branches provide health.",
					"Some branches produce more fruit than others",
					"The alien tree uses more water during the day"];
		return tips[this.randomFromTo(0,tips.length-1)];
	},

	/******* UTILITY FUNCTIONS *******/

	randomFromTo: function(from, to) {
       return Math.floor(Math.random() * (to - from + 1) + from);
    },

    inArray: function(arr, obj) {
		return (arr.indexOf(obj) != -1);
	},

	calcPercentage: function(value1,value2) {
		return 100 * value1 / value2;
	},

	pickRandomColor: function(rFrom,rTo,gFrom,gTo,bFrom,bTo) {
		var r = this.randomFromTo(rFrom,rTo);
		var g = this.randomFromTo(gFrom,gTo);
		var b = this.randomFromTo(bFrom,bTo);
		return {r: r, g: g, b: b};
	},

	transitionColor: function(currentColor,targetColor) {
	//	while (currentColor !== targetColor) {
			if (currentColor > targetColor) {
				currentColor--;
			}
			else if (currentColor < targetColor) {
				currentColor++;
			}
	//	}
	//	else {
			return currentColor;
	//	}
	}

});

});