google.load("jquery", "1.6");
google.load("gdata", "2");

var service = null;
var url = "http://www.google.com/calendar/feeds/fvijvohm91uifvd9hratehf65k@group.calendar.google.com/public/full";

google.setOnLoadCallback(getMyFeed);

function getMyFeed(){
  service = new google.gdata.calendar.CalendarService("calendar-sample");
  query = new google.gdata.calendar.CalendarEventQuery(url);
  query.setOrderBy(google.gdata.calendar.CalendarEventQuery.ORDERBY_START_TIME);
  query.setSortOrder(google.gdata.calendar.CalendarEventQuery.SORTORDER_ASCENDING);
  query.setSingleEvents(true);
  query.setMaxResults(10);
  var start = new google.gdata.DateTime.fromIso8601("2010-01-01");
  var end = new google.gdata.DateTime.fromIso8601("2010-12-31"); 
  query.setMinimumStartTime(start);
  query.setMaximumStartTime(end);
  service.getEventsFeed(query, callback, handleError);
}

function callback(result) {
  var entries = result.feed.entry;
  var res = "";
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var title = entry.getTitle().getText();
    var times = entry.getTimes();
    res += (i + 1) + ": " + title + " (" + times[0].startTime + ")<br />";
  }
  document.getElementById("view").innerHTML = res;
}

function handleError(error) {
  document.getElementById("view").innerHTML = error;
}

