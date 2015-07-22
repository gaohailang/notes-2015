
class UserService {
    constructor($http) {
        this.$http = $http;
    }
    getFullName() {
        return this.$http.get('api/user/details');
    }
}

class MyController {
    constructor(userService) {
        userService.getFullName()
            .then(result => this.userName = result.fullName);
    }
}

angular.module('app')
    .service('userService', UserService)
    .controller('MyController', MyController);

class ThingServiceProvider {
    constructor() {
        this.apiPath = 'default/api';
    }
    setApiPath(value) {
        this.apiPath = value;
    }
    $get($http) {
        return {
            getThings: () => $http.get(this.apiPath);
        }
    }
}

module.factory() method is specifically for when you are not using classes. the module.service() method was specifically designed for when you want to define your service as classes(or instantiable types).



/*
Writing AngularJS Apps Using ES6
http://www.sitepoint.com/writing-angularjs-apps-using-es6/
*/

import {default as bookShelfModule} from './ES6/bookShelf.main';
angular.bootstrap(document, [bookShelfModule]);

/*
Using controller as syntax
the properties associated with an instance of the clas would be visible through alias of the controller
$scope would be removed from the framework in Angular 2.0
classes in ES6 keep us away from difficulty of dealing with prototypes

the entires of WeakMap that have objects as keys are removed once the object is garbage collected

Providers and Services are created as instances of types, so we can create classes for them. Factories are functions that return objects.
*/
const INIT = new WeakMap();
const SERVICE = new WeakMap();
const TIMEOUT = new WeakMap();

class HomeController{
    constructor($timeout, bookShelfSvc) {
        SERVICE.set(this, bookShelfSvc);
        TIMEOUT.set(this, $timeout);
        INIT.set(this, () => {
            SERVICE.get(this).getActiveBooks().then(books=>{
                this.books = books;
            });
        });

        INIT.get(this)();
    }

    markBookAsRead(bookId, isBookRead) {
        return SERVICE.get(this).markBookAsRead(bookId, isBookRead).then(() => {
            INIT.get(this)();
            this.readSuccess = true;
            this.readSuccessMessage = isBookRead ? 'Book marked as read.' : 'Book marked as unread';
            TIMEOUT.get(this)(()=>{
                this.readSuccess = false;
            }, 2500);
        });
    }
}

HomeController.$inject = ['$timeout', 'bookShelfSvc'];

export default HomeController;


var moduleName='bookShelf.directives';

const Q = new WeakMap();
const SERVICE = new WeakMap();

class UniqueBookTitle
{
  constructor($q, bookShelfSvc){
    this.require='ngModel';  //Properties of DDO have to be attached to the instance through this reference
    this.restrict='A';

    Q.set(this, $q);
    SERVICE.set(this, bookShelfSvc);
  }

  link(scope, elem, attrs, ngModelController){
    ngModelController.$asyncValidators.uniqueBookTitle = function(value){

      return Q.get(UniqueBookTitle.instance)((resolve, reject) => {
        SERVICE.get(UniqueBookTitle.instance).checkIfBookExists(value).then( result => {
          if(result){
            reject();
          }
          else{
            resolve();
          }
        });
      });
    };
  }

  static directiveFactory($q, bookShelfSvc){
    UniqueBookTitle.instance =new UniqueBookTitle($q, bookShelfSvc);
    return UniqueBookTitle.instance;
  }
}

UniqueBookTitle.directiveFactory.$inject = ['$q', 'bookShelfSvc'];

angular.module(moduleName, [])
  .directive('uniqueBookTitle', UniqueBookTitle.directiveFactory);

export default moduleName;


var moduleName='bookShelf.services';

const HTTP = new WeakMap();

class BookShelfService{
  constructor($http){
    HTTP.set(this, $http);
  }

  getActiveBooks(){
    return HTTP.get(this).get('/api/activeBooks').then(result => result.data );
  }

  static bookShelfFactory($http){
    return new BookShelfService($http);
  }
}

BookShelfService.bookShelfFactory.$inject = ['$http'];

angular.module(moduleName, [])
  .factory('bookShelfSvc', BookShelfService.bookShelfFactory);

export default moduleName;