(function(EC) {

	//addClass
	(function addClass(){
		if (HTMLElement) 
			HTMLElement.prototype.addClass = function(cls) {
				var reg = new RegExp("\\b" + cls + "\\b");
				if (!reg.test(this.className))
					this.className += ' ' + cls;
			}
	})();

	var Spriter = {
		curTab: 0,

		curStep: 0,

		init: function() {
			this.defineGraph();
			this.init1();
		},

		defineGraph: function() {
			this.Graph = EC.Graph.extend({
				initData: function(ctx) {
					this.imgdata = ctx.getImageData(this.x, this.y, this.w, this.h);
				},
				path: function(ctx) {
					ctx.rect(this.x, this.y, this.w, this.h);
				},
				renderFn: function() {
					this.ctx.putImageData(this.imgdata, this.x, this.y, 0, 0, this.w, this.h);
				},
				draggable: true,
				dragMode: 'normal'
			});
		},

		init1: function() {
			this.bindResize();
			this.bindUpload1();
		
		},

		initLayer: function() {
			this.viewport = document.querySelector('#viewport');
			this.result = document.querySelector('.result');

			if (this.curTab == 0) {
				this.viewport.style.width = this._btnWidth1.value + 'px';
				this.viewport.style.height = this._btnHeight1.value + 'px';
			}

			this.layer = new EC.Layer('view');
			this.result.addClass('active');
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

		bindResize: function() {
			var This = this;
			this._btnWidth1 = document.querySelector('.set-width1');
			this._btnHeight1 = document.querySelector('.set-height1');
				

			this._btnWidth1.addEventListener('change', function() {
				if (This.layer) {
					This.layer.canvas.width = this.value;
					This.viewport.style.width = this.value + 'px';
				}
			});

			this._btnHeight1.addEventListener('change', function() {
				if (This.layer) {
					This.layer.canvas.height = this.value;
					This.viewport.style.height = this.value + 'px';
				}
			});
		},

		render1: function() {

		}
	};

	Spriter.init();

})(EC);