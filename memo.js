// --------------------------------
// JSメモ
// 
// 
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
