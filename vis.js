google.load("jquery", "1.6.4");
google.load("gdata", "2");

google.setOnLoadCallback(function(){
  $ = jQuery;

  var paper = Raphael(0, 0, 500, 500);
  var rect = paper.rect(0, 0, 100, 100).attr({ fill: 'pink', stroke: '#ff8888' });

  rect.hover(function(){
    rect.attr({stroke: "#f00"});
  },function(){
    rect.attr({stroke: "#ff8888"});
  });
  
  rect.click(function(){
    var anim1 = Raphael.animation({ width: 100 }, 5e2);
    var anim2 = Raphael.animation({ width: 200}, 5e2, function(){
      rect.animate(anim1);
    });
    rect.animate(anim2);
  });

  var c = paper.circle(10, 10, 10);
  c.animate({
       "20%": {cx: 20, r: 20, easing: ">"},
       "50%": {cx: 70, r: 120, callback: function () {}},
       "100%": {cx: 10, r: 10}
  }, 2000);

var p = paper.path("M100,100c0,50 100-50 100,0c0,50 -100-50 -100,0z").attr({stroke: "#ddd"}),
 e = r.ellipse(104, 100, 4, 4).attr({stroke: "none", fill: "#f00"}),
 b = r.rect(0, 0, 620, 400).attr({stroke: "none", fill: "#000", opacity: 0}).click(function () {
 e.attr({rx: 5, ry: 3}).animateAlong(p, 4000, true, function () {
 e.attr({rx: 4, ry: 4});
 });
 });

});
