## Why

angular is cited as built with testing in mind.
as increasing complexity and density, quickly grow out of hand
testing is good approach to keep code maintainable, understandable, debug-able, and bug-free.

Separation of concerns
"when we are testing the sort function we don't want to be forced into creating related pieces such as the DOM elements, or making any XHR calls to fetch the data to sort."
it's hard (because developers mix concerns resulting a piece of code does everthing)

write tests first - TDD
write tests where we confirm functionality(behind)
write tests to black-box test the functionality of overall system

对于回归性测试有很重要的保证，当你改动什么东西，不用担心会broken掉之前的功能！不用每次要刷新页面看功能是否正常，不用每次都要构建条件上下文一步步的去复现等，也可以有校验后端接口的测试


### unit test

- DI
- karam - cli to spawn web server which loads app's source code and executes tests(run against browsers), display results
- jasmine - behavior driven development framework( structuring your tests and also making assertions)
- angular-mocks - ngMock($httpBackend, inject and mock angular services within test, keep tests synchronous?)

```js
describe 'module test'
    beforeEach(module('app')); // bootstrap app module
    var $controller; // global it
    beforeEach(inject(function(_$controller_) {
        // injector unwras _ automately
        // a convention wide spread in AngularJS community to keep the variable names clean in your tests.
        $controller = _$controller_;
    }));

    describe 'submodule test'
        it 'test case'

            expect(xx).toBe(yy)

// controller
{
    controller = $controller('PasswordController', { $scope: $scope });
    $scope.password = 'a';
    $scope.grade();
    expect($scope.strength).toEqual('weak');
}
// filter
{
    // load $filter to global var by inject
    var length = $filter('length');
    expect(length(null)).toEqual(0);
}
// directive
{
    // inject $rootScope, $compile(available to all tests)
    var element = $compile('<diretive-a></diretive-a>')($rootScope);
    $rootScope.$digest();
    expect(element.html()).toContain('xxx');
}
```


karam init -> generate initial template use to build tests

karam start


### e2e

Protractor, use webdriver to control browsers and simulate user actions. use jasmine for its test syntax.

it needs two files to run, test or spec file, configuration file.
wrapper around WebDriverJS(API is based on promise)

npm install -g protractor
protractor and webdriver-manager cli
webdriver-manager update


`webdriver-manager start`
`protractor conf.js`

`element` function is for finding elements(it return ElementFinder), interact with or get information from it. (ElementArrayFinder)

`by` object creates Locators.

```js
// conf.js
exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['spec.js']
}

// spec.js
describe('Protractor Demo App', function() {
  it('should have a title', function() {
    browser.get('http://juliemr.github.io/protractor-demo/');

    expect(browser.getTitle()).toEqual('Super Calculator');
  });
});

// Find the element with ng-model="user" and type "jacksparrow" into it
element(by.model('user')).sendKeys('jacksparrow');

// Find the first (and only) button on the page and click it
element(by.css(':button')).click();

// Verify that there are 10 tasks
expect(element.all(by.repeater('task in tasks')).count()).toEqual(10);

```



### Demo

#### e2e test

```js
describe('Search View', function() {
  browser.get('http://localhost:8100/');
  var term = element(by.model('model.term'));
  var button = element(by.className('button-search'));
  var results = element.all(by.repeater('result in results'));

  it('should open to the search view', function() {
    expect(term.getText()).toBe('');
  });

  it('should search for a term', function () {
    term.sendKeys('london, uk');
    button.click();
    expect(results.count()).toEqual(1);
  });

  it('should take us to the London, UK weather view', function () {
    results.first().click();
    var title = element(by.tagName('ion-side-menu-content')).element(by.className('title'));
    expect(title.getText()).toEqual('London, UK');
  });
});
```

#### unit test
karma.conf.js
views/search/search.js
test/unit/search-ctrl.spec.js

karma start karam.conf.js

太难用了... files，然后reporter太简单了， 对于异步代码测试, done 不生效？

```js
module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
    files: [
      'www/lib/ionic/js/ionic.bundle.js',
      'www/lib/moment/moment.js',
      'www/lib/moment-timezone/builds/moment-timezone-with-data.js',
      'www/lib/suncalc/suncalc.js',
      'www/lib/angular-mocks/angular-mocks.js',
      'www/js/**/*.js',
      'www/views/**/*.js',
      'test/unit/**/*.js'
    ],
    reporters: ['progress'],
    browsers: ['Chrome']
  });
};
```

```js
angular.module('App')
.controller('SearchCtrl', function ($scope, $http) {
  $scope.model = {term: ''};

  $scope.search = function () {
    $http.get('http://maps.googleapis.com/maps/api/geocode/json', {params: {address: $scope.model.term}}).success(function (response) {
      $scope.results = response.results;
    });
  };
});
```

```js
describe('Search Controller', function () {
  var scope, httpBackend;

  beforeEach(module('App'));

  beforeEach(inject(function ($rootScope, $controller, $httpBackend) {
    scope = $rootScope.$new();
    httpBackend = $httpBackend;
    httpBackend.when('GET', 'http://maps.googleapis.com/maps/api/geocode/json?address=london').respond({results: [{}, {}, {}]});
    httpBackend.when('GET', 'views/weather/weather.html').respond('');
    httpBackend.when('GET', 'views/settings/settings.html').respond('');
    httpBackend.when('GET', 'views/search/search.html').respond('');
    $controller('SearchCtrl', {
      $scope: scope
    });
  }));

  it('should load with a blank model', function () {
    expect(scope.model.term).toEqual('');
  });

  it('should be able to search for locations', function () {
    scope.model.term = 'london';
    scope.search();
    httpBackend.flush();
    expect(scope.results.length).toEqual(3);
  });
})
```