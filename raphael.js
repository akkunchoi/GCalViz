google.load("jquery", "1.6.4");
google.load("gdata", "2");

google.setOnLoadCallback(function(){
  $ = jQuery;

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
  t.attr({ "font-size": "20px"});
//  t.transform("t100,100r45t-100,0");
  t.transform("r45");

});
