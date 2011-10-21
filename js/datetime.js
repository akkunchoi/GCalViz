/**
 * @class DateTime
 * Immutable Date wrapper
 * 
 * console.log(new DateTime().getYear());  
 * console.log(new DateTime().getMonth());  
 * console.log(new DateTime().getDay());  
 */
var DateTime = (function(){
  var aDayMilliSecond = 86400000;
  var DateTime = function(obj){
    /**
     * @var Date
     */
    var d = null;
    /**
     * @constructor
     * 
     */
    var construct = function(obj){
      if (obj instanceof Date){
        d = obj;
      }else if (obj == null){
        d = new Date();
      }else if (!isNaN(obj)){
        d = new Date(obj);
      }else if (obj instanceof DateTime){
        d = obj.getDate();
      }else{
        throw new Exception;
      }
    }
    construct(obj);
    /**
     * 
     * @return Date
     */
    this.getDate = function(){
      return d;
    }
    /**
     * date.getFullYear()
     * @return Number
     */
    this.getYear = function(){
      return d.getFullYear();
    }
    /**
     * date.getMonth() + 1
     * @return Number
     */
    this.getMonth = function(){
      return d.getMonth() + 1;
    }
    /**
     * date.getDate()
     * @return Number
     */
    this.getDay = function(){
      return d.getDate();
    }
    /**
     * @return DateTime
     */
    this.getDayOfMonthFirst = function(){
      return new DateTime(new Date(d.getFullYear(), d.getMonth(), 1));
    }
    /**
     * @return DateTime
     */
    this.getDayOfMonthLast = function(){
      // 来月 - 1日
      return new DateTime(new Date((new Date(d.getFullYear() + Math.floor(d.getMonth()/11), d.getMonth() + 1, 1)).getTime() - aDayMilliSecond));
    }
    /**
     * @return DateTime
     */
    this.yesterday = function(){
      return new DateTime(d.getTime() - aDayMilliSecond);
    }
    /**
     * @return DateTime
     */
    this.tomorrow = function(){
      return new DateTime(d.getTime() + aDayMilliSecond);
    }
    /**
     * @return String
     */
    this.toString = function(){
      return d.toString();
    }
    /**
     * @return Number
     */
    this.compareTo = function(obj){
      obj = new DateTime(obj);
      var a = this.getDate().getTime();
      var b = obj.getDate().getTime();
      if (a > b){
        return 1;
      }else if (a < b){
        return -1;
      }else{
        return 0;
      }
    }
    /**
     * second秒後
     * @return DateTime
     */ 
    this.afterBySecond = function(second){
      return new DateTime(d.getTime() + second * 1000);
    }
    /**
     * 先月の始めの日
     * @return DateTime
     */
    this.lastMonth = function(){
      return this.getDayOfMonthFirst().yesterday().getDayOfMonthFirst();
    }
  }
  return DateTime;
})();
