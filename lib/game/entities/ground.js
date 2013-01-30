ig.module(
	'game.entities.ground'
)
.requires(
	'impact.entity'
)

.defines(function(){

EntityGround = ig.Entity.extend({
    checkAgainst: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.FIXED,

    groundColor: "#000000",
    gravityFactor: 0,
    zIndex: 2,
    grassTopX: 0,
    size: {x:1, y:100},

    grass1: new ig.Image('media/grass1.png'),
    grass2: new ig.Image('media/grass2.png'),
    grass3: new ig.Image('media/grass3.png'),
    grassImagesArr:[],
    grassSlotsArr:[],

	init: function(x, y, settings) {
		this.parent(x, y, settings);
        this.grassImagesArr = [this.grass1, this.grass2, this.grass3];
        this.size.x = ig.system.width;
        this.size.y = ig.system.height - this.pos.y;
        ig.game.ground = this;
        this.generateGrass();
	},

    update: function() {
        this.parent();
        if (this.size.x !== ig.system.width || this.size.y !== ig.system.height) {
            this.size.x = ig.system.width;
            this.size.y = ig.system.height - this.pos.y;
        }

    },

    generateGrass: function() {
        var slotNum = ig.system.width / 200;
        for (var i = 0; i < slotNum; i++) {
            var grassSlot = this.grassImagesArr[ig.game.controller.randomFromTo(0,this.grassImagesArr.length - 1)];
            this.grassSlotsArr.push(grassSlot);
        }
    },

    drawGrass: function() {
        var x = 0 - ig.game.screen.x;
        var y = this.pos.y - 50 - ig.game.screen.y;
        for (var i = 0; i < this.grassSlotsArr.length; i++) {
            this.grassSlotsArr[i].draw(x,y);
            x += 200;
        }
    },

    draw: function() {
        ig.game.ctx.save();
        // Grass
        // Hills

     /*   var x = ig.system.width / 2;
        var y = ig.system.height + ig.system.height / 1.3;
        var radius = ig.system.width / 1.4;
        ig.game.ctx.beginPath();
        ig.game.ctx.arc(x, y, radius, 0 , 2 * Math.PI, false);
        ig.game.ctx.fillStyle = 'rgba(15,15,15,1)';
        ig.game.ctx.fill(); */

        var x = ig.system.width / 1.5;
        var y = ig.system.height / 1.05;
        var radius = ig.system.width / 4;
        var startAngle = 1.1 * Math.PI;
        var endAngle = 1.9 * Math.PI;
        var counterClockwise = false;
        ig.game.ctx.beginPath();
        ig.game.ctx.arc(x, y, radius, startAngle, endAngle, counterClockwise);
        ig.game.ctx.fillStyle = 'rgba(10,10,10,1)';
        ig.game.ctx.fill();
        x = 100;
        y = ig.system.height * 1.6;
        radius = ig.system.width / 1.5;
        ig.game.ctx.beginPath();
        ig.game.ctx.arc(x, y, radius, startAngle, endAngle, counterClockwise);
        ig.game.ctx.fillStyle = 'rgba(15,15,15, 1)';
        ig.game.ctx.fill();
        x = ig.system.width;
        y = ig.system.height * 1.5;
        ig.game.ctx.beginPath();
        ig.game.ctx.fillStyle = 'rgba(25,25,25,1)';
        ig.game.ctx.arc(x, y, radius, startAngle, endAngle, counterClockwise);
        ig.game.ctx.fill();
    //    context.lineWidth = 15;

        // line color
    //    context.strokeStyle = 'black';
     //   context.stroke(); 

        this.drawGrass();

        ig.game.ctx.fillStyle=this.groundColor;
        ig.game.ctx.fillRect(this.pos.x - ig.game.screen.x,this.pos.y - ig.game.screen.y,this.size.x,this.size.y);
        ig.game.ctx.restore();
    }

});
});