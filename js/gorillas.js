// implement JSON.stringify serialization
JSON.stringify = JSON.stringify || function (obj) {
	var t = typeof (obj);
	if (t != "object" || obj === null) {
		// simple data type
		if (t == "string") obj = '"'+obj+'"';
		return String(obj);
	}
	else {
		// recurse array or object
		var n, v, json = [], arr = (obj && obj.constructor == Array);
		for (n in obj) {
			v = obj[n]; t = typeof(v);
			if (t == "string") v = '"'+v+'"';
			else if (t == "object" && v !== null) v = JSON.stringify(v);
			json.push((arr ? "" : '"' + n + '":') + String(v));
		}
		return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
	}
};


$(document).ready(function() {
	var buildings = [];
	var next_building_at = 0;
	var color = 'x';
	var lc = color;
	var w;
	var h;
	var bldg_num = 0;
	var player_1_height, player_2_height;
	var player_1_score = 0;
	var player_2_score = 0;
	
	var $game = $('#game');
	var $player1 = $('<div></div>');
	var $player2 = $('<div></div>');
	var $sun = $('<div></div>');
	var $banana = $('<div></div>');
	
	var players = {
		1: {
			left: 0,
			top: 0,
			ang: 45,
			vel: 50,
			score: 0,
			placed: false
		},
		2: {
			left: 0,
			top: 0,
			ang: 45,
			vel: 50,
			score: 0,
			placed: false
		}
	};
	
	
	var building = {
		width: {
			min: 60,
			range: 30
		},
		height: {
			min: 30,
			range: 200
		},
		colors: [
			'red',
			'teal',
			'gray'
		],
		place: function(x, width, height, color) {
			var $bldg = $('<div></div>');
			$bldg.attr('id', 'building' + bldg_num);
			next_building_at = x;
			w = width;
			h = height;
			
			
			//if (bldg_num == 2 && !players[1].placed) {
			//	player_1_height = h;
			//	players[1].left = x + (0.5 * w) - 14;
			//	players[1].top = 480 - h - 29;
			//	players[1].placed = true;
			//	$player1.css({'bottom': h, 'left': (x + (0.5*w) - 14)}).appendTo($game);
			//} else if (x > 500 && !players[2].placed) { //bldg_num == 7) {
			//	player_2_height = h;
			//	players[2].left = x + (0.5 * w) - 14;
			//	players[2].top = 480 - h - 29;
			//	players[2].placed = true;
			//	$player2.css({'bottom': h, 'left': (x + (0.5*w) - 14)}).appendTo($game);
			//}
			
			$bldg.css({'width': w, 'height': h,'left': next_building_at}).addClass(color + 'Building').addClass('building');
			$game.append($bldg);
			for (var wy = 10; wy < h - 15; wy += 30) {
				for (var wx = 10; wx < w - 10; wx += 20) {
					var $wndw = $('<div></div>');
					$wndw.css({'left': wx, 'top': wy}).addClass(Math.random() > 0.25 ? 'lit' : 'unlit').addClass('window');
					$bldg.append($wndw);
				}
			}

			
			buildings.push({'x': next_building_at, 'width': w, 'height': h}); 
			
		}
	};
	
	var keys = {
		32: 'space',
		37: 'leftArrow',
		38: 'upArrow',
		39: 'rightArrow',
		40: 'downArrow',
		70: 'f'
	};
	
	
	var sound = {
		sources: {},
		player: null,
		$player: null,
		muted: true,
		init: function(urls) {
			var snd = this;
			$.each(urls, function(idx, val) {
				if (urls.hasOwnProperty(idx)) {
					snd.sources[idx] = {
						player: $('<audio>', {autoPlay: false, autoBuffer: true, preload: true}),
						playing: false,
						src: val
					};
					
					
					snd.sources[idx].player.attr('src', val);
					$('body').append(snd.sources[idx].player);
					
					snd.sources[idx].player = snd.sources[idx].player.get(0);
					snd.sources[idx].player.load();
					
				}
			});
		},
		add: function(id, url) {
			sources[id] = url;
		},
		play: function(id) {
			if (this.muted) { return; }
			if (typeof this.sources[id] != 'Undefined') {
				var p = this.sources[id];
				//p.player.currentTime = 0;
				//console.log(p.currentTime + ' / ' + p.player.duration + ' / ' + p.player.currentSrc + ' / ' + p.player.volume);
				$(p.player).attr('src', p.src);
				p.player.load();
				p.player.play();
				p.playing = true;
			}
		},
		stop: function() {
			var snd = this;
			$.each(this.sources, function(idx, val) {
				if (snd.sources.hasOwnProperty(idx)) {
					if (val.playing) {
						val.player.stop();
					}
				}
			});
		}
	}; // sound{} 

	
	sound.init({
		'intro' : 'sounds/intro-music.mp3',
		'throw' : 'sounds/throw-banana.mp3',
		'hit-building': 'sounds/hit-building.mp3',
		'hit-gorilla': 'sounds/hit-gorilla.mp3',
		'chest-thump': 'sounds/chest-thump.mp3'
	});
	
	sound.play('intro');
	
	var control = {
		throwing: false,
		turn: 1,
		random: false,
		animateInterval: null,
		localGame: true,
		setInfo: function() {
			if (typeof players[1].$velInfo == 'undefined') {
				players[1].$velInfo = $('#info1 .velocity');
				players[1].$angInfo = $('#info1 .angle');
				players[1].$score = $('#info1 .score');
				players[2].$velInfo = $('#info2 .velocity');
				players[2].$angInfo = $('#info2 .angle');
				players[2].$score = $('#info2 .score');
			}
			
			players[1].$velInfo.html(players[1].vel);
			players[1].$angInfo.html(players[1].ang);
			players[1].$score.html(players[1].score);
			players[2].$velInfo.html(players[2].vel);
			players[2].$angInfo.html(players[2].ang);
			players[2].$score.html(players[2].score);
			
			$('#angSlider').slider('value', players[this.turn].ang);
			$('#velSlider').slider('value', players[this.turn].vel);
		},
		setVel: function(player, val) {
			var who = player == 1 ? 1 : 2;
			if (val >= 1 && val <= 100) {
				players[who].vel = val;
				this.setInfo();
			}
		},
		setAng: function(player, val) {
			var who = player == 1 ? 1 : 2;
			if (val >= 1 && val <= 90) {
				players[who].ang = val;
				this.setInfo();
			}
		},
		velocityUp: function() {
			if (players[this.turn].vel < 100) {
				this.setVel(this.turn, players[this.turn].vel + 1);
			}
		},
		velocityDown: function() {
			if (players[this.turn].vel > 1) {
				this.setVel(this.turn, players[this.turn].vel - 1);
			}
		},
		angleUp: function() {
			if (players[this.turn].ang < 90) {
				this.setAng(this.turn, players[this.turn].ang + 1);
			}
		},
		angleDown: function() {
			if (players[this.turn].ang > 0) {
				this.setAng(this.turn, players[this.turn].ang - 1);
			}
		},
		nextTurn: function() {
			$('#info' + this.turn).removeClass('active');
			this.turn = this.turn == 1 ? 2 : 1;
			$('#info' + this.turn).addClass('active');
			
			if (control.random) {
				this.setVel(this.turn, Math.floor((Math.random() * 70) + 20));
				this.setAng(this.turn, Math.floor((Math.random() * 80) + 10));
			}
			
			this.setInfo();
			
			if (control.random) {
				this.throwBanana();
			}
		},
		throwBanana: function() {
			if (control.throwing) { return; }
		  control.throwing = true;
			
			var $p = $('#player' + this.turn);
			var ang = players[control.turn].ang * Math.PI / 180; // deg -> rad
			var vel = players[control.turn].vel;
			
			var x = $p.position().left;
			var y = $p.position().top - 29;
			var ox = false;
			var oy = false;
			var ix = x;
			var iy = y;
			var t = control.turn;
			var tick = 0;
			var g = 3;
			var spin_timer = 0;
			
			$p.addClass('throwing');
			setTimeout(function() { $p.removeClass('throwing');}, 500);
			
			$banana.css({'left': x, 'top': y}).show();
			
			
			var s_x = (vel / 5) * Math.cos(ang) * (control.turn == 1 ? 1 : -1)  // the X speed
			var s_y = (vel / 5) * Math.sin(ang); // the Y speed
			
			var banana_frame = t == 1 ? 1 : 4;
			clearInterval(this.animateInterval);
		
		  sound.play('throw');
		
		
			this.animateInterval = setInterval(function() {
				spin_timer++;
				if (spin_timer >= 3) {
					banana_frame += t == 1 ? 1 : -1;
					if (banana_frame > 4) { banana_frame = 1; }
					if (banana_frame < 1) { banana_frame = 4; }
					$banana.attr('rel', banana_frame);
					spin_timer = 0;
				}
		
				tick++;
				x += s_x;
				y -= s_y;
				
				s_y -= 0.5;
			
				$banana.css({'left': x, 'top': y});
				
				if (ox != false) {
					var collision = control.collidedWith(x + 12, y + 12, ox + 12, oy + 12);
					if (collision.status == "Intersection") {
						control.throwing = false;
						sound.play('hit-building');
						var blast_x = intersect.points[0].x - 12;
						var blast_y = intersect.points[0].y - 12;
						control.markCollision(blast_x, blast_y);
						$banana.hide();
						clearInterval(control.animateInterval);
						control.nextTurn();
					} else if (collision.status == 'Gorilla') {
						control.throwing = false;
						$banana.hide();
						control.scorePoint();
						clearInterval(control.animateInterval);
						control.killGorilla();
					} else if (x > 640 || x < 0 || y > 480) {
						control.throwing = false;
						$banana.hide();
						clearInterval(control.animateInterval);
						control.nextTurn();
					}
				}
				
				ox = x;
				oy = y;
				
			}, 20);
		},
		start: function() {
			$('#info' + this.turn).addClass('active');
		},
		collidedWith: function(x1, y1, x2, y2) {
			var path_pt_1 = new Point2D(x1, y1);
			var path_pt_2 = new Point2D(x2, y2);
			var interesect;
			
			var target = players[this.turn == 1 ? 2 : 1];
			var target_pt_1 = new Point2D(target.left, target.top);
			var target_pt_2 = new Point2D(target.left + 28, target.top + 29);
			var gorilla_hit = Intersection.intersectLineRectangle(path_pt_1, path_pt_2, target_pt_1, target_pt_2);
			if (gorilla_hit.status == 'Intersection') {
				gorilla_hit.status = 'Gorilla';
				return gorilla_hit;
			}
			
			for (var i = 0; i < buildings.length; i++) {
				var b = buildings[i];;
				var rect_pt_1 = new Point2D(b.x, 480 - b.height);
				var rect_pt_2 = new Point2D(b.x + b.width, 480);

				intersect = Intersection.intersectLineRectangle(path_pt_1, path_pt_2, rect_pt_1, rect_pt_2);
				if (intersect.status == "Intersection") {
					break;
				}
			}
			
			return intersect;
		},
		markCollision: function(x, y) {
			x = Math.floor(x);
			y = Math.floor(y);
			
			var collision = $('<div></div>');
			var frame = 1;
	
			collision.addClass('blast pt1').css({'left': x, 'top': y});
	
			$game.append(collision);
			
			var bint = setInterval(function() {
				collision.removeClass('pt' + frame);
				frame++;
				collision.addClass('pt' + frame);
				if (frame == 3) {
					clearInterval(bint);
				}
			}, 100);
			
	
			return true;
		},
		killGorilla: function() {
			var kill_who = control.turn == 1 ? 2 : 1;
			x = players[kill_who].left;
			y = players[kill_who].top;
			
			var collision = $('<div></div>');
			var frame = 1;
	
			collision.addClass('killBlast pt1').css({'left': x, 'top': y});
	
			$game.append(collision);
			
			sound.play('hit-gorilla');
			var bint = setInterval(function() {
				collision.removeClass('pt' + frame);
				frame++;
				collision.addClass('pt' + frame);
				if (frame == 5) {
					clearInterval(bint);
					
					if (control.turn == 1) {
						$player2.hide();
					} else {
						$player1.hide();
					}
					
					collision.remove();
					
					control.celebrate(control.turn == 1 ? $player1 : $player2);
				}
			}, 100);	
		},
		celebrate: function(ape) {
			var first = true;
			var count = 0;
			sound.play('chest-thump');
			var celInt = setInterval(function() {
				ape.css({'background-position': (first == 1 ? '-28px' : '-56px') + ' 0'});
				first = !first;
				count++;
				if (count > 6) {
					clearInterval(celInt);
					ape.css({'background-position': '0 0'});
					$player1.show();
					$player2.show();
					//init();
					var lvl = control.generateLevel();
					control.setupLevel(lvl);
					control.nextTurn();
				}
			}, 250);
			
		},
		scorePoint: function() {
			players[this.turn].score++;
			control.setInfo();
		},
		registerListeners: function() {
			$("#angSlider").slider({
				min: 0,
				max: 90,
				orientation: 'vertical',
				slide: function(e, ui) {
					control.setAng(control.turn, ui.value);
				}
			});
			
			$('#velSlider').slider({
				min: 1,
				max: 100,
				orientation: 'vertical',
				slide: function(e, ui) {
					control.setVel(control.turn, ui.value);
				}
			});
			
			$('#throw').click(function(e) {
				control.throwBanana();
				e.preventDefault();
			});
			
			$('body').keydown(function(e) {
				//console.log(e.keyCode);
				if (typeof keys[e.keyCode] != 'undefined') {
					if (keys[e.keyCode] == 'f') {
						control.random = !control.random;
						if (control.random) {
							control.throwBanana();
						}
					}
					
					if (!control.throwing) {
						switch (keys[e.keyCode]) {
							case 'leftArrow':
								control.velocityDown();
								break;
							case 'rightArrow':
								control.velocityUp();
								break;
							case 'upArrow':
								control.angleUp();
								break;
							case 'downArrow':
								control.angleDown();
								break;
							case 'space':
								control.throwBanana();
								break;
						} // switch
					}
					e.preventDefault();
				}
			});
		},
		generateLevel: function() {
			
			var level_obj = {
				buildings: [],
				player1: {},
				player2: {}
			};
			var nba = 0;
			var c = 'x';
			var h = 0;
			var last_c = color;
			var bldg_num = 0;		
			var p1_placed = false;
			var p2_placed = false;
			
			$game.find('.building, .blast').remove();
			
			var oh = 50;
			
			while (nba < 640) {
				bldg_num++;
				w = building.width.min + Math.floor(Math.random() * building.width.range);
				
				do {
					h = building.height.min + Math.floor(Math.random() * building.height.range);
				} while (Math.abs(oh - h) > 200);
				
				do {
					c = building.colors[Math.floor(Math.random() * building.colors.length)];	
				} while (c == last_c);
				
				
				if (bldg_num == 2 && !p1_placed) {
					level_obj.player1 = {
						'h': h,
						'x': nba + (0.5 * w) - 14,
						'y': 480 - h - 29
					};
					
					p1_placed = true;
				} else if (nba > 500 && !p2_placed) {
					level_obj.player2 = {
						'h': h,
						'x': nba + (0.5 * w) - 14,
						'y': 480 - h - 29
					};
					
					p2_placed = true;
				}
				
				
				level_obj.buildings.push({'x': nba, 'w': w, 'h': h, 'c': c});
				
				
				nba += w + 2;
				last_c = c;
				oh = h;
			}
			
			return level_obj;
		},
		init: function() {
			
			if (confirm("Would you like to play online against someone?  Click OK, to play online, or Cancel to play locally only.")) {
				control.localGame = false
			}
			
			$player1.addClass('gorilla').attr('id', 'player1');
			$player2.addClass('gorilla').attr('id', 'player2');
			$sun.addClass('sun');
			$banana.addClass('banana').attr('rel', 1);				
			
			$game.append($sun);
			$banana.hide().appendTo($game);
			$game.append($player1);
			$game.append($player2);
			
			players[1].ang = 45;
			players[1].vel = 50;
			players[2].ang = 45;
			players[2].vel = 50;
			
			var lvl = control.generateLevel()
			
			
			var continueSetup = function() {
				control.registerListeners();
				
				control.setInfo();
				
				control.setupLevel(lvl);
			};
			
			if (this.localGame) {
				continueSetup();
			} else {
				control.submitLevel(lvl, continueSetup);
			}
		},
		sendRequest: function(method, payload, callback) {
			if (typeof callback != 'function') {
				callback = function(d, s, x) { };
			}
			
			var req = JSON.stringify({'method': method, 'payload': payload});
			
			$.post('persistF/ajaxHandler.php', {'raw': req}, callback);
		},
		submitLevel: function(level, callback) {
			var name = prompt("What is your username/email address?", 'theraccoonbear');
			
			control.sendRequest('create-game', {'level': level, 'player1': name}, function(data, status, xhr) {
				console.log(data);
				callback();
				if (data.trickle.length > 0) {
					for (var i = 0; i < data.trickle.length; i++) {
						console.log('Trickle ' + i + ') ' + data.trickle[i]);
					}
				}
			});
		},
		setupLevel: function(lvl) {

			buildings = [];

			$game.find('.building, .blast').remove();
			
			for (var i = 0; i < lvl.buildings.length; i++) {
				
				var bldg = lvl.buildings[i];
				
				building.place(bldg.x, bldg.w, bldg.h, bldg.c);
			}
			
			$player1.css({'bottom': lvl.player1.h, 'left': lvl.player1.x});
			$player2.css({'bottom': lvl.player2.h, 'left': lvl.player2.x});
			
			players= {
				1: {
					left: lvl.player1.x,
					top: lvl.player1.y,
					height: lvl.player1.h,
					placed: true,
					score: players[1].score,
					ang: 45,
					vel: 50
				},
				2: {
					left: lvl.player2.x,
					top: lvl.player2.y,
					height: lvl.player2.h,
					placed: true,
					score: players[2].score,
					ang: 45,
					vel: 50
				}
			};
			
		}
	}; // control
	
	control.init();
	control.start();
	
});