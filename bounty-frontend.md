学习优秀项目 - bounty-frontend

common/constants/personResolver.js
然后在定义router的时候，{
    templateUrl: '',
    controller: 'BountiesController',
    resolve: {person: personResolver},
    trackEvent: 'View My Bounties'
}

```js


function personResolver($q, $rootScope, $location, $api) {
    var deferred = $q.defer();

    var success = function() {
        deferred.reslove();
    }

    var failure = function() {
        deferred.reject();
        $api.set_post_auth_url($location.url());
        $location.url('/signin').replace();
    };

    if($rootScope.current_person) {
        $rootScope.$evalAsync(success);
    } else if ($rootScope.current_person === false) {
        // failure
    } else {
        $rootScope.$watch('current_person', function() {
            if($rootScope.current_person) { 
                success();
            } else if ($rootScope.current_person === false) {
                failure();
            }
        });
    }

    return deferred.promise();
}


// services/api.js
function ($http, $q, $cookieStore, $rootScope, $location) {
    var $api = this;
    this.access_token_cookie_name = 'v2_access_token';

    if($window.BS_CONFIG.environment === 'development') {
        // set $rootScope.api_endpoint = cookieStore.get('api_environment')||'staging';
    }

    this.$$maxPerpage = 250;
    this.$$perPage = undefined;
    // this.perPage, this.page setter

    this.v2 = {
        call: function(options) {
            options = options || {};
            options.verbose = false;

            // headers, default headers.Accept = 'application/vnd.bountysource+json; version=2', method

            var path = (options.url || '').replace(/^\/+/, '');
            options.url = api_host + path;

            if ($rootScope.current_person != false) {
                options.params.access_token = options.params.access_token || $api.get_access_token();
            }

            if(options.verbose) {
                // log.info - API Request, Path, Headers, Params
                $log.info('--------------');
            }

            var callback = function(response) {
                response.success = (response.status >= 200 && response.status < 400);
                if(options.verbose) {
                    // $log.info dateTime, status, data, headers etc
                }
                return response;
            }
            return $http(options).then(callback, callback);
        },
        issue: function(params) {
            return this.call({
                url: '/issues',
                params: params||{}
            });
        },
        createAddress: function(params) {
          return this.call({
            url: '/addresses',
            method: 'POST',
            params: params || {}
          });
        },
        deleteAddress: function(id, params) {
          return this.call({
            url: '/addresses/'+id,
            method: 'DELETE',
            params: params || {}
          });
        }
    };

    this.issue_create = function(data, callback) {
      return this.call("/issues", "POST", data, callback);
    };

    this.signin_with_access_token = function(access_token) {
      return this.call("/user", { access_token: access_token }, function(response) {
        if (response.meta.status === 200) {
          response.data.access_token = access_token; // FIXME: why doesn't /user include an access token when it's you?
          $api.set_current_person(response.data);
          $api.goto_post_auth_url();
          return true;
        } else {
          return false;
        }
      });
    };
}

```