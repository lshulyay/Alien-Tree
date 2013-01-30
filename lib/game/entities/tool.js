ig.module(
	'game.entities.tool'
)
.requires(
	'impact.entity'
)

.defines(function(){

EntityTool = ig.Entity.extend({
    size: {x:50, y:50},
    kind: null,
    note: null,
    active: true,
    pickedUp: false,
    gravityFactor: 500,
    maxVel: {x: 500, y: 500},
    friction: {x: 0, y: 0},
    zIndex: 100,
    clickable: true,

    waterAmount: 0.5,
    watering: false,

    fertilizerUsesLeft: null,

    type: ig.Entity.TYPE.B,
    checkAgainst: ig.Entity.TYPE.B,
    collides: ig.Entity.COLLIDES.ACTIVE,

    pruneAnimSheet: new ig.AnimationSheet( 'media/prune.png', 50, 50 ),
    waterAnimSheet: new ig.AnimationSheet( 'media/water.png', 50, 50 ),
    fertilizerAnimSheet: new ig.AnimationSheet( 'media/fertilizer.png', 50, 50),
    candleAnimSheet: new ig.AnimationSheet( 'media/candle.png', 50, 50),
    reloadAnimSheet: new ig.AnimationSheet( 'media/reload.png', 60, 60 ),

	init: function(x, y, settings) {
		this.parent(x, y, settings);
        switch (this.kind) {
            case 'prune':
                this.setAnimations(this.pruneAnimSheet);
                this.note = "Pruners";
                break;
            case 'water':
                this.setAnimations(this.waterAnimSheet);
                this.note = "Water";
                break;
            case 'fertilizer':
                this.setAnimations(this.fertilizerAnimSheet);
                this.fertilizerUsesLeft = 3;
                this.note = "Potent Fertilizer";
                break;
            case 'candle':
                this.setAnimations(this.candleAnimSheet);
                this.note = "Small Candle";
                break;
            case 'reloadlevel':
                this.setAnimations(this.reloadAnimSheet);
                this.gravityFactor = 0;
                this.pos.x = 5;
                this.pos.y = 5;
                break;
        }
        this.currentAnim = this.anims.Idle;
        ig.game.tool = this;
	},

    setAnimations: function(sheet) {
        this.anims.Idle = new ig.Animation( sheet, 1, [0] );
        if (this.kind === 'fertilizer') {
            this.anims.Filled3 = new ig.Animation( sheet, 1, [0] );
            this.anims.Filled2 = new ig.Animation( sheet, 1, [1] );
            this.anims.Filled1 = new ig.Animation( sheet, 1, [2] );
            this.anims.Filled0 = new ig.Animation( sheet, 1, [3] );
        }
    },

    setFertilizerAnim: function() {
        switch (this.fertilizerUsesLeft) {
            case 3: this.currentAnim = this.anims.Filled3;
                    break;
            case 2: this.currentAnim = this.anims.Filled2;
                    break;
            case 1: this.currentAnim = this.anims.Filled1;
                    break;
            case 0: this.currentAnim = this.anims.Filled0;
                    break;
        }
    },

    update: function() {
        this.parent();
        if (this.pickedUp) {
            this.pos.x = ig.input.mouse.x - this.size.x / 2;
            this.pos.y = ig.input.mouse.y - this.size.y / 2;

            // Water actions
            if (this.kind === 'water') {
                this.waterActions();
            }

            // Candle Actions
            else if (this.kind === 'candle') {
                this.candleActions();
            }
        }


        // Prune and fertilization angles
        if (this.toolAngleTimer && this.toolAngleTimer.delta() > 0) {
            if (this.currentAnim.angle < 0) {
                var angleIncrement = 20;
                this.currentAnim.angle += angleIncrement.toRad();
            }
            else {
                this.toolAngleTimer = null;
            }
        }


        if (this.kind === 'reloadlevel') {
            this.pos.x = ig.game.screen.x;
            this.pos.y = ig.game.screen.y;
        }
    },

    candleActions: function() {
        var touches = this.checkForTouch();
        if (touches === null && this.currentAnim.angle > 0) {
            var angleDecrement = 20;
            this.currentAnim.angle -= angleDecrement.toRad();
        }

        else if (touches !== null) {
            ig.game.candleSound.play();
            var maxAngle = 90;
            if (this.currentAnim.angle < maxAngle.toRad()) {
                var angleIncrement = 25;
                this.currentAnim.angle += angleIncrement.toRad();
            }

            if (touches.freezing || touches.childEntity && touches.childEntity.freezing) {
                if (touches.freezing && touches.heatingCheck === 0) {
                    touches.heatingCheck = 1;
                    touches.heatLevel++;
                    console.log('heat level 1: ' + touches.heatLevel);
                }
                else if (touches.childEntity.freezing && touches.childEntity.heatingCheck === 1) {
                    touches.childEntity.heatingCheck = 0;
                    touches.childEntity.heatLevel++;
                    console.log('heat level 2: ' + touches.childEntity.heatLevel);
                }

                if (touches.heatLevel > 5) {
                    touches.freezing = false;
                    touches.unfreezing = true;
                }
            }
            else {
                ig.game.controller.healthMod(touches,-0.01);
            }
        }
    },


    waterActions: function() {
        // Watering angles and actions
        if (ig.input.state('click')) {
            var proximity = this.distanceTo(ig.game.tree);
            if (proximity <= 150) {
                var maxAngle = 90;
                if (this.currentAnim.angle < maxAngle.toRad()) {
                    var angleIncrement = 25;
                    this.currentAnim.angle += angleIncrement.toRad();
                }
                ig.game.tree.waterTree(this.waterAmount);
                if (!this.watering) {
                    this.watering = true;
                    ig.game.wateringSound.play();
                }
                ig.game.spawnEntity(EntityParticle, this.pos.x + 40, this.pos.y + 50, {parentEntity: this, kind: 'water'});
            }
        }
        else {
            if (this.watering) {
                this.watering = false;
                ig.game.wateringSound.stop();
            }

            if (this.currentAnim.angle > 0) {
                var angleDecrement = 20;
                this.currentAnim.angle -= angleDecrement.toRad();
            }
        }
    },

    pruneNode: function(node) {
        var pruneAngle = -90;
        this.toolAngleTimer = new ig.Timer(0.5);
        this.currentAnim.angle = pruneAngle.toRad();
        ig.game.controller.healthMod(node,-node.health);
        if (node.parentEntity) {
            node.parentEntity.branchParent = false;
        }

    },

    fertilizeBranch: function(node) {
        if (this.fertilizerUsesLeft > 0) {
            console.log('old ' + node.baseBranch.branchFertility);
            node.baseBranch.branchFertility -= ig.game.controller.calcTargetPercentageValue(15,node.baseBranch.branchFertility);
            console.log('new ' + node.baseBranch.branchFertility);
            node.baseBranch.fertilized = true;
            this.fertilizerUsesLeft--;
            ig.game.controller.updateAllTreeNodes();
            for (var i = 0; i < ig.game.tree.allBranchNodes.length; i++) {
                var branchNode = ig.game.tree.allBranchNodes[i];
                if (branchNode.baseBranch === node.baseBranch) {
                console.log('happenin!');
                    ig.game.controller.growLeaves(branchNode);
                    ig.game.controller.growFruit(branchNode);
                    var rand = ig.game.controller.randomFromTo(0,10);
                    if (rand < 1) {
                        branchNode.diseased = true;
                    }
                //    ig.game.controller.healthMod(branchNode,ig.game.controller.calcTargetPercentageValue(90,branchNode.health));
                //    console.log('health: ' + branchNode.health);
                }
            }
            this.setFertilizerAnim();
            var pruneAngle = -90;
            this.toolAngleTimer = new ig.Timer(0.5);
            this.currentAnim.angle = pruneAngle.toRad();
            for (var i = 0; i < 20; i++) {
                ig.game.spawnEntity(EntityParticle, this.pos.x + 3, this.pos.y + 25, {parentEntity: this, kind: 'fertilizer'});
            }
        }
    },

    testNode: function(node) {
        ig.game.controller.snow.active = true;
        for (var i = 0; i < 300; i++) {
            var velX = ig.game.controller.randomFromTo(-50,50);
         //   console.log('snowing');
            ig.game.spawnEntity(EntityWeather, 0,0, {vel: {x: velX, y: 100}, kind: 'snow', danger: ig.game.controller.snow.chance});
        }
    },

    waterTree: function() {
        var water = ig.game.tree.water;
        var maxWater = ig.game.tree.maxWater;
        if (ig.game.getEntitiesByType(EntityTreeNode).length === 0) {
            ig.game.tree.waterSeed();
        }
    },

 /*   check: function(other) {
        if (this.kind === 'candle' && other.freezing) {
            var maxAngle = 90;
            if (this.currentAnim.angle < maxAngle.toRad()) {
                var angleIncrement = 25;
                this.currentAnim.angle += angleIncrement.toRad();
            }

            if (other.heatingCheck === 0) {
                other.heatingCheck = 1;
                other.heatLevel++;
                console.log('heat level 1: ' + other.heatLevel);
            }
            else if (other.parentEntity && other.heatingCheck === 1) {
                other.heatingCheck = 0;
                other.heatLevel++;
                console.log('heat level 2: ' + other.heatLevel);
            }

            if (other.heatLevel > 5) {
                other.freezing = false;
                other.unfreezing = true;
            }
        }
        this.parent();
    }, */

    checkForTouch: function() {
        var allNodes = ig.game.getEntitiesByType(EntityTreeNode);
        var touching = null;
        for (var i = 0; i < allNodes.length; i++) {
            var node = allNodes[i];
            if (this.touches(node)) {
                touching = node;
            }
        }
        return touching;
    },

    clicked: function() {
    //   console.log('clicking tool!');
        if (this.kind === 'reloadlevel') {
            ig.game.loadLevel(LevelMain);
        }
        else {
            if (!this.pickedUp) {
        //        console.log('picking up');
                this.pickedUp = true;
                this.gravityFactor = 0;
                this.collides = ig.Entity.COLLIDES.NEVER;
                this.size = {x: 5, y: 5};
            }

            else {
                var touchingNode = null;
                switch (this.kind) {
                    case 'prune':
                        touchingNode = this.checkForTouch();
                        if (touchingNode !== null && touchingNode.kind === 'branch') {
                            this.pruneNode(touchingNode);
                        }
                        else if (touchingNode === null && this.pos.y >= ig.game.ground.pos.y - 250) {
                            this.dropTool();
                        }
                        break;
                    case 'water':
                        var proximity = this.distanceTo(ig.game.tree);
                        if (proximity >= 130) {
                            this.dropTool();
                        }
                        break;
                    case 'fertilizer':
                        touchingNode = this.checkForTouch();
                        if (touchingNode !== null && touchingNode.kind === 'branch') {
                            this.fertilizeBranch(touchingNode);
                        }
                        else if (touchingNode === null && this.pos.y >= ig.game.ground.pos.y - 250) {
                            this.dropTool();
                        }
                        break;
                    case 'candle':
                        touchingNode = this.checkForTouch();
                        if (touchingNode === null) {
                            this.dropTool();
                        }
                        break;
                    case 'test':
                        if (this.pos.y >= ig.game.ground.pos.y - 250) {
                            this.dropTool();
                        }
                        else {
                            this.testNode();
                        }
                        break;
                }
            }
        }
    },

    dropTool: function() {
        this.currentAnim.angle = 0;
        this.pickedUp = false;
        this.gravityFactor = 500;
        this.collides = ig.Entity.COLLIDES.ACTIVE;
        if (this.pos.y > ig.game.ground.pos.y) {
            this.pos.y = ig.game.ground.pos.y - 100;
        }
        this.size = {x: 50, y: 50};
    },

    draw: function() {
        this.parent();
        if (this.pickedUp) {
            // Draw guide dots
            if (this.kind === 'prune' || this.kind === 'fertilizer') {
                var branchNodes = ig.game.tree.allBranchNodes;
                for (var i = branchNodes.length; i--;) {
                    var node = branchNodes[i];
                    ig.game.ctx.save();
                    ig.game.ctx.beginPath();
                    ig.game.ctx.arc((node.pos.x + node.size.x / 2) - ig.game.screen.x, (node.pos.y + node.size.y / 2) - ig.game.screen.y, 5, 0 , 2 * Math.PI, false);
                    ig.game.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
                    ig.game.ctx.fill();
                /*    ig.game.ctx.lineWidth = 2;
                    ig.game.ctx.strokeStyle = 'rgba(255, 246, 0, 1)';
                    ig.game.ctx.stroke(); */
                    ig.game.ctx.restore();
                }
            }
        }
        else if (this.touches(ig.game.pointer) && this.note) {
            ig.game.smallFont.draw( this.note, (this.pos.x + this.size.x / 2) - ig.game.screen.x, this.pos.y - 20, ig.Font.ALIGN.CENTER );

        }


    }
});

EntityParticle = ig.Entity.extend({
    size: {x: 5, y: 5},
    pos: {x: 0, y: 0},
    gravityFactor: 500,
    maxVel: {x: 500, y: 500},
    friction: { x: 0, y: 0 },
    zIndex: 5,
    radius: 5,
    alpha: 1,
    fillColor: {r: 0, g: 0, b: 0},

    type: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.NEVER,

    init: function( x, y, settings ) {
        this.parent( x, y, settings );
        if (this.kind === 'water') {
            this.fillColor = {r: ig.game.tree.overwaterFill.r, g: ig.game.tree.overwaterFill.g, b: ig.game.tree.overwaterFill.b};
            this.radius = 5;
            this.vel.x = ig.game.controller.randomFromTo(-50,50);
        }
        else if (this.kind === 'fertilizer') {
            this.fillColor = {r: 234, g: 0, b: 255};
            this.radius = 3;
            this.vel.x = ig.game.controller.randomFromTo(-100,0);
            this.vel.y = ig.game.controller.randomFromTo(-30,30);
            this.gravityFactor = 100;
            this.maxVel.y = 100;

        }
        
    },

    update: function() {
        this.parent();
        this.alpha -= 0.03;
        if (this.alpha < 0.03) {
            this.kill();
        }
    },

    draw: function() {
        ig.game.ctx.save();
        ig.game.ctx.beginPath();
        ig.game.ctx.arc(this.pos.x,this.pos.y, this.radius, 0 , 2 * Math.PI, false);
        ig.game.ctx.fillStyle = 'rgba(' + this.fillColor.r + ',' + this.fillColor.g + ',' + this.fillColor.b + ',' + this.alpha + ')';
        ig.game.ctx.fill();
        ig.game.ctx.restore();
    }
});
});