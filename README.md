GCalViz: Google Calendar Visualizer on client-side JavaScript

Overview
================

Features
----------------
- To look over your Google Calendar.
- Not to send your data to outsider's server.

The concrete purpose of this tool is visualization and analyzation of 
a [sleep diary](http://en.wikipedia.org/wiki/Sleep_diary). Though, I shall make 
it as generalized as possible.

Support Browsers
----------------

- Chrome 14


ToDo
================

- [Done] Calendarを選択させる
- [Done] 月間グラフを出力する
  - [Done] 今月の一覧を取得する
  - [Done] All day Eventを除く
- [Done] 分単位で出力する
- カレンダーのデフォルト設定
- [Done] 月を変更する
  - [Done] 月移動
- 土日を色分け
- Hourをグラフ表示にわかりやすく表示
- 日単位、月単位で合計時間を出力
- タイトル、メモ等から補足イベント抽出
- pushState/breadcrumbs/back UI or something
- Loading Interface
- On/Off Repeat Event
- On/Off All day Event
- iPhone最適化
- mouseoverで詳細表示
- Cache?
- Bug: 月をまたいだ場合の時間が表示されない

ChangeLog
================

- 2011-10-23 v0.0.3 Rewrite rendering calendar to on raphael
- 2011-10-10 v0.0.1 first release


