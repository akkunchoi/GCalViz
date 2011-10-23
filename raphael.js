google.load("jquery", "1.6.4");
google.load("gdata", "2");

google.setOnLoadCallback(function(){
  $ = jQuery;

  (function(){
    var paper = Raphael("canvas1", 500, 500);

    var rect = paper.rect(0, 0, 100, 100).attr({
      fill: 'pink', 
      stroke: '#ff8888'
    });

    rect.hover(function(){
      rect.attr({
        stroke: "#f00"
      });
    },function(){
      rect.attr({
        stroke: "#ff8888"
      });
    });

    rect.click(function(){
      var anim1 = Raphael.animation({
        width: 100
      }, 5e2);
      var anim2 = Raphael.animation({
        width: 200
      }, 5e2, function(){
        rect.animate(anim1);
      });
      rect.animate(anim2);
    });

    var c = paper.circle(100, 100, 1);
    c.animate({
       "20%": {
        cx: 100, 
        r: 20, 
        easing: ">"
      },
       "50%": {
        cx: 100, 
        r: 120, 
        callback: function () {}
      },
     "100%": {
      cx: 100, 
      r: 0
    }
    }, 2000);

    var t = paper.text(200,200, "hoge");
    t.attr({"font-size": "20px"});
  //  t.transform("t100,100r45t-100,0");
    t.transform("r45");
    
  })();

  
  // http://raphaeljs.com/analytics.js
  Raphael.fn.drawGrid = function (x, y, w, h, wv, hv, attr) {
    attr = attr || {};
    attr.stroke = attr.stroke || '#000';
    var path = ["M", Math.round(x) + .5, Math.round(y) + .5, "L", Math.round(x + w) + .5, Math.round(y) + .5, Math.round(x + w) + .5, Math.round(y + h) + .5, Math.round(x) + .5, Math.round(y + h) + .5, Math.round(x) + .5, Math.round(y) + .5],
        rowHeight = h / hv,
        columnWidth = w / wv;
    for (var i = 1; i < hv; i++) {
      path = path.concat(["M", Math.round(x) + .5, Math.round(y + i * rowHeight) + .5, "H", Math.round(x + w) + .5]);
    }
    for (i = 1; i < wv; i++) {
      path = path.concat(["M", Math.round(x + i * columnWidth) + .5, Math.round(y) + .5, "V", Math.round(y + h) + .5]);
    }
    return this.path(path.join(",")).attr(attr);
  };

  (function(){
    var startDate = new Date(2011, 1, 1, 1, 1, 0);
    var endDate = new Date(2011, 1, 1, 10, 20, 0);
    var day = new Date(2011, 1, 1);
    
    var canvasFullWidth = 600;
    var canvasPadding = 20;
    var canvasWidth = canvasFullWidth - canvasPadding * 2;
    var r = Raphael("canvas2", canvasFullWidth);
    // grid
    var gridAttr = {
      'stroke': '#000',
      'stroke-dasharray': '. ',
      'stroke-width': 0.3
    };
    var tx = ty = canvasPadding;
    var drawGrid = function(){
      var numXGrid = 24;
      var w = Math.floor(canvasWidth / numXGrid);
      var h = 120;
      for (var i = 0; i <= numXGrid; i++){
        r.path(['M', tx + i * w, ty, 'L', tx + i * w, ty + h].join(',')).attr(gridAttr);
      }
    }
    drawGrid();
    
    var entryAttr = {
      fill: 'pink', 
      stroke: '#ff8888',
      opacity: '0.8'
    };
    var entryHeight = 10;
    var drawEntry = function(startDate, endDate){
      var stime = startDate.getHours() * 3600 + startDate.getMinutes() * 60 + startDate.getSeconds();
      var etime = endDate.getHours() * 3600 + endDate.getMinutes() * 60 + endDate.getSeconds();
      var secPerPixcel = 87600 / canvasWidth;
      stime = stime / secPerPixcel;
      etime = etime / secPerPixcel;
      var ex = tx;
      var ey = ty + startDate.getDay() * entryHeight
      var rect = r.rect(ex + stime, ey, (etime - stime), entryHeight).attr(entryAttr);
    }
    drawEntry(startDate, endDate);
    drawEntry(new Date(2011, 1, 2, 0, 0, 0), new Date(2011, 1, 1, 2, 0, 0));
    drawEntry(new Date(2011, 1, 2, 4, 0, 0), new Date(2011, 1, 1, 6, 0, 0));
    drawEntry(new Date(2011, 1, 2, 8, 0, 0), new Date(2011, 1, 1, 18, 0, 0));
    drawEntry(new Date(2011, 1, 2, 18, 0, 0), new Date(2011, 1, 1, 23, 59, 59));
    
//    r.text(tx, ty, day.getDay()).attr({
//      'text-anchor': 'start',
//      'font-size': '18px'
//    });
//    var ex = tx + 20;
//    var ey = ty;
//    
//    r.path(['M', ex, ey, 'L', ex, ey + 12].join(',')).attr({'stroke': '#000'});
//    var rect = r.rect(ex, ey - 10, 100, 12 + 10).attr({
//      fill: 'pink', 
//      stroke: '#ff8888',
//      opacity: '0.8'
//    });
    
    
  })();
  
});
