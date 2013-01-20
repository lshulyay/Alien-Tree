ig.module( 
	'game.entities.trigger'
)
.requires(
	'impact.entity'
)
.defines(function(){"use strict";

ig.global.EntityTrigger = ig.Entity.extend({
	size: {x: 100, y: 28},
	offset: {x: 0, y: 0},
	maxVel: {x: 0, y: 0},
	kind: null,
	parentEntity: null,
	zIndex: 200,
	alpha: 0.6,
	active: true,
	clickable: true,
	cursorFade: true,
	_wmScalable: true,
	_wmDrawBox: true,
	_wmBoxColor: '#ffffff',

	type: ig.Entity.TYPE.B,

	init: function( x, y, settings ) {
		this.parent(x, y, settings);
	//	ig.game.trigger = this;
		if( !ig.global.wm ) {
			ig.game.sortEntitiesDeferred();
		}
	},

	clicked: function() {
		if (this.kind === 'begin') {
			this.active = false;
			ig.game.loadLevel(LevelMain);
		}
		else if (this.kind === 'jhowe') {
			window.location = "https://www.youtube.com/user/TodayIWillprobably/videos";
		}
		else if (this.kind === 'gameicons') {
			window.location = "http://www.game-icons.net";
		}
	},
    
    update: function() {
		if (!this.touches(ig.game.pointer)) {
			if (this.alpha < 0.6) {
				this.alpha += 0.03;
			}
		}

	//	this.pos.x = ig.game.tree.pos.x + 50;
	//	this.pos.y = ig.system.height / 5 + 70 + 44;
	},

	draw: function() {
		if (this.active) {
			ig.system.context.fillStyle = 'rgba(0,0,0,' + this.alpha + ')';
			ig.system.context.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
		}
	}

});
});
	