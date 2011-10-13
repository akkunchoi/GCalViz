/**
 * API 
 * http://code.google.com/intl/ja/apis/gdata/jsdoc/2.2/index.html
 */

google.load("jquery", "1.6.4");
google.load("gdata", "2");



/**
 * Google Auth wrapper
 * ユーザー名とかは取得できないっぽい？
 * 
 */
var GoogleAuth = (function(){
  var GoogleAuth = function(scope){
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
  return GoogleAuth;
})();

var GCalService = (function(){
  var GCalService = function(serviceName){
    var service = null;
    /**
     *
     * @return google.gdata.calendar.CalendarService
     */
    this.getService = function(){
      service = service || new google.gdata.calendar.CalendarService(serviceName);
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
  return GCalService;
})();

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

/**
 * @class App
 *
 */
var App = (function(){
  /**
   * @constructor
   * 前提：onLoad完了
   * 
   */
  var App = function(){
    var self = this;
    var $ = jQuery;
    var gcalAuth = new GoogleAuth("https://www.google.com/calendar/feeds/");
    var service = new GCalService("GCalViz");
    
    var view = $('#view');
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
      view.append(div);
    }
    /**
     * alias for document.createElement
     */
    var t = function(tag){
      return $(document.createElement(tag));
    }
    /**
     * 一ヶ月をeach
     */
    var eachDayOfMonth = function(date, callback){
      var monthFirst = new DateTime(date).getDayOfMonthFirst();
      var datetime = new DateTime(date).getDayOfMonthFirst();
      do{
        callback(datetime.getDate());
        datetime = datetime.tomorrow();
      }while(datetime.getMonth() == monthFirst.getMonth());
    }
    /**
     *
     * @param google.gdata.calendar.CalendarEntry calendar
     * @param DateTime today 表示したい月
     */
    this.showFeeds = function(calendar, today){
      today = new DateTime(today);
      
      var url = calendar.getLink().getHref()
      var field = view;
      field.empty();

      var title = t('h2').appendTo(field);
      title.text(calendar.getTitle().getText());

      var date = new google.gdata.DateTime(today.getDate(), true);

      var dateNavigationField = t('div').addClass('date-navigation').appendTo(field);
      var subtitle = t('span').addClass('current-date').appendTo(dateNavigationField);
      var yearMonthFormat = new DateFormat("yyyy/MM");
      subtitle.text(yearMonthFormat.format(today.getDate()));

      // 先月に移動
      var moveToLastMonth = t('span').addClass('btn').text('Last Month').appendTo(dateNavigationField);
      moveToLastMonth.click(function(){
        self.showFeeds(calendar, today.lastMonth());
      });
      
      // レンダリング、ピクセル単位でやった方が分単位で正確にできそう
      // 月のタイムテーブルを出力
      var table = t('table').appendTo(field).addClass('timetable');
      var tbody = t('tbody').appendTo(table);

      var minutesDiv = 6;
      var dateId = function(date){
        return 'tt-'
          + date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() 
          + '-' + date.getHours() + '-' + Math.floor(date.getMinutes() / (60 / minutesDiv));
      }
      eachDayOfMonth(today.getDate(), function(day){
        var tr = t('tr').appendTo(tbody);
        var th = t('th').appendTo(tr);
        th.text(day.getDate());
        _(24).times(function(i){
          _(minutesDiv).times(function(j){
            var td = t('td').appendTo(tr);
            var tdTime = new Date(day.getFullYear(), day.getMonth(), day.getDate(), i+1, j * (60 / minutesDiv));
            td.attr('id', dateId(tdTime));
            td.html('&nbsp;');
          });
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

          var func = function(){
            console.log(startDate, endDate);
          }
          
          var d = new DateTime(startDate);
          do{
            var a = $('#' + dateId(d.getDate()));
            a.addClass('filled');
//          a.CreateBubblePopup({
//									position : 'top',
//									align	 : 'center',
//									innerHtml: startDate + ':' + endDate,
//									innerHtmlStyle: {
//                    color:'#FFFFFF', 
//                    'text-align':'center'
//                  },
//                  themeName: 	'all-black',
//									themePath: 	'js/jqbp/jquerybubblepopup-theme'
//								});
            
            d = d.afterBySecond(3600 / minutesDiv);
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
    this.start = function(){
      var loginButton = $('#login-button');
      var logoutButton = $('#logout-button');

      loginButton.click(function(){
        gcalAuth.login();
      });
      logoutButton.click(function(){
        gcalAuth.logout();
        location.reload();
      });

      if (gcalAuth.checkLogin()){
        loginButton.addClass('disabled');
//        this.getMyFeed();
        this.showCalendars();
      }else{
        logoutButton.addClass('disabled');
      }
    }
    this.showCalendars = function(){
      view.empty();
      t('h2').text('Loading...').appendTo(view);
      service.retrieveAllCalendars().then(function(res){
        view.empty();
        t('h2').text('Please choose a calendar').appendTo(view);
        listify(res, function(e, button){
          var title = e.getTitle().getText();
          button.text(title);
          button.attr('href', '#');
          button.click(function(){
            self.showFeeds(e);
            return false;
          });
        });
      });
    }
    this.start();
  }
  return App;
})();

google.setOnLoadCallback(function(){
  new App();
});

