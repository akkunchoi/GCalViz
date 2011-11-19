/**
 * @class
 * google.gdata.calendar.CalendarFeed の最小版。
 * localStorageからの復元用
 */
var CalendarFeed = (function(){
  var Id = function(value){
    this.getValue = function(){
      return value;
    }
  }
  var Title = function(text){
    this.getText = function(){
      return text;
    }
  }
  var Link = function(href){
    this.getHref = function(){
      return href;
    }
  }
  return function(data){
    this.getId = function(){
      return new Id(data.id);
    }
    this.getTitle = function(){
      return new Title(data.title);
    }
    this.getLink = function(){
      return new Link(data.link);
    }
  }
})();
