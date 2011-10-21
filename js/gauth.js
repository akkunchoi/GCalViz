/**
 * Google Auth wrapper
 * ユーザー名とかは取得できないっぽい？
 * 
 */
var GAuth = (function(){
  var GAuth = function(scope){
    // private
    var token;

    /**
     * @see http://code.google.com/intl/ja/apis/gdata/docs/js-authsub.html#login
     * @return void
     */
    this.login = function(){
      token = google.accounts.user.login(scope);
    }
    /**
     *
     * @see http://code.google.com/intl/ja/apis/gdata/docs/js-authsub.html#logout_
     */ 
    this.logout = function(){
      if (this.checkLogin()){
        google.accounts.user.logout();
      }
    }
    this.getInfo = function(callback){
      google.accounts.user.getInfo(callback);
    }
    this.getStatus = function(){
      return google.accounts.user.getStatus(scope);
    }
    /**
     *
     * @return boolean true if user logged in
     */ 
    this.checkLogin = function(){
      token = google.accounts.user.checkLogin(scope);
      return token != "";
    }
  }
  return GAuth;
})();
