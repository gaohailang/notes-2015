
h5bp/mobile-boilerplate

Mobile boilerplate helper functions
有如下方法：
MBP.scaleFix
fastButton
preventZoom 等


why $routeProvider 中：
reloadOnSearch: false


这样 ctrl 定义可以晚于 angular.module 定义，但是这样必须写$inject 或者通过@ng-annotation 注释下便于压缩？

```js
App.DetailCtrl = function($scope, $http) {

};
App.DetailCtrl.$inejct = ['$scope', '$http'];

!(function() {

})(window.App||(window.App = {}))
```

最外围的 AppCtrl， 在$routeChangeSuccess，有相关 document.title 的方案，还有手动设置 document.back = backUrl(customHistory)

在httpProvider.responseInterceptor 注入两个劫持器用于限时错误和统计请求信息

里面的jsb.js 
document.addEventLisntener('WebViewJavascriptBridgeReady', onBridgeReady, false);

```js
function onBridgeReady(event) {

    bridge.init(function(msg, callback) {});

    getBridge().callHandler('getCurrentUser', {}, function(r) {

        window.userData.u = 'xx'
    });
}
```


