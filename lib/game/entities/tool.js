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
    active: true,
    pickedUp: false,
    gravityFactor: 500,
    maxVel: {x: 500, y: 500},
    friction: {x: 0, y: 0},
    zIndex: 100,
    clickable: true,

    waterAmount: 0.5,
    watering: false,

    type: ig.Entity.TYPE.B,
    checkAgainst: ig.Entity.TYPE.B,
    collides: ig.Entity.COLLIDES.ACTIVE,

    pruneAnimSheet: new ig.AnimationSheet( 'media/prune.png', 50, 50 ),
    waterAnimSheet: new ig.AnimationSheet( 'media/water.png', 50, 50 ),

	init: function(x, y, settings) {
		this.parent(x, y, settings);
        switch (this.kind) {
            case 'prune':
                this.setAnimations(this.pruneAnimSheet);
                break;
            case 'water':
                this.setAnimations(this.waterAnimSheet);
                break;
            case 'test':
                this.setAnimations(this.pruneAnimSheet);
                break;
        }
        this.currentAnim = this.anims.Idle;
        ig.game.tool = this;
	},

    setAnimations: function(sheet) {
        this.anims.Idle = new ig.Animation( sheet, 1, [0] );
    },

    update: function() {
        this.parent();
        if (this.pickedUp) {
            this.pos.x = ig.input.mouse.x - this.size.x / 2;
            this.pos.y = ig.input.mouse.y - this.size.y / 2;

            if (ig.input.state('click') && this.kind === 'water') {
                var proximity = this.distanceTo(ig.game.tree);
                if (proximity <= 150) {
                    var maxAngle = 90;
                    if (this.currentAnim.angle < maxAngle.toRad()) {
                        var angleIncrement = 25;
                        this.currentAnim.angle += angleIncrement.toRad();
                    }
                    ig.game.tree.waterTree(this.waterAmount);
                    ig.game.spawnEntity(EntityParticle, this.pos.x + 40, this.pos.y + 50, {parentEntity: this, kind: 'water'});
                }
            }
            else {
                if (this.currentAnim.angle > 0 && this.kind === 'water') {
                    var angleDecrement = 20;
                    this.currentAnim.angle -= angleDecrement.toRad();
                }
            }
        }
        if (this.pruneAngleTimer && this.pruneAngleTimer.delta() > 0) {
            if (this.currentAnim.angle < 0) {
                var angleIncrement = 20;
                this.currentAnim.angle += angleIncrement.toRad();
            }
            else {
                this.pruneAngleTimer = null;
            }
        }
      //  if (this.currentAnim !== this.anims.Idle && )
    },

    pruneNode: function(node) {
    //    console.log('pruning!');
        var pruneAngle = -90;
        this.pruneAngleTimer = new ig.Timer(0.5);
        this.currentAnim.angle = pruneAngle.toRad();
    /*    if (node.childEntity) {
            ig.game.controller.healthMod(node.childEntity,-node.childEntity.health);
            node.childEntity = false;
        }
        else {
            ig.game.controller.healthMod(node,-node.health);
            if (node.parentEntity) {
                node.parentEntity.branchParent = false;
            }

        } */
        ig.game.controller.healthMod(node,-node.health);
        if (node.parentEntity) {
            node.parentEntity.branchParent = false;
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
        else {
          //  ig.game.tree.waterTree(this.waterAmount);
        // console.log('add more water');
        }
    },

 /*   check: function(other) {
        if (other.kind === 'branch') {
            this.usable = true;
            this.currentAnim = this.anims.Usable;
        }
        this.parent();
    }, */

    checkForTouch: function(kind) {
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
        if (!this.pickedUp) {
    //        console.log('picking up');
            this.pickedUp = true;
            this.gravityFactor = 0;
            this.collides = ig.Entity.COLLIDES.NEVER;
            this.size = {x: 5, y: 5};
        }

        else {
            if (this.kind === 'prune') {
                var touchingNode = this.checkForTouch();
                if (touchingNode !== null && touchingNode.kind === 'branch') {
                    this.pruneNode(touchingNode);
                }
                else if (touchingNode === null && this.pos.y >= ig.game.ground.pos.y - 250) {
                    this.dropTool();
                }
            }

            else if (this.kind === 'water') {
                var proximity = this.distanceTo(ig.game.tree);
                if (proximity >= 150) {
                    this.dropTool();
                }
                else {
                    if (!ig.game.tree.startedGrowing) {
                   //     this.waterTree();
                    }
                }
            }

            else if (this.kind === 'test') {
                if (this.pos.y >= ig.game.ground.pos.y - 250) {
                    this.dropTool();
                }
                else {
                    this.testNode();
                }
            }
        }
    },

    dropTool: function() {
    //    console.log('dropping');
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
            if (this.kind === 'prune') {
                var allNodes = ig.game.getEntitiesByType(EntityTreeNode);
                for (var i = 0; i < allNodes.length; i++) {
                    var node = allNodes[i];
                    if (node.kind === 'branch') {
                        ig.game.ctx.save();
                        ig.game.ctx.beginPath();
                        ig.game.ctx.arc(node.pos.x + node.size.x / 2, node.pos.y + node.size.y / 2, 5, 0 , 2 * Math.PI, false);
                        ig.game.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
                        ig.game.ctx.fill();
                    /*    ig.game.ctx.lineWidth = 2;
                        ig.game.ctx.strokeStyle = 'rgba(255, 246, 0, 1)';
                        ig.game.ctx.stroke(); */
                        ig.game.ctx.restore();
                    }
                }
            }
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

    type: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.NEVER,

    init: function( x, y, settings ) {
        this.parent( x, y, settings );
    //    ig.game.sortEntitiesDeferred();
        this.vel.x = ig.game.controller.randomFromTo(-50,50);
        
    },
    update: function() {
        this.parent();
        this.alpha -= 0.03;
        if (this.alpha < 0.03) {
            this.kill();
        }
     //   this.vel.y += 300;
    },


    draw: function() {
        ig.game.ctx.save();
        ig.game.ctx.beginPath();
        ig.game.ctx.arc(this.pos.x,this.pos.y, this.radius, 0 , 2 * Math.PI, false);
        ig.game.ctx.fillStyle = 'rgba(' + ig.game.tree.overwaterFill.r + ',' + ig.game.tree.overwaterFill.g + ',' + ig.game.tree.overwaterFill.b + ',' + this.alpha + ')';
        ig.game.ctx.fill();
        ig.game.ctx.restore();
    }
});
});