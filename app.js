/**
 * ToDo
 * ----------------
 *
 * [Done] Calendarを選択させる
 * [Done] 月間グラフを出力する
 *   [Done] 今月の一覧を取得する
 *   [Done] All day Eventを除く
 * 分単位で出力する 
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
     * 全日イベントかどうか
     * @param google.gdata.calendar.CalendarEventEntry event
     * @return boolean true if event is all day event
     */
    var isAllDayEvent = function(event){
      var time = event.getTimes()[0];
      var startTime = google.gdata.DateTime.fromIso8601(time.startTime);
      var endTime = google.gdata.DateTime.fromIso8601(time.endTime);
      return startTime.isDateOnly() && endTime.isDateOnly();
    }
    /**
     * 今月のフィードを取得
     */
    this.getFeeds = function(url, date){
      query = new google.gdata.calendar.CalendarEventQuery(url);
      query.setOrderBy(google.gdata.calendar.CalendarEventQuery.ORDERBY_START_TIME);
      query.setSortOrder(google.gdata.calendar.CalendarEventQuery.SORTORDER_ASCENDING);
      query.setSingleEvents(true);
      query.setMaxResults(100); // Todo: variable
      var start = google.gdata.DateTime.fromIso8601(google.gdata.DateTime.toIso8601(date).slice(0, 7) + '-01');
      // Todo: 31日もない月はどうなるか確認
      var end = google.gdata.DateTime.fromIso8601(google.gdata.DateTime.toIso8601(date).slice(0, 7) + '-31');
      query.setMinimumStartTime(start);
      query.setMaximumStartTime(end);
      
      var dfd = jQuery.Deferred();
      var callback = function(result) {
        var entries = result.feed.entry;
        // 全日イベントを除外 Todo: オプション化
        var filteredEntries = jQuery.grep(entries, function(e, i){
          return !isAllDayEvent(e);
        });
        dfd.resolve(filteredEntries);
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

      // Deferredのこのへん抽象化できるかな？
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

var DateTime = (function(){
  var aDayMilliSecond = 86400000;
  var DateTime = function(obj){
    var d = null;
    var construct = function(obj){
      if (obj instanceof Date){
        d = obj;
      }else if (obj == null){
        d = new Date();
      }else if (!isNaN(obj)){
        d = new Date(obj);
      }else if (obj instanceof DateTime){
        d = obj;
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
    this.getMonthFirst = function(){
      return new DateTime(new Date(d.getFullYear(), d.getMonth(), 1));
    }
    /**
     * @return DateTime
     */
    this.getMonthLast = function(){
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
    this.afterBySecond = function(second){
      return new DateTime(d.getTime() + second * 1000);
    }
  }
  return DateTime;
})();
/*
console.log(new DateTime().getYear());  
console.log(new DateTime().getMonth());  
console.log(new DateTime().getDay());  
*/

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
      var div = $(document.createElement('ul'));
      $.each(elements, function(k, e){
        var li = $(document.createElement('li'));
        var button = $(document.createElement('a'));
        callback(e, button);
        div.append(li.append(button));
      });
      $('#view').append(div);
    }
    var t = function(tag){
      return $(document.createElement(tag));
    }
    var eachDayOfMonth = function(date, callback){
      var monthFirst = new DateTime(date).getMonthFirst();
      var datetime = new DateTime(date).getMonthFirst();
      do{
        callback(datetime.getDate());
        datetime = datetime.tomorrow();
      }while(datetime.getMonth() == monthFirst.getMonth());
    }
    /**
     *
     * @param google.gdata.calendar.CalendarEntry calendar
     */
    var screenRecentFeeds = function(calendar){
      var url = calendar.getLink().getHref()
      var field = $('#view');
      field.empty();

      var title = t('h2').appendTo(field);
      title.text(calendar.getTitle().getText());
      
      var today = new Date();
      var date = new google.gdata.DateTime(today, true);

      var subtitle = t('h3').appendTo(field);
      var yearMonthFormat = new DateFormat("yyyy/MM");
      subtitle.text(yearMonthFormat.format(today));

      // レンダリング、ピクセル単位でやった方が分単位で正確にできそう
      // 月のタイムテーブルを出力
      var table = t('table').appendTo(field).addClass('timetable');
      var tbody = t('tbody').appendTo(table);

      var dateId = function(date){
        return 'tt-' + date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() + '-' + date.getHours();
      }
      eachDayOfMonth(today, function(day){
        var tr = t('tr').appendTo(table);
        var th = t('th').appendTo(tr);
        th.text(day.getDate());
        _(24).times(function(i){
          var td = t('td').appendTo(tr);
          var tdTime = new Date(day.getFullYear(), day.getMonth(), day.getDate(), i+1, 0, 0);
          td.attr('id', dateId(tdTime));
          td.html('&nbsp;&nbsp;&nbsp;&nbsp;');
        });
      });
      
      service.getFeeds(url, date).then(function(res){
        // 該当日時を色付け
        _.each(res, function(e){
          var times = e.getTimes();
          var startDate = google.gdata.DateTime.fromIso8601(times[0].startTime).getDate();
          var endDate = google.gdata.DateTime.fromIso8601(times[0].endTime).getDate();

          // 合計時間
          var ms = endDate.getTime() - startDate.getTime();
          var valHour  = Math.floor(ms / 3600 / 10) / 100;
         
          var d = new DateTime(startDate);
          do{
            var a = $('#' + dateId(d.getDate()));
            a.addClass('filled');
            d = d.afterBySecond(3600);
            console.log(d);
          }while(d.compareTo(endDate) <= 0);

        });
        /*
        listify(res, function(e, button){
          var title = e.getTitle().getText();
          var times = e.getTimes();
          var startDate = google.gdata.DateTime.fromIso8601(times[0].startTime).getDate();
          var endDate = google.gdata.DateTime.fromIso8601(times[0].endTime).getDate();
          var ms = endDate.getTime() - startDate.getTime();
          // 合計時間
          var valHour  = Math.floor(ms / 3600 / 10) / 100;
          var dateFormat = new DateFormat("yyyy/MM/dd HH:mm:ss");
          button.text(title + " " + dateFormat.format(startDate) + " " + dateFormat.format(endDate) + " " + valHour);
        });
        */
      });
    }
    /**
     *
     */
    var screenAllCalendars = function(){
      $('#view').empty();
      service.retrieveAllCalendars().then(function(res){
        listify(res, function(e, button){
          var title = e.getTitle().getText();
          button.text(title);
          button.attr('href', '#');
          button.click(function(){
            screenRecentFeeds(e);
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
