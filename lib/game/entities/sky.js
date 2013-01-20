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
        this.dayColor = '#63c2ff';
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
                        switch (ig.game.currentYear) {
                            case 0:
                                this.dayColor = "#63c2ff";
                                break;
                            case 1:
                                this.dayColor = "#58aeff";
                                ig.game.controller.acidRain.chance += 2;
                                break;
                            case 2:
                                this.dayColor = "#479af0";
                                ig.game.controller.acidRain.chance += 2;
                                break;
                            case 3:
                                this.dayColor = "#3a97f6";
                                ig.game.controller.acidRain.chance += 2;
                                ig.game.controller.snow.chance += 3;
                                break;
                            case 4:
                                this.dayColor = "#288bf0";
                                ig.game.controller.acidRain.chance += 2;
                                ig.game.controller.snow.chance += 3;
                                break;
                            case 5:
                                this.dayColor = "#1980e9";
                            //    ig.game.controller.acidRain.chance += 2;
                                ig.game.controller.snow.chance += 3;
                                break;
                            case 6:
                                this.dayColor = "#ffb910";
                            //    ig.game.controller.acidRain.chance += 2;
                                ig.game.controller.snow.chance += 3;
                                break;
                            case 7:
                                this.dayColor = "#ed9700";
                            //    ig.game.controller.acidRain.chance += 2;
                                ig.game.controller.snow.chance += 3;
                                break;
                            case 8:
                                this.dayColor = "#ed7500";
                                ig.game.controller.snow.chance += 3;
                            //    ig.game.controller.acidRain.chance += 2;
                                break;
                            case 9:
                                this.dayColor = "#ed5400";
                            //    ig.game.controller.acidRain.chance += 2;
                                ig.game.controller.snow.chance += 3;
                                break;
                            case 10:
                                this.dayColor = "#ed1c00";
                            //    ig.game.controller.acidRain.chance += 2;
                                ig.game.controller.snow.chance += 3;
                                break;
                        }
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

EntityWeather = ig.Entity.extend({
    size: {x: 5, y: 5},
    pos: {x: 0, y: 0},
    gravityFactor: 0,
    maxVel: {x: 500, y: 600},
    friction: { x: 0, y: 0 },
    zIndex: 5,
    radius: 2,
    kind: null,
    danger: null,

    type: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.NEVER,

    init: function( x, y, settings ) {
        this.parent( x, y, settings );
        this.pos.x = ig.game.controller.randomFromTo(0,ig.system.width);
        if (this.kind === 'acidrain') {
            this.pos.y = ig.game.controller.randomFromTo(0, -5000);
            this.dropColor = '#ff0000';
            ig.game.controller.conditionDanger = this.danger;
            this.gravityFactor = 700;
            if (ig.game.controller.conditionDanger < 1) {
                ig.game.controller.conditionDanger = 1;
            }
        }
        else if (this.kind === 'snow') {
            this.pos.y = ig.game.controller.randomFromTo(0, -1000);
            this.dropColor = '#ffffff';
            ig.game.controller.conditionDanger = this.danger;
            this.gravityFactor = 50;
            this.maxVel.y = 50;
            if (ig.game.controller.conditionDanger < 1) {
                ig.game.controller.conditionDanger = 1;
            }
        }
    },

    update: function() {
        this.parent();
        if (ig.game.tree.allBranchNodes.length > ig.game.controller.conditionDanger) {
            for (var i = 0; i < ig.game.controller.conditionDanger; i++) {
                ig.game.controller.conditionDanger--;
                var roll = ig.game.controller.randomFromTo(0, 10);
                console.log('condition danger: ' + this.danger  + ' roll: ' + roll);
                if (roll <= this.danger) {
                    var node = this.pickLastBranch();
                    if (node) {
                        if (!node.diseased && !node.freezing) {
                            console.log('diseasing!');
                            if (this.kind === 'acidrain') {
                                node.diseased = true;
                            }
                            else if (this.kind === 'snow') {
                                node.freezing = true;
                            }
                        }
                    }
                }
            }
        }
        if (this.pos.y > ig.game.ground.pos.y) {
            if (this.kind === 'acidrain') {
                var allDrops = ig.game.getEntitiesByType(EntityWeather);
                if (allDrops.length <= 1) {
                    ig.game.controller.acidRain.active = false;
                    console.log('acid rain inactive');
                }
            }
            else if (this.kind === 'snow') {
                var allDrops = ig.game.getEntitiesByType(EntityWeather);
                if (allDrops.length <= 1) {
                    ig.game.controller.snow.active = false;
                    console.log('snow inactive');
                }
            }
            this.kill();
        }
    },

    pickLastBranch: function() {
        ig.game.controller.updateAllTreeNodes();
        if (ig.game.tree.allBranchNodes.length > ig.game.controller.conditionDanger) {
            var rand = ig.game.controller.randomFromTo(0,ig.game.tree.allBranchNodes.length - 1);
            var node = ig.game.tree.allBranchNodes[rand];
            if (node.lastBranch === true) {
             //   console.log('picking branch again');
                return node;
            }
            else {
             //   return node;
            }
        }
    },

    draw: function() {
        ig.game.ctx.save();
        ig.game.ctx.beginPath();
        if (this.kind === 'acidrain') {
            ig.game.ctx.moveTo(this.pos.x, this.pos.y);
            ig.game.ctx.lineTo(this.pos.x, this.pos.y + 10);
            ig.game.ctx.strokeStyle = this.dropColor;
            ig.game.ctx.stroke();
        }
        else if (this.kind === 'snow') {
            ig.game.ctx.arc(this.pos.x,this.pos.y, this.radius, 0 , 2 * Math.PI, false);
            ig.game.ctx.fillStyle = this.dropColor;
            ig.game.ctx.fill();
        }
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