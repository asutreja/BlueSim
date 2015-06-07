var REVERSER_DEBUG = false; // set to false to disable logs

function ReverserModel(a) {
    this.view = a;
    this.dest = null;
	this.stat={}
    a.image.attr({
        title: "Reverser"
    })
}

ReverserModel.prototype.jsonify = function() {

    return null
};

ReverserModel.prototype.start = function() {
    this.entity = QueueApp.sim.addEntity(ReverserEntity, this.dest);
};

ReverserModel.prototype.connect = function() {
    this.entity.dest = this.dest ? this.dest.entity : null;
};

ReverserModel.prototype.showSettings = function() {
    var a = $("#reverser_form");                        
    QueueApp.form_view = this.view;
    a.show().position({
        of: $(this.view.image.node),
        at: "center center",
        my: "left top"
    })
    $("#hover_form").hide();
    displayName(this, "reverser_name");
};

ReverserModel.prototype.saveSettings = function() {
    rename(this, "reverser_name");
};

ReverserModel.prototype.unlink = function() {
    this.view = null;
};

var ReverserEntity = {
        start: function(a) {
    		this.dest = a;
    	},
        onMessage: function(sender, message) {
			this.dest && this.send(message,0,this.dest)//this.dest.onMessage(this, message)
        }
    },
    ReverserView = function(a, b, c, d, e) {
        this.canvas = a;
        this.type = b;
        this.name = c;
        this.username = c;
        this.width = this.height = 50;
        this.color;
        this.image = a.image("images/reverser_gray.png", d, e, this.width, this.height);
        this.x = d;
        this.y = e;
        this.text = a.text(d, e, this.name);
        this.text.node.children[0].setAttribute("style", "font-size: 14px;font-weight: normal; fill: #c2c2c2");

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
        this.arrow = a.image("images/reversed-blue-arrow.png", d, e, 15, 15), this.arrow.view = this, this.arrow.drag(function(a, b) {
            this.attr({
                x: this.ox + a,
                y: this.oy + b
            });
            this.paper.connection(this.conn)
        }, function() {
            this.conn = this.paper.connection(this, this.view.image, PATH_SHADOW_COLOR);
            this.conn.line[0].setAttribute("stroke-width","2"); //make  path shadow thicker
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
                var f = a[b];
                if (f.acceptDrop(c, d, this.view.name)) {
                    this.hide();
                    this.view.connect(f);
                    return
                }
            }
            a = this.view;
            this.attr({
                x: a.x - 12,
                y: a.y + a.height / 2 - 6
            })
        });
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

ReverserView.prototype.clearAndUpdateForm= function(){

}


ReverserView.prototype.moveto = function(a, b) {
    var c;
    if (!(a > CANVAS_W - this.width || b > CANVAS_H - this.height || a < 0 || b < 0)) {
        this.x = a;
        this.y = b;
        this.image.attr({
            x: a,
            y: b
        });
        this.text.attr({
            x: this.x + this.width / 2,
            y: this.y + this.height + 5
        });
        this.arrow && this.arrow.attr({
            //x: this.x + this.width + 2
            x: this.x - 12,
            y: this.y + this.height / 2 - 6
        });
        c = QueueApp.views.length;
        for (c -= 1; c >= 0; c--) QueueApp.views[c].moveConnection(this)
        this.arrow && this.arrow.conn && this.canvas.connection(this.arrow.conn, 0, 0, 0, 1, this.arrow.conn.toView.type == "reverser")
    }
};

ReverserView.prototype.connect = function(a) {
    var b = this.canvas.connection(this.image, a.dropObject() , "#000", 0, 1, a.type == "reverser");
    //var b = this.canvas.connection(a.dropObject(), this.image , "#000", 0, 1, a.type == "reverser");

     b.line.node.setAttribute("data-from",this.image.node.id);  //adds where the path is coming from
     b.line.node.setAttribute("data-to",a.image.node.id);       //adds where the path is going to

    b.line.attr({
        "stroke-width": 3,
        stroke: "rgba(52,152,219, 0.86)"
    });
    b.fromView = this;
    b.toView = a;
    this.arrow.conn = b;
    this.arrow.hide();
    this.model.dest = a.model
};

ReverserView.prototype.unlink = function() {
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
    this.arrow && this.arrow.remove();
    this.text.remove()
};

ReverserView.prototype.disconnect = function(a) {
    if (this.arrow && this.arrow.conn && (!a || this.arrow.conn.toView === a)) this.arrow.conn.line.remove(), this.arrow.conn = null, this.arrow.attr({
        x: this.x - 12,
        y: this.y + this.height / 2 - 6
    }), this.arrow.show(), this.model.dest = null
};

ReverserView.prototype.dropObject = function() {
    return this.image
};

ReverserView.prototype.acceptDrop = function(a, b, c) {
    if (this.name == c) return 0
    return a > this.x - 10 && a < this.x + this.width + 10 && b > this.y - 10 && b < this.y + this.height + 10
};

ReverserView.prototype.moveConnection = function(a) {
    this.arrow && this.arrow.conn && this.arrow.conn.toView === a && this.canvas.connection(this.arrow.conn, 0, 0, 0, 1, a.type == "reverser")
};

ReverserView.prototype.jsonify = function() {
    var a = {
        x: this.x,
        y: this.y,
        type: this.type,
        name: this.name,
		username: this.username
    };
    if (this.arrow && this.arrow.conn) a.out = this.arrow.conn.toView.name;
    if (this.model) a.model = this.model.jsonify();
    return a
};

