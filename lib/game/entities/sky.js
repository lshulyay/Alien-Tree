ig.module(
	'game.entities.sky'
)
.requires(
	'impact.entity'
)

.defines(function(){

EntitySky = ig.Entity.extend({
    checkAgainst: ig.Entity.TYPE.NONE,
    size: {x:1, y:1},
    zIndex: 0,
    dayCycleSwitchTick: 0.01,
    dayCycleSwitchTimer: null,
    dayCycleSustain: 30,
    dayCycleSustainTimer: null,

  //  daytimeSkyColor: null,
    // Day coming color stops:
    dayColorstop1: '#8ED6FF',
    dayColorstop2: '#000000',
    dayComing: true,
    dayTime: true,

    // Night coming color stops:
    nightColorstop1: '#000000',
    nightColorstop2: '#8ED6FF',

    colorStop1: null,
    colorStop2: null,

    alpha: 1,

    switchingCycle: true,

	init: function(x, y, settings) {
        this.parent(x, y, settings);
        ig.game.sky = this;
        this.size.x = ig.system.width;
        this.size.y = ig.system.height;
      //  this.daytimeSkyColor = {r: ig.game.tree.fruitColor.color1.r, g: ig.game.tree.fruitColor.color1.g, b:ig.game.tree.fruitColor.color1.b};
        this.dayColor = 'rgb(' + ig.game.tree.fruitColor.color1.r + ',' + ig.game.tree.fruitColor.color1.g + ',' + ig.game.tree.fruitColor.color1.b + ')';
       // this.nightColorstop2 = 'rgb(' + this.skyColor.r + ',' + this.skyColor.g + ',' + this.skyColor.b + ')';

        this.colorStop1 = this.dayColorstop1;
        this.colorStop2 = this.dayColorstop2;
        this.gradStartPos = {x: this.size.x / 2, y: this.size.y};
        this.gradEndPos = {x: this.size.x / 2, y: 0};
        // this.gradStartPos = {x: 0, y: this.size.y};
        //  this.gradEndPos = {x: this.size.x, y: 0};
        this.dayCycleSwitchTimer = new ig.Timer(this.dayCycleSwitchTick);
        this.dayCycleSustainTimer = new ig.Timer(this.dayCycleSustain);
    //    this.dayCycleSustainTimer.pause();
        this.colorStopPos1 = 0;
        this.colorStopPos2 = 0;
        // ig.game.spawnEntity(EntitySun, this.size.x / 4, this.size.y, {parentEntity: this});
    },
	
    update: function() {
        if (this.size.x !== ig.system.width || this.size.y !== ig.system.height * 2) {
            this.size.x = ig.system.width;
            this.size.y = ig.system.height * 2;
        }

        if (this.switchingCycle === true) {
          //  if (this.dayCycleSwitchTimer.delta() > 0) {
               if (this.dayTime) {
                    if (this.alpha > 0) {
                        this.alpha -= 0.01;
                    }

                    else {
                        this.switchingCycle = false;
                        ig.game.tree.setWaterDepletionTimer(0.5);
                        this.dayCycleSustainTimer.unpause();
                     //   this.dayCycleSustainTimer.unpause();
                    }
                }

                else {

                    if (this.alpha < 1) {
                        this.alpha += 0.01;
                    }
                    else {
                        this.switchingCycle = false;
                        ig.game.tree.setWaterDepletionTimer(1);
                        this.dayCycleSustainTimer.unpause();
                    }
                }
           // this.dayCycleSwitchTimer.reset();
        }
        else {
            if (this.dayCycleSustainTimer.delta() > 0) {
                this.dayTime = (this.dayTime) ? false : true;
                if (ig.game.tree.startedGrowing) {
                    ig.game.currentYear++;
                }
                this.switchingCycle = true;
                this.dayCycleSustainTimer.reset();
                this.dayCycleSustainTimer.pause();
            }
        }

    },

 /*   revertCycle: function() {
        this.dayTime = (this.dayTime) ? false : true;
        ig.game.currentYear++;
        console.log('wtf: ' + ig.game.currentYear);
        if (this.dayTime) {
         //   this.dayComing = false;
            ig.game.tree.setWaterDepletionTimer(0.5);
            this.colorStop1 = this.nightColorstop1;
            this.colorStop2 = this.nightColorstop2;
        }
        else {
        //    this.dayComing = true;
            ig.game.tree.setWaterDepletionTimer(1);
            this.colorStop1 = this.dayColorstop1;
            this.colorStop2 = this.dayColorstop2;
        }
     //   this.colorStopPos2 = 0.005;
     //   this.colorStopPos1 = 0;
        this.gradEndPos.x = this.size.x / 2;
        this.gradEndPos.y = 0;
    }, */

    draw: function() {
        ig.game.ctx.save();
        ig.game.ctx.fillStyle = this.dayColor;
        ig.game.ctx.fillRect(0,0,this.size.x,this.size.y);
        ig.game.ctx.fill();
        ig.game.ctx.fillStyle = 'rgba(0,0,0,' + this.alpha + ')';
        ig.game.ctx.fillRect(0,0,this.size.x,this.size.y);
        ig.game.ctx.fill();
              ig.game.ctx.restore();
      //  ig.game.ctx.restore();
    }

});

EntityRaindrop = ig.Entity.extend({
    size: {x: 5, y: 5},
    pos: {x: 0, y: 0},
    gravityFactor: 500,
    maxVel: {x: 500, y: 500},
    friction: { x: 0, y: 0 },
    zIndex: 5,
    radius: 2,

    type: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.NEVER,

    init: function( x, y, settings ) {
        this.parent( x, y, settings );
    //    ig.game.sortEntitiesDeferred();
        this.pos.x = ig.game.controller.randomFromTo(0,ig.system.width);
        this.pos.y = ig.game.controller.randomFromTo(0, -5000);        
    },
    update: function() {
        this.parent();
        if (this.pos.y > ig.game.ground.pos.y) {
            this.kill();
        }
     //   this.vel.y += 300;
    },


    draw: function() {
        ig.game.ctx.save();
        ig.game.ctx.beginPath();
        ig.game.ctx.arc(this.pos.x,this.pos.y, this.radius, 0 , 2 * Math.PI, false);
        ig.game.ctx.fillStyle = '#ff0000';
        ig.game.ctx.fill();
        ig.game.ctx.restore();
    }
});


EntitySun = ig.Entity.extend({
    size: {x: 50, y: 50},
    pos: {x: 0, y: 0},
    gravityFactor: 0,
    maxVel: {x: 500, y: 500},
    friction: { x: 0, y: 0 },   
    zIndex: 1,
    type: ig.Entity.TYPE.B,
    collides: ig.Entity.COLLIDES.NEVER,
    radius: 100,


//  animSheet: new ig.AnimationSheet( 'media/gui/next.png', 300, 150 ),

    init: function( x, y, settings ) {
        this.parent( x, y, settings );
        ig.game.sortEntitiesDeferred();
        this.sunPos = {x: this.pos.x, y: this.pos.y};
        this.moonPos = {x: this.pos.x, y: this.pos.y};
    },
    update: function() {
        if(this.parentEntity.switchingCycle && this.parentEntity.dayTime) {
        //    console.log('daytime yo');
            if (this.sunPos.y >= 0 + this.radius + 40) {
                this.sunPos.y -= 30;
            }
            if (this.moonPos.y < this.parentEntity.size.y) {
                this.moonPos.y += 30;
            }
        }

        else if (this.parentEntity.switchingCycle && !this.parentEntity.dayTime) {
            if (this.sunPos.y < this.parentEntity.size.y){ 
                this.sunPos.y += 30;
            }
            if (this.moonPos.y > this.radius + 40) {
                this.moonPos.y -= 30;
            }
        }
    },



    /* clicked: function() {
        var posX = this.pos.x + ig.game.controller.randomFromTo(-this.posVariation.y,this.posVariation.y);
        var posY = this.pos.y - this.growthInterval + ig.game.controller.randomFromTo(-this.posVariation.x,this.posVariation.x);
        var size = this.size.x - 5 + ig.game.controller.randomFromTo(-this.sizeVariation,this.sizeVariation);
        ig.game.spawnEntity(EntityTreeNode, posX, posY, {parentEntity: this, size: {x: size, y: size}});
        this.active = false;
    }, */

    draw: function() {
        ig.game.ctx.save();
        ig.game.ctx.beginPath();
        ig.game.ctx.arc(this.sunPos.x,this.sunPos.y, this.radius, 0 , 2 * Math.PI, false);
        ig.game.ctx.fillStyle = "#000000";
        ig.game.ctx.fill();
        ig.game.ctx.beginPath();
        ig.game.ctx.arc(this.moonPos.x,this.moonPos.y, this.radius, 0 , 2 * Math.PI, false);
        ig.game.ctx.fillStyle = '#ffffff';
        ig.game.ctx.fill();
        ig.game.ctx.restore();
    }
});
});