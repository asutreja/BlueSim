var SPLITTER_DEBUG = false; // set to false to disable logs

function SplitterModel(a) {
    this.view = a;
    this.prob = 0.5;
    this.dest = [null, null];
	this.funct = null
    var b = ["Splitting", this.prob * 100, "% / ", 100 - this.prob * 100, "%"].join(" ");
	this.stat={}
}

SplitterModel.prototype.jsonify = function() {
    return {
        prob: this.prob
    }
};

SplitterModel.prototype.start = function() {
    this.entity = QueueApp.sim.addEntity(SplitterEntity, this.prob)
};

SplitterModel.prototype.connect = function() {
    this.entity.dest1 = this.dest[0] ? this.dest[0].entity : null;
    this.entity.dest2 = this.dest[1] ? this.dest[1].entity : null
};

SplitterModel.prototype.showSettings = function() {
    var a = $("#splitter_form");
    QueueApp.form_view = this.view;
    a.find("#splitter_form_perc").val(this.prob);
    a.show().position({
        of: $(this.view.image.node),
        at: "center center",
        my: "left top"
    })
    $("#hover_form").hide();
};

SplitterModel.prototype.saveSettings = function() {
    this.prob = $("#splitter_form").find("#splitter_form_perc").val();
    this.view.image.attr({
        title: ["Splitting", this.prob * 100, "% / ", 100 - this.prob * 100, "%"].join(" ")
    })
};

SplitterModel.prototype.unlink = function() {
    this.view = null
};

SplitterModel.prototype.showStats = function() {
	this.stat["arrive"]=["Arrived",this.entity.arrived]
    //call animation manager funtion
    //var value = a.toFixed(1);
};

SplitterModel.prototype.saveStats = function(){
	tempstr = ""
	for(var k in this.stat){
		if(this.stat.hasOwnProperty(k)){
			tempstr = tempstr + "  " + this.stat[k][0]+ ": " + this.stat[k][1] + "\n"
		}
	}
	return tempstr
}

var SplitterEntity = {
        start: function(a) {
            this.prob = a;
            this.to2 = this.to1 = this.arrived = 0
        },
        onMessage: function(sender, message) {
            this.arrived++;
			//We assume true route to to1 and false to route to to2
			//We also assume that this.funct will always return true/false
			eval('(' + (this.funct ? this.funct : "QueueApp.random.uniform(0, 1) < this.prob") + ')') ? (this.to1++, this.dest1 && this.send(message, 0, this.dest1)) : (this.to2++, this.dest2 && this.send(message, 0, this.dest2))
            //QueueApp.random.uniform(0, 1) < this.prob ? (this.to1++, this.dest1 && this.dest1.arrive(a)) : (this.to2++, this.dest2 && this.dest2.arrive(a))
        }
    },
    SplitterView = function(a, b, c, d, e) {
        this.canvas = a;
        this.type = b;
        this.name = c;
        this.username = c;
        this.hidden = [a.rect(d, e, 10, 10), a.rect(d, e, 10, 10)];
        this.width = 28.7;
        this.height = 48 * 0.7;
        this.image = a.image("images/splitter.png", d, e, this.width, this.height);
        this.x = d;
        this.y = e;
        this.hidden[0].attr({
            "stroke-width": "0"
        });
        this.hidden[1].attr({
            "stroke-width": "0"
        });
        this.image.attr({
            cursor: "move"
        });
        this.image.view = this;
        this.image.animate({
            scale: "1 2"
        }, 200, function() {
            this.animate({
                scale: "1 2"
            }, 200)
        });
        this.arrows = [null, null];
        this.counters = a.text(d, e, "");
        for (b = 0; b < 2; b++) c = a.image("images/blue-arrow.png", d, e, 18, 18), c.view = this, c.id = b, c.drag(function(a, b) {
            this.attr({
                x: this.ox + a,
                y: this.oy + b
            });
            this.paper.connection(this.conn)
        }, function() {
            this.conn = this.paper.connection(this.view.hidden[this.id], this, "#000");
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

SplitterView.prototype.clearAndUpdateForm = function(){
    
}

SplitterView.prototype.moveto = function(a, b) {
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
            y: this.y + this.height - 15
        });
        this.arrows[0].attr({
            x: this.x + this.width + 2,
            y: this.y + 5
        });
        this.arrows[1].attr({
            x: this.x + this.width + 2,
            y: this.y + this.height - 15
        });
        this.counters.attr({
            x: this.x + this.width / 2,
            y: this.y + this.height + 5
        });
        for (c = QueueApp.views.length - 1; c >= 0; c--) QueueApp.views[c].moveConnection(this);
        this.arrows[0].conn && this.canvas.connection(this.arrows[0].conn, 0, 0, 0, 0, this.arrows[0].conn.toView.type == "reverser");
        this.arrows[1].conn && this.canvas.connection(this.arrows[1].conn, 0, 0, 0, 0, this.arrows[1].conn.toView.type == "reverser");
    }
};

SplitterView.prototype.connect = function(a, b) {
    var c = this.canvas.connection(this.hidden[b], a.dropObject(), "#000", 0, 0, a.type == "reverser");


    
        ///c.line.node.setAttribute("data-from",this.hidden[b].image.node.id);
       // c.line.node.setAttribute("data-to",a.image.node.id);

    c.line.attr({
        "stroke-width": 3,
        stroke: "rgba(52,152,219, 0.86)"
    });
    //c.line.node.id = getID();     //here  splitter
    c.fromView = this;
    c.toView = a;
    this.arrows[b].conn = c;
    this.arrows[b].hide();
    this.model.dest[b] = a.model
};

SplitterView.prototype.unlink = function() {
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
    this.hidden[0].remove();
    this.hidden[0].remove();
    this.counters.remove()
};

SplitterView.prototype.disconnect = function(a) {
    for (var b = 0; b < 2; b++) {
        var c = this.arrows[b];
        if (c && c.conn && (!a || c.conn.toView === a)) c.conn.line.remove(), c.conn = null, b === 0 ? c.attr({
            x: this.x + this.width + 2,
            y: this.y + 5
        }) : c.attr({
            x: this.x + this.width + 2,
            y: this.y + this.height - 15
        }), c.show()
    }
};

SplitterView.prototype.dropObject = function() {
    return this.image
};

SplitterView.prototype.acceptDrop = function(a, b, c) {
    if (this.name == c) return 0
    return a > this.x - 10 && a < this.x + this.width + 10 && b > this.y - 10 && b < this.y + this.height + 10
};

SplitterView.prototype.moveConnection = function(a) {
    for (var b = 0; b < 2; b++) {
        var c = this.arrows[b];
        c && c.conn && c.conn.toView === a && this.canvas.connection(c.conn, 0, 0, 0, 0, a.type == "reverser")
    }
};

SplitterView.prototype.jsonify = function() {
    for (var a = {
            x: this.x,
            y: this.y,
            type: this.type,
            name: this.name,
            out: [null, null]
        }, b = 0; b < 2; b++) {
        var c = this.arrows[b];
        if (c.conn) a.out[b] = c.conn.toView.name
    }
    if (this.model) a.model = this.model.jsonify();
    return a
};
