// alpha
(function(EC) {

	//addClass, hasClass
	(function DomClassFns(){
		if (HTMLElement) {
			
			HTMLElement.prototype.addClass = function(cls) {
				var reg = new RegExp('\\b' + cls + '\\b');
				if (!reg.test(this.className))
					this.className += ' ' + cls;
			}
			HTMLElement.prototype.hasClass = function(cls) {
				var reg = new RegExp('\\b' + cls + '\\b');
				return reg.test(this.className);
			}
			HTMLElement.prototype.delClass = function(cls) {
				var reg = new RegExp('\\b' + cls + '\\b', 'g');
				this.className = this.className.replace(reg, '');
			}
		}
	})();

	var Spriter = Backbone.Model.extend({
		curTab: 0,

		curStep: 0,

		clipX: 0,

		clipY: 0,

		width: 200,

		height: 200,

		initialize: function() {
			this.defineGraph();
			this.reset();
			this.init1();
			this.bindTab();
			this.bindStep();
		},

		defineGraph: function() {
			var This = this;

			this.Graph = EC.Graph.extend({
				initData: function(ctx) {
					this.imgdata = ctx.getImageData(this.x, this.y, this.w, this.h);
				},
				path: function(ctx) {
					ctx.rect(this.x, this.y, this.w, this.h);
				},
				renderFn: function() {
					if (This.curTab == 0) {
						this.ctx.drawImage(this.img, this.x, this.y, this.w, this.h);
					} else {
						this.ctx.putImageData(this.imgdata, this.x, this.y, 0, 0, this.w, this.h);
					}
				},
				draggable: true,
				dragMode: 'normal'
			});
		},

		bindTab: function() {
			var tabs = document.querySelectorAll('.tab a'),
				panels = document.querySelectorAll('.panel'),
				This = this;

			[].forEach.call(tabs, function(v, i) {
				v.addEventListener('click', function(e) {
					e.preventDefault();
					This.curTab = i;
					This.reset();
					panels[i].addClass('active');
					panels[(i + 1) % 2].delClass('active');
					if (i == 0) This.init1();
					else This.init2();
				}, false);
			});
		},

		reset: function() {
			if (this.layer) {
				this.layer.ctx.graphs = [];
				this.graphs = [];
				this.curStep = 0;
				this.layer.ctx.reRender();
			}
			this.panel = document.querySelectorAll('.panel')[this.curTab];
			this.steps = this.panel.querySelectorAll('.step');
			[].forEach.call(this.steps, function(v, i) {
				if (i == 0) v.addClass('active');
				else v.delClass('active');
			})
			this.codes = document.querySelector('.sprite-code');
			this.codes.delClass('active');
			this.codes.innerHTML = '';
			this.btnEvents();
		},

		init1: function() {		
			this.curX = this.curY = this.maxY = 0;
			this.bindResize1();
			this.bindUpload1();
		},

		init2: function() {
			this.bindUpload2();
		},

		btnEvents: function() {
			var clip = this.panel.querySelector('.btn-clip'),
				update = this.panel.querySelector('.btn-update'),
				This = this;

			clip.addEventListener('click', function() {
				This.clip();
			}, false);
			update.addEventListener('click', function() {
				This.updateCss();
			}, false);
		},

		initLayer: function() {
			this.viewport = document.querySelector('#viewport');
			this.result = document.querySelector('.result');

			if (this.curTab == 0) {
				this.viewport.style.width = this._btnWidth1 ? this._btnWidth1.value + 'px' : this.width + 'px';
				this.viewport.style.height = this._btnHeight1 ? this._btnHeight1.value + 'px' : this.height + 'px';
			}
			this.result.addClass('active');
			this.layer = new EC.Layer('view');
		},

		bindStep: function() {
			var btnPrev = document.querySelectorAll('.btn-prev'),
				btnNext = document.querySelectorAll('.btn-next'),
				This = this;

			[].forEach.call(btnPrev, function(v, i) {
				v.addEventListener('click', function(e) {
					if (v.hasClass('disable')) {return;}
					This.trigger('prev');
				}, false);
			});

			[].forEach.call(btnNext, function(v, i) {
				v.addEventListener('click', function(e) {
					if (v.hasClass('disable')) {return;}
					This.trigger('next');
				}, false);
			});

			this.on('prev', function() {
				This.steps[This.curStep--].delClass('active');
				This.steps[This.curStep].addClass('active');
			});

			this.on('next', function() {
				This.steps[This.curStep++].delClass('active');
				This.steps[This.curStep].addClass('active');
				if (This.curStep == 2) {
					This.codes.addClass('active');
					This.updateCss();
				}
			});
		},

		bindUpload1: function() {
			var btn = document.querySelector('#upload1'),
				This = this;

			btn.addEventListener('change', function(e) {
				var files = this.files,
					i = 0,
					imgs = [];
				
				[].forEach.call(files, function(v) {
					var img = document.createElement('img'),
						reader = new FileReader(),
						name = v.name.match(/.*(?=\.\w+$)/)[0];

					if (!/^image\/\w+$/.test(v.type)) {
						alert(v.name + '不是图片哦');
					}

					img.onload = function() {
						imgs.push({
							img: this,
							width: this.width,
							height: this.height,
							name: name
						});
						if (imgs.length == files.length) {
							if (!This.layer) {
								This.initLayer();
							}
							This.render1(imgs);
						}
					};

					reader.onload = function(e) {
						img.src = e.target.result;
					};

					reader.readAsDataURL(v);
				});
			});
		},

		bindUpload2: function() {
			var btn = document.querySelector('#upload2'),
				This = this;

			btn.addEventListener('change', function(e) {
				var files = this.files,
					i = 0,
					img = document.createElement('img'),
					reader = new FileReader(),
					name = files[0].name.match(/.*(?=\.\w+$)/)[0],
					data;

					if (files.length == 0) {return;}

					img.onload = function() {
						data = {
							img: this,
							width: this.width,
							height: this.height,
							name: name
						};
						if (!This.layer) {
							This.initLayer();
						}
						This.layer.ctx.graphs = This.graphs = [];
						EC.Layer.viewport.resize({width: data.width, height: data.height}, This.layer.ctx);
						This.detect2(data);
					};

					reader.onload = function(e) {
						img.src = e.target.result;
					};

					reader.readAsDataURL(files[0]);
			});
		},

		bindResize1: function() {
			var This = this;
			this._btnWidth1 = document.querySelector('.set-width1');
			this._btnHeight1 = document.querySelector('.set-height1');
			this._btnPadding1 = document.querySelector('.set-padding1');

			this.padding1 = parseInt(this._btnPadding1.value);

			if (this.layer) {
				EC.Layer.viewport.resize({'width': parseInt(this._btnWidth1.value), 'height': parseInt(this._btnHeight1.value)}, This.layer.ctx);
			}
				

			this._btnWidth1.addEventListener('change', function() {
				if (This.layer) {
					EC.Layer.viewport.resize({'width': parseInt(this.value)}, This.layer.ctx);
				}
			});

			this._btnHeight1.addEventListener('change', function() {
				if (This.layer) {
					EC.Layer.viewport.resize({'height': parseInt(this.value)}, This.layer.ctx);
				}
			});
			this._btnPadding1.addEventListener('change', function() {
				if (This.layer) {
					This.padding1 = parseInt(this.value);
				}
			});
		},

		render1: function(imgs) {
			var This = this;

			//active next
			this.steps[this.curStep].querySelector('.btn-next').delClass('disable');

			imgs.forEach(function(v) {
				This.curY = This.curX + v.width > EC.Layer.viewport.width ? This.maxY : This.curY;
				This.curX = This.curX + v.width > EC.Layer.viewport.width ? 0 : This.curX;
				
				var graph = new This.Graph({
					x: This.curX,
					y: This.curY,
					w: v.width,
					h: v.height,
					img: v.img,
					name: v.name
				}).render(This.layer.ctx);

				This.curX += v.width + This.padding1;
				This.maxY = Math.max(This.maxY, This.curY + v.height + This.padding1);

				if (This.maxY > This.layer.canvas.height) {
					EC.Layer.viewport.resize({'height': This.maxY}, This.layer.ctx);
				}
			});

			this.updateUrl();
		},

		detect2: function(data) {
			var c = this.layer.canvas,
				t = this.layer.ctx,
				imgData,
				worker = new Worker("workerDetect.js"),
				This = this;

			t.drawImage(data.img, 0, 0, data.width, data.height);
			imgData = t.getImageData(0, 0, data.width, data.height);
			this.spriteName = data.name;
			this.coords = [];

			worker.onmessage = function(e) {
				if (e.data == 'over') {
					t.clearRect(0, 0, c.width, c.height);
					t.drawImage(data.img, 0, 0, c.width, c.height);
					This.render2();
					return;
				}
				var coord = e.data, isInner = false;
				
				for (var i = 0; i < This.coords.length; i++) {
					if (coord.minX >= This.coords[i].x && coord.minY >= This.coords[i].y
						&& coord.maxX <= This.coords[i].x + This.coords[i].w 
						&& coord.maxY <= This.coords[i].y + This.coords[i].h) {
						isInner = true;
						break;
					}
				}

				if (!isInner) {
					This.coords.push({
						x: coord.minX,
						y: coord.minY,
						w: coord.maxX - coord.minX + 1,
						h: coord.maxY - coord.minY + 1
					});
					t.strokeStyle = '#fcc';
					t.strokeRect(coord.minX, coord.minY, coord.maxX - coord.minX, coord.maxY - coord.minY);
				}	
			};

			worker.postMessage(imgData);
		},

		render2: function() {
			var t = this.layer.ctx,
				This = this;

			this.graphs = [];

			this.coords.forEach(function(v) {
				var graph = new This.Graph({
					x: v.x,
					y: v.y,
					w: v.w,
					h: v.h
				});
				graph.initData(t);
				graph.render(t);
				This.graphs.push(graph);
			});

			//active next
			this.steps[this.curStep].querySelector('.btn-next').delClass('disable');
			this.trigger('next');
			this.updateUrl();
		},

		clip: function() {
			var ctx = this.layer.ctx,
				minX = Math.min.apply({}, ctx.graphs.map(function(v) {return v.x})),
				minY = Math.min.apply({}, ctx.graphs.map(function(v) {return v.y})),
				maxX = Math.max.apply({}, ctx.graphs.map(function(v) {return v.x + v.w})),
				maxY = Math.max.apply({}, ctx.graphs.map(function(v) {return v.y + v.h}));
			
			ctx.save();
			EC.Layer.viewport.resize({'width': maxX - minX, 'height': maxY - minY});
			ctx.translate(-minX, -minY);
			ctx.reRender();
			ctx.restore();
			this.clipX = minX;
			this.clipY = minY;
			this.updateUrl();
			this.updateCss();
		},

		updateUrl: function() {
			var btn = document.querySelectorAll('.btn-down')[this.curTab],
				data = this.layer.canvas.toDataURL('image/png'),
				downmime = 'image/octet-stream';

			data = data.replace(/image\/\w+/, downmime);
			btn.href = data;
			btn.download = this.spriteName ? this.spriteName + '.png' : 'custom.png';
		},

		updateCss: function() {
			var detector = document.getElementById('ec_detector'),
				pre = document.querySelectorAll('.set-prefix')[this.curTab].value,
				ind = document.querySelectorAll('.set-name-rule')[this.curTab].selectedIndex,
				txt = '',
				bgtxt = '',
				len = this.layer.ctx.graphs.length,
				coma = len == 1 ? '' : ',',
				This = this;

			if (detector) {
				detector.style.display = 'none';
			}

			this.layer.ctx.graphs.forEach(function(v, i) {
				var x = This.clipX - v.x ? This.clipX - v.x + 'px' : '0',
					y = This.clipY - v.y ? This.clipY - v.y + 'px' : '0',
					last = ind == 0 ? (v.name ? v.name : This.spriteName + '_' + i) : i,
					cls = '.' + pre + last;

				txt += '\n' + cls + ' {\n';
				txt += '  width: ' + v.w + 'px;\n';
				txt += '  height: ' + v.h + 'px;\n';
				txt += '  background-position: ' + x + ' ' + y + ';\n';
				txt += '}\n';

				if (i != len - 1) {
					bgtxt += cls + coma + '\n';
				} else {
					bgtxt += cls + ' {\n';
					bgtxt += '  background: url(yourspriteimageurl) -9999px -9999px no-repeat;\n';
					bgtxt += '}\n';
				}
			});

			This.codes.innerHTML = bgtxt + txt;

		}
	});

	var spriter = new Spriter;

})(EC);