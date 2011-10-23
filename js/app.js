/**
 * API 
 * http://code.google.com/intl/ja/apis/gdata/jsdoc/2.2/index.html
 */

google.load("jquery", "1.6.4");
google.load("gdata", "2");

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
    var gcalAuth = new GAuth("https://www.google.com/calendar/feeds/");
    var service = new GCalService("GCalViz");
    
    var mainView = $('#main');
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
        callback(e, button, li);
        div.append(li.append(button));
      });
      return div;
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
     * main 
     * 
     */
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

      loginButton.show();
      
      if (gcalAuth.checkLogin()){
        loginButton.hide();
        logoutButton.show();
        
        // show calendars
        this.showCalendars();
      }
    }
    /**
     * first view
     * 
     */
    this.showCalendars = function(){
      // switch to view-second
      mainView.removeClass().addClass('view-second');
        
      view.empty();
      t('h2').text('Loading...').appendTo(view);
      service.retrieveAllCalendars().then(function(res){
        view.empty();
//        t('h2').text('Please choose a calendar').appendTo(view);
        var div = listify(res, function(e, button, li){
          var title = e.getTitle().getText();
          button.text(title);
          button.attr('href', '#');
          button.click(function(){
            self.showFeeds(e);
            return false;
          });
        });
        view.append(div.addClass('calendars'));
      });
    }
    /**
     *
     * @param google.gdata.calendar.CalendarEntry calendar
     * @param DateTime today 表示したい月
     */
    this.showFeeds = function(calendar){
      var url = calendar.getLink().getHref()
      view.empty();

      var backlink = t('a')
        .attr('href', '#')
        .text('All Calendars')
        .addClass('backlink')
        .appendTo(view)
        .click(function(){
          self.showCalendars();
        });
      var title = t('h2').appendTo(view);
      title.text(calendar.getTitle().getText());

      var calcDayId = function(date){
        return 'day-'
          + date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate();
      }
      var timetable = t('div').addClass('timetable').appendTo(view);
      var yearMonthFormat = new DateFormat("yyyy/MM/dd");
      var timeFormat = new DateFormat("HH:mm:ss");
      
      var getDayField = function(date){
        var day = $('#' + calcDayId(date));
        if ($('#' + calcDayId(date)).size() == 0){
          day = t('div').addClass('timetable-day')
            .attr('id', calcDayId(date))
            .appendTo(timetable);
          t('span').text(yearMonthFormat.format(date))
            .appendTo(day);
        }
        return day;
      }
      var render = function(k, e){
        var times = e.getTimes();
        var startDate = google.gdata.DateTime.fromIso8601(times[0].startTime).getDate();
        var endDate = google.gdata.DateTime.fromIso8601(times[0].endTime).getDate();
        
        var sDay = getDayField(startDate);
        t('span').addClass('timetable-entry')
          .text('s' + timeFormat.format(startDate))
          .appendTo(sDay);
          
        var eDay = getDayField(endDate);
        t('span').addClass('timetable-entry')
          .text('e' + timeFormat.format(endDate))
          .appendTo(eDay);
      }
      service.getAllFeeds(url)
        .then(function(res){
          $.each(res, render);
        }).then(function(){
        });
      
//          // 合計時間
//          var ms = endDate.getTime() - startDate.getTime();
//          var valHour  = Math.floor(ms / 3600 / 10) / 100;

//          var func = function(){
//            console.log(startDate, endDate);
//          }
          
//          var d = new DateTime(startDate);
//          do{
//            var a = $('#' + dateId(d.getDate()));
//            a.addClass('filled');
//            
//            d = d.afterBySecond(3600 / minutesDiv);
//          }while(d.compareTo(endDate) <= 0);

//      var date = new google.gdata.DateTime(today.getDate(), true);
//
//      var dateNavigationField = t('div').addClass('date-navigation').appendTo(view);
//      var subtitle = t('span').addClass('current-date').appendTo(dateNavigationField);
//      var yearMonthFormat = new DateFormat("yyyy/MM");
//      subtitle.text(yearMonthFormat.format(today.getDate()));
//
//      // 先月に移動
//      var moveToLastMonth = t('span').addClass('btn').text('Last Month').appendTo(dateNavigationField);
//      moveToLastMonth.click(function(){
//        self.showFeeds(calendar, today.lastMonth());
//      });
//      
//      // レンダリング、ピクセル単位でやった方が分単位で正確にできそう
//      // 月のタイムテーブルを出力
//      var table = t('table').appendTo(view).addClass('timetable');
//      var tbody = t('tbody').appendTo(table);
//
//      var minutesDiv = 6;
//      var dateId = function(date){
//        return 'tt-'
//          + date.getFullYear() + '-' + (date.getMonth()+1) + '-' + date.getDate() 
//          + '-' + date.getHours() + '-' + Math.floor(date.getMinutes() / (60 / minutesDiv));
//      }
//      eachDayOfMonth(today.getDate(), function(day){
//        var tr = t('tr').appendTo(tbody);
//        var th = t('th').appendTo(tr);
//        th.text(day.getDate());
//        _(24).times(function(i){
//          _(minutesDiv).times(function(j){
//            var td = t('td').appendTo(tr);
//            var tdTime = new Date(day.getFullYear(), day.getMonth(), day.getDate(), i+1, j * (60 / minutesDiv));
//            td.attr('id', dateId(tdTime));
//            td.html('&nbsp;');
//          });
//        });
//      });

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
    }
    this.start();
  }
  return App;
})();

google.setOnLoadCallback(function(){
  var $ = jQuery;
  $.when(
    $.getScript("js/gauth.js"),
    $.getScript("js/gcalservice.js"),
    $.getScript("js/datetime.js"),
    $.getScript("js/calendar.js"),
    $.Deferred(function(df){
      $(df.resolve);
    })
  ).done(function(){
    new App();
  });
});

