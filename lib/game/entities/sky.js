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
        ig.game.spawnEntity(EntityClouds, 0,-20);
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
                        this.updateDayColor();
                    }
                }
           // this.dayCycleSwitchTimer.reset();
        }
        else {
            if (this.dayCycleSustainTimer.delta() > 0) {
                this.dayTime = (this.dayTime) ? false : true;
                if (ig.game.tree.startedGrowing && !ig.game.gameover) {
                    ig.game.currentYear++;
                    ig.game.controller.degradeWorld();
                    if (ig.game.currentYear % 3 === 0) {
                        var allTools = ig.game.getEntitiesByType(EntityTool);
                        for (var i = 0; i < allTools.length; i++) {
                            var tool = allTools[i];
                            if (tool.kind === 'fertilizer') {
                                tool.fertilizerUsesLeft++;
                                tool.setFertilizerAnim();
                            }
                        }
                    }
                }
                this.switchingCycle = true;
                this.dayCycleSustainTimer.reset();
                this.dayCycleSustainTimer.pause();
            }
        }

    },

    updateDayColor: function() {
        switch (ig.game.currentYear) {
            case 0:
                this.dayColor = "#63c2ff";
                break;
            case 1:
                this.dayColor = "#58aeff";
                break;
            case 2:
                this.dayColor = "#479af0";
                break;
            case 3:
                this.dayColor = "#3a97f6";
                break;
            case 4:
                this.dayColor = "#288bf0";
                break;
            case 5:
                this.dayColor = "#1980e9";
                break;
            case 6:
                this.dayColor = "#ffb910";
                break;
            case 7:
                this.dayColor = "#ed9700";
                break;
            case 8:
                this.dayColor = "#ed7500";
                break;
            case 9:
                this.dayColor = "#ed5400";
                break;
            case 10:
                this.dayColor = "#ed1c00";
                break;
        }

    },

    draw: function() {
        ig.game.ctx.save();
        ig.game.ctx.fillStyle = this.dayColor;
        ig.game.ctx.fillRect(0, 0,this.size.x,this.size.y);
        ig.game.ctx.fill();
        ig.game.ctx.fillStyle = 'rgba(0,0,0,' + this.alpha + ')';
        ig.game.ctx.fillRect(0, 0,this.size.x,this.size.y);
        ig.game.ctx.fill();
        ig.game.ctx.restore();
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
                if (roll <= this.danger) {
                    var node = this.pickLastBranch();
                    if (node && !node.diseased && !node.freezing) {
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
        if (this.pos.y > ig.game.ground.pos.y) {
            var allDrops = null;
            if (this.kind === 'acidrain') {
                allDrops = ig.game.getEntitiesByType(EntityWeather);
                if (allDrops.length <= 1) {
                    ig.game.controller.acidRain.active = false;
                    console.log('acid rain inactive');
                }
            }
            else if (this.kind === 'snow') {
                allDrops = ig.game.getEntitiesByType(EntityWeather);
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
            ig.game.ctx.moveTo(this.pos.x - ig.game.screen.x, this.pos.y - ig.game.screen.y);
            ig.game.ctx.lineTo(this.pos.x - ig.game.screen.x, this.pos.y + 20 - ig.game.screen.y);
            ig.game.ctx.strokeStyle = this.dropColor;
            ig.game.ctx.stroke();
        }
        else if (this.kind === 'snow') {
            ig.game.ctx.arc(this.pos.x - ig.game.screen.x,this.pos.y - ig.game.screen.y, this.radius, 0 , 2 * Math.PI, false);
            ig.game.ctx.fillStyle = this.dropColor;
            ig.game.ctx.fill();
        }
        ig.game.ctx.restore();
    }
});


EntityClouds = ig.Entity.extend({
    size: {x: 5, y: 5},
    pos: {x: 0, y: 0},
    gravityFactor: 0,
    maxVel: {x: 500, y: 0},
    friction: { x: 0, y: 0 },
    zIndex: 5,
    radius: {1: 5, 2: 5, 3: 5},
    alpha: 0.5,
    spawnedNext: false,

    type: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.NEVER,

    init: function( x, y, settings ) {
        this.parent( x, y, settings );
        for (var item in this.radius) {
            if (item == 2) {
                this.radius[item] = ig.game.controller.randomFromTo(90,130);
            }
            else {
                this.radius[item] = ig.game.controller.randomFromTo(50,80);
            }
        }
        this.alpha = ig.game.controller.randomFromTo(1,3) / 10;
        this.vel.x = ig.game.controller.randomFromTo(10,50);
    },

    update: function() {
        this.parent();
        if (this.pos.x >= ig.system.width / 2 && !this.spawnedNext) {
            ig.game.spawnEntity(EntityClouds, -350, -20);
            this.spawnedNext = true;
        }

        else if (this.pos.x > ig.system.width) {
            this.kill();
        }
    },

    draw: function() {
        ig.game.ctx.beginPath();
        var posX = this.pos.x;
        for (var item in this.radius) {
            var radius = this.radius[item];
            posX += radius * 1.5;
            ig.game.ctx.arc(posX, this.pos.y, radius, 0 , 2 * Math.PI, false);
        }
        ig.game.ctx.fillStyle = 'rgba(255,255,255,' + this.alpha + ')';
        ig.game.ctx.fill();


    }
});


// Currently unused 
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