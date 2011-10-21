var GCalService = (function(){
  var GCalService = function(serviceName){
    var self = this;
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
     * できる限り全てのイベントフィードを取得
     */
    this.getAllFeeds = function(url){
      query = new google.gdata.calendar.CalendarEventQuery(url);
      query.setOrderBy(google.gdata.calendar.CalendarEventQuery.ORDERBY_START_TIME);
      query.setSortOrder(google.gdata.calendar.CalendarEventQuery.SORTORDER_ASCENDING);
      query.setSingleEvents(true);
      query.setMaxResults(10); // どこまで取得可能なのか？
      
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
