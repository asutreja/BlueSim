var SPLIT3_DEBUG = false; // set to false to disable logs

function Split3Model(a) {
    this.view = a;
    this.prob = [.33, .66, 1];
    this.dest = [null, null, null];
    var b = ["Splitting three ways", this.prob[0] * 100, "% / ", this.prob[1] * 100, "% /", this.prob[2] * 100].join(" ");
    a.image.attr({
        title: b
    })
}

Split3Model.prototype.jsonify = function() {
    return {
        prob: this.prob
    }
};

Split3Model.prototype.start = function() {
    this.entity = QueueApp.sim.addEntity(SplitterEntity, this.prob)
};

Split3Model.prototype.connect = function() {
    this.entity.dest1 = this.dest[0] ? this.dest[0].entity : null;
    this.entity.dest2 = this.dest[1] ? this.dest[1].entity : null;
	this.entity.dest3 = this.dest[2] ? this.dest[2].entity : null;
};

Split3Model.prototype.showSettings = function() {
    var a = $("#split3_form");
    QueueApp.form_view = this.view;
    a.find("#split3_form_probs").find("#split3_form_prob1").val(this.prob[0]);
    a.find("#split3_form_probs").find("#split3_form_prob2").val(this.prob[1]);
    a.find("#split3_form_probs").find("#split3_form_prob3").val(this.prob[2]);
    a.show().position({
        of: $(this.view.image.node),
        at: "center center",
        my: "left top"
    })
};

Split3Model.prototype.saveSettings = function() {
    this.prob[0] = $("#split3_form").find("#split3_form_prob1").val();
	this.prob[1] = $("#split3_form").find("#split3_form_prob2").val();
	this.prob[2] = $("#split3_form").find("#split3_form_prob3").val();
    this.view.image.attr({
        title: ["Splitting three ways", this.prob[0] * 100, " / ", this.prob[1] * 100, " / ", this.prob[2] * 100].join(" ")
    })
};

Split3Model.prototype.unlink = function() {
    this.view = null
};

Split3Model.prototype.showStats = function() {

    //call animation manager funtion
    

};

Split3Model.prototype.saveStats = function(){
	tempstr = ""
	if(this.backStats){
		for(i = this.backStats.length - 1; i >= 0 ; i--){
		tempstr = tempstr + "  " + this.backStats[i] + "\n"
		}
	}
	return tempstr
}

var SplitterEntity = {
        start: function(a) {
            this.prob = a;
            this.to2 = this.to1 = this.to3 = this.arrived = 0
        },
        onMessage: function(sender, message) {
            this.arrived++;
            rand = QueueApp.random.uniform(0, 1);
			if(rand < this.prob[0]){
				(this.to1++, this.dest1 && this.send(message,0,this.dest1));
			} 
			else if(rand < this.prob[1]){
				(this.to2++, this.dest2 && this.send(message,0,this.dest2));
			}
			else {
				(this.to3++, this.dest3 && this.send(message,0,this.dest3));
			}
        }
    },
    Split3View = function(a, b, c, d, e) {
        this.canvas = a;
        this.type = b;
        this.name = c;
        this.username = c;
        this.hidden = [a.rect(d, e, 10, 10), a.rect(d, e, 10, 10), a.rect(d, e, 10, 10)];
        this.width = 28.7;
        this.height = 48 * 0.7;
        this.image = a.image("images/split3.png", d, e, this.width, this.height);
        this.x = d;
        this.y = e;
        this.hidden[0].attr({
            "stroke-width": "0"
        });
        this.hidden[1].attr({
            "stroke-width": "0"
        });
		this.hidden[2].attr({
			"stroke-width": "0"
		});
        this.image.attr({
            cursor: "move"
        });
        this.image.view = this;
        this.image.animate({
            scale: "1.2 1.2"
        }, 200, function() {
            this.animate({
                scale: "1 1"
            }, 200)
        });
        this.arrows = [null, null, null];
        this.counters = a.text(d, e, "");
		// TODO 8 was 12 before
        for (b = 0; b < 3; b++) c = a.image("images/blue-arrow.png", d, e, 15, 15), c.view = this, c.id = b, c.drag(function(a, b) {
            this.attr({
                x: this.ox + a,
                y: this.oy + b
            });
            this.paper.connection(this.conn)
        }, function() {
            this.conn = this.paper.connection(this.view.hidden[this.id], this, "#000", 0, 0, a.type == "reverser");
            this.ox = this.attr("x");
            this.oy = this.attr("y")
        }, function() {
            this.conn.line.remove();
            this.conn = null;
            var a = QueueApp.views,
                b = a.length,
                c = this.attr("x"),
                d = this.attr("y");
            for (b -= 1; b >= 0; b--) {
                var e = a[b];
                if (e.acceptDrop(c, d, this.view.name)) {
                    this.hide();
                    this.view.connect(e, this.id);
                    return
                }
            }
            a = this.view;
            this.id === 0 ? this.attr({
                x: a.x + a.width + 2,
                y: a.y + 5
            }) : this.attr({
                x: a.x + a.width + 2,
                y: a.y + a.height - 15
            })
        }), this.arrows[b] = c;
        this.moveto(d, e);
        this.image.drag(function(a, b) {
                var c = this.view;
                c.moveto(c.ox + a, c.oy + b)
            }, function() {
                var a = this.view;
                a.ox = a.x;
                a.oy = a.y
            },
            function() {});
        this.image.dblclick(function() {
            this.view.model.showSettings()
        })
    };

Split3View.prototype.clearAndUpdateForm = function () {

}

Split3View.prototype.moveto = function(a, b) {
    var c;
    if (!(a > 800 - this.width || b > 400 - this.height || a < 0 || b < 0)) {
        this.x = a;
        this.y = b;
        this.image.attr({
            x: a,
            y: b
        });
        this.hidden[0].attr({
            x: this.x + this.width - 20,
            y: this.y + 5
        });
        this.hidden[1].attr({
            x: this.x + this.width - 20,
            y: this.y + this.height - 10
        });
		this.hidden[2].attr({
            x: this.x + this.width - 20,
            y: this.y + this.height - 15
		});
        this.arrows[0].attr({
            x: this.x + this.width + 2,
            y: this.y + 5
        });
        this.arrows[1].attr({
            x: this.x + this.width + 2,
            y: this.y + this.height - 10
        });
		this.arrows[2].attr({
            x: this.x + this.width + 2,
            y: this.y + this.height - 15
		});
        this.counters.attr({
            x: this.x + this.width / 2,
            y: this.y + this.height + 5
        });
        for (c = QueueApp.views.length - 1; c >= 0; c--) QueueApp.views[c].moveConnection(this);
        this.arrows[0].conn && this.canvas.connection(this.arrows[0].conn);
        this.arrows[1].conn && this.canvas.connection(this.arrows[1].conn);
		this.arrows[2].conn && this.canvas.connection(this.arrows[2].conn);
    }
};

Split3View.prototype.connect = function(a, b) {
    var c = this.canvas.connection(this.hidden[b], a.dropObject(), "#000");

if (SPLIT3_DEBUG) console.log("g");
    
    c.line.attr({
        "stroke-width": 3,
        stroke: "rgba(52,152,219, 0.86)"
    });
    c.line.node.id = getID();     //here  splitter
    c.fromView = this;
    c.toView = a;
    this.arrows[b].conn = c;
    this.arrows[b].hide();
    this.model.dest[b] = a.model
};

Split3View.prototype.unlink = function() {
    var a, b;
    a = QueueApp.models.length;
    for (a -= 1; a >= 0; a--)
        if (QueueApp.models[a] === this.model) {
            b = a;
            break
        }
    b && QueueApp.models.splice(b, 1);
    this.model && this.model.unlink();
    this.disconnect();
    a = QueueApp.views.length;
    for (a -= 1; a >= 0; a--) QueueApp.views[a].disconnect(this), QueueApp.views[a] === this && (b = a);
    QueueApp.views.splice(b, 1);
    this.image.remove();
    this.arrows[0].remove();
    this.arrows[1].remove();
	this.arrows[2].remove();
    this.hidden[0].remove();
    this.hidden[1].remove();
	this.hidden[2].remove();
    this.counters.remove()
};

Split3View.prototype.disconnect = function(a) {
	// TODO was 2 not 3
    for (var b = 0; b < 3; b++) {
        var c = this.arrows[b];
        if (c && c.conn && (!a || c.conn.toView === a)){
			c.conn.line.remove();
			c.conn = null;
			switch(b){
				case 0:
					c.attr({
						x: this.x + this.width + 2,
						y: this.y + 5
					})
					break;
				case 1:
					c.attr({
						x: this.x + this.width + 2,
						y: this.y + this.height - 10
					})
					break;
				case 2:
					c.attr({
						x: this.x + this.width + 2,
						y: this.y + this.height - 15
					})
					break;
			}
			c.show()
		}
    }
};

Split3View.prototype.dropObject = function() {
    return this.image
};

Split3View.prototype.acceptDrop = function(a, b, c) {
    if (this.name == c) return 0
    return a > this.x - 10 && a < this.x + this.width + 10 && b > this.y - 10 && b < this.y + this.height + 10
};

Split3View.prototype.moveConnection = function(a) {
    for (var b = 0; b < 3; b++) {
        var c = this.arrows[b];
        c && c.conn && c.conn.toView === a && this.canvas.connection(c.conn)
    }
};

Split3View.prototype.jsonify = function() {
    for (var a = {
            x: this.x,
            y: this.y,
            type: this.type,
            name: this.name,
            out: [null, null]
        }, b = 0; b < 3; b++) {
        var c = this.arrows[b];
        if (c.conn) a.out[b] = c.conn.toView.name
    }
    if (this.model) a.model = this.model.jsonify();
    return a
};

