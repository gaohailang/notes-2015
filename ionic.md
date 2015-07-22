## ionic 代码结构

ion-list, ion-item: complex lists - (buttons exposed by swiping, reorder, delete)
collection-repeat: scroll through thousands of items(render viewable items)

navigation: ion-nav-bar, ion-nav-view
tabs
slidebox

pull-refresh, action-sheet

### ionic.scss

中因此导入相关的模块：
ionicons
variables: mixins 等
base: reset, scaffolding, type
components: action-sheet, backdrop, refresher, spinner, list, badge, menu, modal, popover, 等
forms
buttons
util: grid, util, platform
animations: animations, transitions


### ionic.js controller/directive/service/views


### views/scrollView
A powerful scroll view with support for bouncing, pull to refresh, and paging.

包含了 zyngaCore.effect.Animate: (requestAnimationFrame, stop, isRunning, start)

start(stepCb, verifyCb, completedCb, duration, easingMethod, root)



keyboard-attach attribute directive which cause an element to float above the keyboard when it shows(at ion-footer-bar)

### directive/toggle, view/toggleView

```js

IonicModule.directive('ionToggle', function($timeout, $ionicConfig) {
    return {
        replace: true,
        required: '?ngModel',
        transclude: true,
        template:
            '<div class="item item-toggle">' +
                '<div ng-transclude></div>' +
                '<label class="toggle">' +
                    '<input type="checkbox">' +
                    '<div class="track">' +
                        '<div class="handle"></div>' +
                    '</div>'+
                '</label>' +
            '</div>',
        compile: function(element, attr) {
            var input = element.find('input');
            forEach({
                'name': attr.name,
                'ng-model': attr.ngModel,
                'required': attr.ngRequired
                // true-value, change, checked, disabled etc
            }, function(val, name) {
                if(isDefined(value)) {
                    input.attr(name, val);
                }
            });

            // add toggleCLass for label
            // element.addClass using $ionicConfig.form.toggle() ?

            return function($scope, $element) {

                var ngModelController = jqLite(checkbox).controller('ngModel');

                $scope.toggle = new ionic.views.Toggle({
                    // el, track, checkbox, handle element
                    onChange: function() {
                        if(ngModelController) {
                            ngModelController.$setViewValue(checkbox.checked);
                            $scope.$apply();
                        }
                    }
                });

                $scope.$on('$destroy', function() {
                    $scope.toggle.destroy();
                })
            }
        }
    }
});

ionic.views.Toggle = ionic.views.View.inherit({
    initialize: function(opts) {
        this.el = opts.el;
        this.checkbox = opts.checkbox;
        this.track = opts.checkbox;
        this.handle = opts.handle;
        this.openPercent = 1;
        // bind event for guesture
        this.dragstartGesture = ionic.onGesture('dragstart', this.dragStratHandler, this.el);
        this.dragGesture = ionic.onGesture('drag', this.dragHandler, this.el);
        // dragHolderGesture, dragReleaseGesture
    },
    destroy: function() {
        // offGesture for dragstart, drag, hold, release
    },
    // drag, endDrag, hold, release
    setOpenPercent: function(openPercent) {
        // only make a change if the new openPercent has changed
        if() {
            this.openPercent = openPercent;
            if(openPercent === 0) {
                this.val(false);
            } else if(openPercent === 100) {
                this.val(true);
            } else {
                var openPixel = Math.round((openPixel/100)*this.track.offsetWidth - (this.handle.offsetWidth));
                openPixel = (openPixel < 1 ? 0 : openPixel);
                this.handle.style[ionic.CSS.TRANSFORM] = 'translate3d(' + openPixel + 'px,0,0)';
            }
        }
    },
    val: function(value) {
        if(value === true || value === false) {
            if(this.handle.style[ionic.CSS.TRANSFORM] !== '') {
                this.handle.style[ionic.CSS.TRANSFORM] = '';
            }
            this.checkbox.checked = value;
            this.openPercent = (value ? 100 : 0);
            this.onChange && this.onChange();
        }
        return this.checkbox.checked;
    }
})
```

### service/actionSheet.js // 结合 directive


```js
// usage
$ionicActionSheet.show({
  buttons: [{text: '<b>Share</b> This'}],
  desctructiveText: 'Delete',
  titleText: '',
  cacnelText: 'Cancel',
  cancel: function() {

  },
  buttonClick: function(idx) {

    return true; // for close sheet
  }
});


```

```js
IonicModule.factory('$ionicActionSheet', function($rootScope, $compile, $animate, $timeout, $ionicTemplateLoader, $ionicPlatform, $ionicBody, IONIC_BACK_PRIORITY) {
  return {
    show: actionSheet
  };

  function actionSheet(opts) {
    var scope = $rootScope.$new(true); // isolated

    // comiple template
    var element = scope.element = $compile('<ion-action-sheet ng-class="cssClass" buttons="buttons"></ion-action-sheet>')(scope);
    var sheetEl = jqLite(element[0].querySelector('.action-sheet-wrapper'));

    // cancel self when stateChangeSuccess
    var stateChangeListenDone = scope.cancelOnStateChange ? $rootScope.$on('$stateChangeSuccess', function() {
      scope.cancel();
    }): noop;

    // registerBackButtonAction（when backbutton ,which action should be executed
    // 在removeSheet 注意清除掉
    scope.$deregisterBackButton = $ionicPlatform.registerBackButtonAction(function() {
      $timeout(scope.cancel);
    }, IONIC_BACK_PRIORITY.actionSheet);

    scope.showSheet();

    $scope.removeSheet = function(done) {
      if(scope.removed) return;
      scope.removed = true;
      sheetEl.removeClass('action-sheet-up');
      // $timeout rmeove body's action-sheet-open
      // clean $deregisterBackButton, stateChangeListenDone

      // Todo: 查下 $destroy 的内幕
      $animate.removeClass(element, 'active').then(function() {
        scope.$destroy();
        element.remove();
        scope.cancel.$scope = sheetEl = null;
        (done || noop)();
      });
    };
    $scope.cancel = function() {
      scope.removeSheet(opts.cancel);
    };
    $scope.buttonClicked = function(idx) {
      if(opts.buttonClicked(index, opts.buttons[index]) === true) {
        scope.removeSheet();
      }
    };

    scope.showSheet = function(done) {
      $ionicBody.append(element).addClass('action-sheet-open');
      $animate.addClass(element, 'active').then(function() {
        if(scope.removed) return;
        (done || noop)();
      });
      $timeout(function() {
        if(scope.removed) return;
        sheetEl.addClass('action-sheet-up');
      }, 20, false); // invokeApply: false
    };

    return scope.cancel;
  }
});
```

```js
IonicModule.directive('ionActionSheet', function($document) {
  return {
    restrict: 'E',
    scope: true,
    replace: true,
    link: function($scope, $element) {

      $scope.$on('$destroy', function() {
        $element.remove();
        $document.unbind('keyup', keyUp);
      });

      $document.bind('keyup', keyUp);
      $document.bind('click', backdropClick);

      function keyUp(e) {
        if(e.which == 27) {
          $scope.cancel();
          $scope.$apply();
        }
      }

      function backdropClick = function(e) {
        if(e.target == $element[0]) {
          $scope.cancel();
          $scope.$apply();
        }
      }
    }
  }
})
```


### service/popup.js

```js
$scope.data = {}

// An elaborate, custom popup
var myPopup = $ionicPopup.show({
  template: '<input type="password" ng-model="data.wifi">',
  title: 'Enter Wi-Fi Password',
  subTitle: 'Please use normal things',
  scope: $scope,
  buttons: [
    { text: 'Cancel' },
    {
      text: '<b>Save</b>',
      type: 'button-positive',
      onTap: function(e) {
        if (!$scope.data.wifi) {
          //don't allow the user to close unless he enters wifi password
          e.preventDefault();
        } else {
          return $scope.data.wifi;
        }
      }
    },
  ]
});
```

```js
var POPUP_TPL =
  '<div class="popup-container" ng-class="cssClass">' +
    '<div class="popup">' +
      '<div class="popup-head">' +
        '<h3 class="popup-title" ng-bind-html="title"></h3>' +
        '<h5 class="popup-sub-title" ng-bind-html="subTitle" ng-if="subTitle"></h5>' +
      '</div>' +
      '<div class="popup-body">' +
      '</div>' +
      '<div class="popup-buttons" ng-show="buttons.length">' +
        '<button ng-repeat="button in buttons" ng-click="$buttonTapped(button, $event)" class="button" ng-class="button.type || \'button-default\'" ng-bind-html="button.text"></button>' +
      '</div>' +
    '</div>' +
  '</div>';

function createPopup(options) {
    options = extend({

    }, options||{});

    var self = {};
    self.scope = (options.scope || $rootScope).$new();
    self.element = jqLite(POPUP_TPL);
    self.responseDeferred = $q.defer();

    $ionicBody.get().appendChild(self.element[0]);
    $compile(self.element)(self.scope);

    extend(self.scope, {
        title: options.title,
        buttons: options.buttons,
        subTitle: options.subTitle,
        cssClass: options.cssClass,
        $buttonTapped: function(button, event) {
            var result = (button.onTap || noop)(event);
            event = event.originalEvent || event;

            if(!event.defaultPrevented) {
                self.responseDeferred.resolve(result);
            }
        }
    });

    $q.when(
        options.templateUrl ?
        $ionicTemplateLoader.load(options.templateUrl) :
        (options.template || options.contents || '')
    ).then(function(template) {
        var popupBody = jqLite(self.element[0].querySelector('.popup-body'));
        if(template) {
            popupBody.html(template);
            $compile(popupBody.contents())(self.scope);
        } else {
            popupBody.remove();
        }
    });

    self.show = function() {
        if(self.isShown || self.removed) return;
        self.isShown = true;
        ionic.requestAnimationFrame(function() {
            if(!self.isShown) return;

            self.element.removeClass('popup-hidden');
            self.element.addClass('popup-showing active');
            focusInput(self.element);
        });
    };

    // hide, remove

    return self;
}

function showPopup(opts) {
    var popup = $ionicPopup._createPopup(options);
    var showDelay = 0;

    if(popupStack.length > 0) {
        popupStack[popupStack.length - 1].hide();
        showDelay = config.stackPushDelay;
    } else {
        $ionicBody.addClass('popup-open');
        $ionicBackdrop.retain();

        // _backButtonActionDone = $ionicPlatform.registerBackButtonAction(onHardwareBackButton, IONIC_BACK_PRIORITY.popup);
    }

    // add close method for promise
    popup.responseDeferred.promise.close = function popupClose(result) {
        // 触发 remove 逻辑（define doShow fn
        if(!popup.removed) popup.responseDeferred.resolve(result);
    }

    doShow();
    return popup.responseDeferred.promise;

    function doShow() {
        popupStack.push(popup);
        $timeout(popup.show, showDelay, false);

        popup.responseDeferred.promise.then(function(result) {
            // splice index, 1 for popupStack

            // stack has, show it
            if(popupStack.length > 0) {
                popupStack[popupStack.length -1].show();
            } else {
                $ionicBackdrop.release();
                // popup-open class removed from body

                ($ionicPopup._backButtonActionDone||noop)();
            }

            popup.remove();
        });
    }
}

function showAlert(opts) {
  return showPopup(extend({
    buttons: [{
      text: opts.okText || 'OK',
      type: opts.okType || 'button-positive',
      onTap: function() {
        return true;
      }
    }]
  }, opts||{}));
}

function showPrompt(opts) {
    var scope = $rootScope.$new(true); // isolte scope
    scope.data = {};
    var text = '';
    if(opts.template && /<>/i.test(opts.template) === false) {
        text = '<span>'+opts.template + '</span>';
        delete opts.template;
    }
    return showPopup(extend({
        template: text + '<input ng-model="data.response" type="'+(opts.inputType||'text') + '" placeholder="'+(opts.inputPlaceholder||'')+'">',
        scope: scope,
        buttons: [{
            onTap: function() {
                return scope.data.response||'';
            }
        }]
    })); 
}


```

#### directive/content.js
delegate-handle, to identify this scrollview with $ioonicScrollDelegate
代码的复杂度还很高，涉及到 scrollController, scrollView/scrollViewNative 等

```js


```


### js/views/listView.js

```js
// define DragOp, ReorderDrag, SlideDrag prootype

ionic.views.ListView = ionic.views.View.inherit({
    initialize: function(opts) {},

    /**
     * if we scrlolled and have virtual model enabled, compute the window
     * of active elements in order to figure out the viewport to render
    */
    didScroll: function(e) {
        var self = this;
        if(self.isVirtual) {

            // get the firset and last elements in the list based on how many can fit

            // geth items we need to remove
            self._virtualItemsToRemove = Array.prototype.slice.call(self.listEl.children, 0, first);
            self.renderViewport && self.renderViewport(highWater, lowWater, first, last);
        }
    }
})
```

```js
ionic.views.View = function() {
    this.initialize.apply(this, arguments);
}
ionic.views.View.inherit = ionic.inherit;
ionic.extend(ionic.views.View.prototype, {
    initialize: function() {}
});
```

## utils

- activator
- delegateService
- dpm
- events
- gestures
- keyboard
- platform
- ploy
- tap
- utils
- viewport


### js/utils/delegateService.js

```js

```

### js/utils/poly.js

```js
// ionic css polyfills
ionic.CSS = {};
// transform css rule check, transition, transition-duration, transitionend
var i, keys = ['webkitTransition', 'mozTransition', 'msTransition', 'transition'];
for(i = 0; i < keys.length; i++) {
    if(document.documentElement.style[keys[i]] !== undefined) {
        ionic.CSS.TRANSITION = keys[i];
        break;
    }
}
if(! ('classsList' in document.documentElement) && Object.defineProperty && typeof HTMLElement !== 'undefined') {
    Object.defineProperty(HTMLElement.prototype, 'classList', {
        get: function() {
            var self = this;
            function update(fn) {

                return function() {
                    var x, classes = self.className.split(/\s+/);
                    for(x = 0; x < arguments.length; x++) {
                        fn(classes, classes.indexOf(arguments[x]), arguments[x]);
                    }

                    self.className = classes.join(' ');
                }
            }

            return {
                add: update(function(classes, index, value) {
                    ~index || classes.push(value);
                })
            }
        }
    })
}
```

### js/utils/tap.js

300ms delay(waits to see if double-tapping)
fastclick, ngTouch other solutions. some browser already remove the delay with certian setttings(css property: touch-events, meta tag viewport values)
Ionic' tap system as a way to normalize how clicks are handled
prevent ghostclicks
in some case, third-party libraries may also be wokring with touch events(data-tap-disabled='true')

both touch and mouse evnets are added to document.body on DOM ready.
if a touch event happens, it does not use mouse vent listener
on touchend, if the distance between start and end was small, trigger a click
isIonicTap property with event object
tapping inouts is disabled during scrolling

```js
/*
Todo: tapMouseDown, ionic.activator.start 等
*/

ionic.DomUtil.ready(function() {
    var ng = typeof angular !== 'undefined' ? angular : null;

    if(!ng || (ng && !ng.scenario)) {
        ionic.tap.register(document);
    }
})

function tapTouchEnd(e) {
    if(tapIgnoreEvent(e)) return;

    tapEnableTouchEvents();
    if(!tapHasPointerMoved(e)) {
        tapClick(e);
        if((/^(select|option)$/i).test(e.target.tagName)) {
            e.preventDefault();
        }
    }

    tapLastTouchTarget = e.target;
    tapTouchCancel();
}

function tapClick(e) {
    // simulate a normal click by running the element's click method then focus on it

    // get coordinates for both mouse click and touch depending on the given event
    var c = ionic.tap.pointerCoord(e);

    triggerMouseEvent('click', ele, c.x, c.y);
    tapHandleFocus(ele);
}

/* check whether small distance between two tap  */
function tapHasPointerMoved() {}
```

### js/utils/activator.js

```js

var queueElements = {}; // elements that should get an active state in XX milliseconds
var ACTIVATED_CLASS = 'activated';

ionic.activator = {
  start: function(e) {

    // when an element is touched/clicked, it climbs up a few
    // parent to see if it is an .item / .button element
    ionic.requestAnimationFrame(function() {
        // check scroll/isScrolling or requireNativeClick(e.target) return

        for(var x = 0; x<6;x++) {
            if(!ele || ele.nodeType !== 1) break;
            if (eleToActivate && ele.classList && ele.classList.contains('item')) {
                eleToActivate = ele;
                break;
            }
            if (ele.tagName == 'A' || ele.tagName == 'BUTTON' || ele.hasAttribute('ng-click')) {
              eleToActivate = ele;
              break;
            }
            // button
            // no sense to climb ion-content/panel
            if(ele.tagName == 'ION-CONTENT' || (ele.classList && ele.classList.cotnains('pane')) || ele.tagName == 'BODY') {
                break;
            }
            ele = ele.parentElement;
        }

        if(eleToActivate) {
            queueElements[keyId] = eleToActivate;
            ionic.requestAnimationFrame(activateElements);

            keyId = (keyId > 29 ? 0 : keyId+1);
        }
    });
  },
  end: function() {
    setTimeout(clear, 200);
  }
}

function clear() {
  queueElements = {}
  ionic.requestAnimationFrame(deactivateElements);
}

// activateElements| deactivateElements to add/remove activated class to queueElements
```

