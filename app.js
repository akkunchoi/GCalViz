/**
 * ToDo
 * ----------------
 *
 * [Done] Calendarを選択させる
 * 月間グラフを出力する
 * 月を変更する
 * pushState/breadcrumbs/back UI or something
 * Loading Interface
 * On/Off Repeat Event
 * On/Off All day Event
 *
 * API 
 * http://code.google.com/intl/ja/apis/gdata/jsdoc/2.2/index.html
 */

google.load("jquery", "1.6.4");
google.load("gdata", "2");

/**
 * Google Auth wrapper
 */
var GoogleAuth = (function(){
  var self = {};
  // private
  var scope = "https://www.google.com/calendar/feeds/";
  var token;

  /**
   * @see http://code.google.com/intl/ja/apis/gdata/docs/js-authsub.html#login
   * @return void
   */
  self.login = function(){
    token = google.accounts.user.login(scope);
  }
  /**
   *
   * @see http://code.google.com/intl/ja/apis/gdata/docs/js-authsub.html#logout_
   */ 
  self.logout = function(){
    if (this.checkLogin()){
      google.accounts.user.logout();
    }
  }
  /*
  this.getInfo = function(callback){
    
  }
  */
  /**
   *
   * @return boolean true if user logged in
   */ 
  self.checkLogin = function(){
    token = google.accounts.user.checkLogin(scope);
    return token != "";
  }
  return self;
})();


var GCalService = (function(){
  return function(){
    var service = null;
    /**
     *
     * @return google.gdata.calendar.CalendarService
     */
    this.getService = function(){
      service = service || new google.gdata.calendar.CalendarService("calendar-sample");
      return service;
    }
    /**
     *
     * @return jQuery.Deferred resolve array of CalendarEventFeed?
     */
    this.getRecentFeeds = function(url){
      query = new google.gdata.calendar.CalendarEventQuery(url);
      query.setOrderBy(google.gdata.calendar.CalendarEventQuery.ORDERBY_START_TIME);
      query.setSortOrder(google.gdata.calendar.CalendarEventQuery.SORTORDER_DESCENDING);
      query.setSingleEvents(true);
      query.setMaxResults(10);
      var start = new google.gdata.DateTime.fromIso8601("2010-01-01");
      var end = new google.gdata.DateTime.fromIso8601("2012-12-31"); 
      query.setMinimumStartTime(start);
      query.setMaximumStartTime(end);
      
      var dfd = jQuery.Deferred();
      var callback = function(result) {
        dfd.resolve(result.feed.entry);
      }

      var handleError = function(error) {
        document.getElementById("view").innerHTML = error;
        dfd.reject(error);
      }
      this.getService().getEventsFeed(query, callback, handleError);

      return dfd.promise();
    }

    /**
     *
     * Retrieve all calendars 
     * @see http://code.google.com/intl/ja/apis/calendar/data/1.0/developers_guide_js.html#Interactive_Samples
     * @return jQuery.Deferred resolve array of CalendarEntry
     */
    this.retrieveAllCalendars = function(){
      // The default "allcalendars" feed is used to retrieve a list of all 
      // calendars (primary, secondary and subscribed) of the logged-in user
      var feedUri = 'https://www.google.com/calendar/feeds/default/allcalendars/full';

      var dfd = jQuery.Deferred();

      // The callback method that will be called when getAllCalendarsFeed() returns feed data
      var callback = function(result) {

        // Obtain the array of CalendarEntry
        var entries = result.feed.entry;
        dfd.resolve(entries);
      }

      // Error handler to be invoked when getAllCalendarsFeed() produces an error
      var handleError = function(error) {
        document.getElementById("view").innerHTML = error;
        dfd.reject(error);
      }
      
      // Submit the request using the calendar service object
      this.getService().getAllCalendarsFeed(feedUri, callback, handleError);

      return dfd.promise();
    }
  }
})();
/**
 *
 *
 */
var App = (function(){
  var self = {};
  var service = new GCalService();
  self.getMyFeed = function(){
    $ = jQuery;
    /**
     *
     * @param Object elements
     * @param Function callback function(element, jQuery)
     */ 
    var listify = function(elements, callback){
      $('#view').empty();
      var div = $(document.createElement('ul'));
      $.each(elements, function(k, e){
        var li = $(document.createElement('li'));
        var button = $(document.createElement('a'));
        callback(e, button);
        div.append(li.append(button));
      });
      $('#view').append(div);
    }
    /**
     *
     * @param String url calendar feed url
     */
    var screenRecentFeeds = function(url){
      service.getRecentFeeds(url).then(function(res){
        listify(res, function(e, button){
          var title = e.getTitle().getText();
          var times = e.getTimes();
          button.text(title + " " + times[0].startTime);
        });
      });
    }
    /**
     *
     */
    var screenAllCalendars = function(){
      service.retrieveAllCalendars().then(function(res){
        listify(res, function(e, button){
          var title = e.getTitle().getText();
          button.text(title);
          button.attr('href', '#');
          button.click(function(){
            var href = e.getLink().getHref()
            screenRecentFeeds(href);
            return false;
          });
        });
      });
    }
    screenAllCalendars();
  }
  self.start = function(){
    this.getMyFeed();
  }
  return self;
})();

google.setOnLoadCallback(function(){
  App.start();
});

// --------------------------------

// == 間違い１==
// 
// 非公開カレンダーは ..../public/full では
// Error: このカレンダーの一般公開権限がありません。このカレンダーのオーナーであれば、カレンダーの共有設定を変更するとカレンダーを一般公開できます。
// と言われる
// var url = "https://www.google.com/calendar/feeds/tpuq2b1csas8fe435qve0taab4@group.calendar.google.com/public/full";
//
// == 間違い２==
// Protocolは http ではなく https で。でなければこのように言われる
// 401 Authorization required
// Unsafe JavaScript attempt to access frame with URL about:blank from frame with URL http://127.0.0.1/a/google-calendar-js/. Domains, protocols and ports must match.
//
// my private calendar
//var url = "https://www.google.com/calendar/feeds/tpuq2b1csas8fe435qve0taab4@group.calendar.google.com/private/full";
//var url = "https://www.google.com/calendar/feeds/default/private/full";
//var privateUrl = "https://www.google.com/calendar/feeds/tpuq2b1csas8fe435qve0taab4@group.calendar.google.com/private/full";
//var privateUrl = "https://www.google.com/calendar/feeds/default/private/full";
// public calendar
// var url = "http://www.google.com/calendar/feeds/fvijvohm91uifvd9hratehf65k@group.calendar.google.com/public/full";

// --------------------------------

function doAction(){
  var service = null;
  var url = privateUrl;
  service = new google.gdata.calendar.CalendarService
    ("calendar-sample");

  if (!GoogleAuth.checkLogin()){
    alert("ログインしてないよ！");
    return;
  }
  var t1 = document.getElementById("time1").value;
  var t2 = document.getElementById("time2").value;
  var title = document.getElementById("title").value;
  var start = new google.gdata.DateTime.fromIso8601(t1);

  var end = new google.gdata.DateTime.fromIso8601(t2); 

  var entry = new google.gdata.calendar.CalendarEventEntry();
  entry.setTitle(google.gdata.atom.Text.create(title));

  var when = new google.gdata.When();
  when.setStartTime(start);
  when.setEndTime(end);
  entry.addTime(when);

  var func = function(result) {
    alert("イベントを追加しました。");
    getMyFeed();
  }
  service.insertEntry(url,entry,func,handleError,
      google.gdata.calendar.CalendarEventEntry);
}



function PRINT(e){
  console.log(e);
}

function createSingleEvent(){
  /*
   * Create a single event
   */ 

  // Create the calendar service object
  var calendarService = new google.gdata.calendar.CalendarService('GoogleInc-jsguide-1.0');

  // The default "private/full" feed is used to insert event to the 
  // primary calendar of the authenticated user
  var feedUri = privateUrl

  // Create an instance of CalendarEventEntry representing the new event
  var entry = new google.gdata.calendar.CalendarEventEntry();

  // Set the title of the event
  entry.setTitle(google.gdata.atom.Text.create('JS-Client: insert event'));

  // Create a When object that will be attached to the event
  var when = new google.gdata.When();

  // Set the start and end time of the When object
  var startTime = google.gdata.DateTime.fromIso8601("2011-09-19T09:00:00.000-08:00");
  var endTime = google.gdata.DateTime.fromIso8601("2011-09-19T10:00:00.000-08:00");
  when.setStartTime(startTime);
  when.setEndTime(endTime);

  // Add the When object to the event 
  entry.addTime(when);

  // The callback method that will be called after a successful insertion from insertEntry()
  var callback = function(result) {
    PRINT('event created!');
  }

  // Error handler will be invoked if there is an error from insertEntry()
  var handleError = function(error) {
    PRINT(error);
  }

  // Submit the request using the calendar service object
  calendarService.insertEntry(feedUri, entry, callback, 
      handleError, google.gdata.calendar.CalendarEventEntry);
}
