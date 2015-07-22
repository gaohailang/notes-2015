
$browser
$log
$exceptHandler
$interval
TzDate
animate
dump: serializing angular objects(scope, element, etc) into strong, for debugging
$httpBackend
ngMockE2E.$httpBackend (MockXhr, MockHttpException, createXX)

$TimeoutDecorator
$RAFDecorator
$AsyncCallbackDecorator
$RootElementProvider
$ControllerDecorator

ngMockE2E's $httpBackend


```js
// decorator $rootScope with countWatchers, countChildScopes


function createHttpBackendMock($rootScope, $timeout, $delegate, $browser) {
  var definitions = []
    , expections = []
    , responses = []
    , responsesPush = angular.bind(responses, responses.push)
    , copy = angular.copy;

  // createResponse
  // $httpBackend
  function $httpBackend(method, url, data, callback, headers, timeout, withCredentials) {
    // prettyPrint, wrapResponse
    // expection first check
    var i = -1, definition;
    while((defintion = defintions[++i])) {
      // if d.match()
      if (definition.response) {
        // if $browser specified, we do auto flush all requests
        ($browser ? $browser.defer : responsesPush)(wrapResponse(definition));
      } else if (definition.passThrough) {
        $delegate(method, url, data, callback, headers, timeout, withCredentials);
      } else throw new Error('No response defined !');
      return;
    }
    throw wasExpected ?
      new Error('No response defintion!'):
      new Error('Unexpected request: ' + method + ' ' + url + '\n' +
        (expectation ? 'Expected ' + expectation : 'No more request expected')
      );
  }

  $httpBackend.when = function(method, url, data, headers) {
    var definition = new MockHttpException(method, url, data, headers)
      , chain = {
          respond: function(status, data, headers, statusText) {
            definition.passThrough = undefined;
            definition.response = createResponse(status, data, headers, statusText);
            return chain;
          }
        };

    if($browser) {
      chain.passThrough = function() {
        definition.response = undefined;
        definition.passThrough = true;
        return chain;
      }
   }

   definitions.push(definition);
   return chain;
  };
}
function MockHttpException(method, url, data, headers) {
  this.data = data;
  this.headers = headers;

  // this.match, matchUrl, matchHeaders, matchData, toString
}
```

```js

$delegate.flush = function(delay) {
  $browser.defer.flush(delay);
};
$delegate.verifyNoPendingTasks = function() {
  if($browser.deferredFns.length) {
    throw new Error('')
  }
};
function formatPendingTasksAsSting(tasks) {
  var result = [];
  angular.forEach(tasks, (task)=>{
    result.push(
      `{id: ${task.id}, time: ${task.time}}`
    );
  });
  return result.join(',');
}






$interval.flush = function(millils) {
  now += millis;
  while (repeatFns.length && repeatFns[0].nextTime <= now) {
    var task = repeatFns[0];
    task.fn();
    task.nextTime += task.delay;
    repeatFns.sort((a, b)=>{
      return a.nextTime - b.nextTime;
    });
  }
  return millis;
}

function padNumber(num, digits, trim) {
  while(num.length < digits) num = '0' + num;
  if(trim) {
    num = num.substr(num.length - digits);
  }
}
config(function($provide) {
  var reflowQueue = [];
  $provide.value('$$animateReflow', (fn)=>{
    var idx = reflowQueue.length;
    reflowQueue.push(fn);
    return function cancel() {
      reflowQueue.splice(idx, 1);
    }
  });
});

config(function($provide) {
  $provide.decorator('$animate', function() {
    var animate = {
      queue: [],
      cancel: $delegate.cancel,
      enabled: $delegate.enabled,
      triggerCallbackEvents: function() {
        $$rAF.flush();
        $$asyncCallback.flush();
      },
      triggerReflow: function() {
        angular.forEach(reflowQueue, function(fn) {
          fn();
        });
        reflowQueue = [];
      }
    };

    angular.forEach(
      ['animate', 'enter', 'leave', 'move', 'addClass', 'removeClass', 'setClass'], function(method) {
        animate[method] = function() {
          animate.queue.push({
            event: method,
            element: arguments[0],
            options: arguments[arguments.length -1],
            args: arguments
          });
        }
        return $delegate[method].apply($delegate, arguments);
      }
    );

    return animate;
  });
});

mock.dump = function(object) {
  return serialize(object);

  function serialize(object) {
    // element, array, object(angular), error, toJson, String(xx)
  }

  function serializeScope(scope, offset) {
    offset = offset || '  ';
    var log = [offset + 'Scope(' + scope.$id + '): {'];
    for(var key in scope) {
      if(Object.prototype.hasOwnProperty.call(scope, key) && !key.match(/^(\$|this)/)) {
        log.push('  '+key+': '+angular.toJson(scope[key]));
      }
    }
    var child = scope.$$childHead;
    while (child) {
      log.push(serializeScope(child, offset + '  '));
      child = child.$$nextSibling;
    }
    log.push('}');
    return log.join('\n'+offset);
  }
};

/*
at Angular Application, $http sends the request to a real server using $httpBackend service.
* - `$httpBackend.expect` - specifies a request expectation
* - `$httpBackend.when` - specifies a backend definition
*/

```

```js
// The controller code
function MyController($scope, $http) {
  var authToken;
  $http.get('/auth.py').success(function(data, status, headers) {
    authToken = headers('A-Token');
    $scope.user = data;
  });
  $scope.saveMessage = function(message) {
    var headers = { 'Authorization': authToken };
    $scope.status = 'Saving...';
    $http.post('/add-msg.py', message, { headers: headers } ).success(function(response) {
      $scope.status = '';
    }).error(function() {
      $scope.status = 'ERROR!';
    });
  };
}

// testing controller
describe('MyController', function() {
   var $httpBackend, $rootScope, createController, authRequestHandler;

   // Set up the module
   beforeEach(module('MyApp'));
   beforeEach(inject(function($injector) {
     // Set up the mock http service responses
     $httpBackend = $injector.get('$httpBackend');
     // backend definition common for all tests
     authRequestHandler = $httpBackend.when('GET', '/auth.py')
      .respond({userId: 'userX'}, {'A-Token': 'xxx'});

     // Get hold of a scope (i.e. the root scope)
     $rootScope = $injector.get('$rootScope');
     // The $controller service is used to create instances of controllers
     var $controller = $injector.get('$controller');

     createController = function() {
       return $controller('MyController', {'$scope' : $rootScope });
     };
   }));

   afterEach(function() {
     // Verifies that all of the requests defined via the expect api were made.
     $httpBackend.verifyNoOutstandingExpectation();
     $httpBackend.verifyNoOutstandingRequest();
   });


   it('should fetch authentication token', function() {
     $httpBackend.expectGET('/auth.py');
     var controller = createController();
     $httpBackend.flush();
   });
   it('should fail authentication', function() {
     // Notice how you can change the response even after it was set
     authRequestHandler.respond(401, '');
     $httpBackend.expectGET('/auth.py');
     var controller = createController();
     $httpBackend.flush();
     expect($rootScope.status).toBe('Failed...');
   });
   it('should send msg to server', function() {
     var controller = createController();
     $httpBackend.flush();
     // now you don’t care about the authentication, but
     // the controller will still send the request and
     // $httpBackend will respond without you having to
     // specify the expectation and response for this request
     $httpBackend.expectPOST('/add-msg.py', 'message content').respond(201, '');
     $rootScope.saveMessage('message content');
     expect($rootScope.status).toBe('Saving...');
     $httpBackend.flush();
     expect($rootScope.status).toBe('');
   });
   it('should send auth header', function() {
     var controller = createController();
     $httpBackend.flush();
     $httpBackend.expectPOST('/add-msg.py', undefined, function(headers) {
       // check if the header was sent, if it wasn't the expectation won't
       // match the request and the test will fail
       return headers['Authorization'] == 'xxx';
     }).respond(201, '');
     $rootScope.saveMessage('whatever');
     $httpBackend.flush();
   });
});

```

```js
angular.module('ngMockE2E', ['ng']).config(function($provide) {
  $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
});

```


