
function VideoCtrl($scope, appService, $ionicLoading, $cordovaFileTransfer, serverConfig, commonUtils, postService) {

    var session = appService.getSession()

    // Todo: 需要一个好用的字符串格式工具，变量内插
    var words = '我是'+session.apply.idcard.front.name + '. 随机编号是'+commonUtils.getRandomNumber(4)+'，我愿意开户';

    $scope.takeMovie = function() {
        cordova.exec(function(fileUrlObj) {
            if(ionic.Platform.isAndroid) {
                $scope.src = fileUrlObj.message;
                commonUtils.alert('文件准备上传Android模式， 文件本地路径是：'+$scope.src);
            }
            // isIOS

            $scope.values.retake = true;

            commonUtils.reloadCurrentPageWithoutAsk();
            return;
        }, function(err) {

        }, 'RecordPlugin', 'Record', [{
            Tips: words,
            fileName: videoFileName
        }]);
    };

    $scope.upload = function() {
        if(!$scope.src) {
            // 请先录制视频
        }
        $ionicLoading.show({template: '上传中....'});
        $cordovaFileTransfer.upload(serverConfig.applyInfo.videoUploadURL, $scope.src, {

        }).then(function(result) {
            // hide loading
            uploadSuccess(result);
        }, function(err) {

        }, function(progress) {

        })
    }
}



utils/commonUtils.js
// 单例 service
module('utils', [])
.service('commonUtils', function() {

    this.reloadCurrentPageWithoutAsk = function() {
        this._clearCacheAndHistory(); // $ionicHistory.clearCache, clearHistory
        $state.reload();
    };

    this.reloadCurrentPage = function(title) {
        var self = this;
        $ionicPopup.alert({

        }).then(function() {
            self._clearCacheAndHistory();
            $state.reload();
        })
    };

    this.getLocation = function() {
        比较奇葩，是设置 serverConfig.latitude/longitude
    };


    this.backToLogin = function(session) {
        session.setStep('login');
        $state.go(session.getStep());
    }
})
.factory('appService', function($http, $q, serverConfig, commonUtils) {
    var app = 'gfopen';
    var timeout = 15000;
    var steps = [];
    // 全局状态
    var session = {
        apply: {// 申请记录
            // 记录各个步骤的状态
        },
        setStep: function(step) {
            this.apply.step = !!~steps.indexOf(step)?step: 'home';
        }
    };

    return {
        getSession: function() {
            return session;
        },
        setToken: function(mobile, token) {
            session.apply.mobile = mobile;
            session.token = token;
            session.tokenTime = new Date();
        },
        mockSecInfoGetOrPost: function(data) {
            return $q(function(resolver) {
                resolver(data);
            });
        },
        getHttpCfg: function() {
            return {
                timeout: 15000,
                headers: {
                    token: session.token
                }
            };
        },
        getPostCodeCfg: function() {
            var transFn = function(data){
                return $.param(data);
            };
            return {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                transformRequest: transFn
            };
        },
        getAllContractInfo: function() {
            // 这一个也很意思，这块应该放在connect 中间件中吧
            if(serverConfig.mode) {

            } else {
                return this.mockSecInfoGetOrPost(serverConfig.mock.allContrackInfo);
            }
        },
        postVideo: function(params) {
            var url = serverConfig.applyInfo.videoApplyURL;
            var postData = params;
            var cfg = this.getHttpCfg();
            return this.applyCommonPost(url, cfg, postData);
        }
    }
})
.service('serverConfig', function() {
    //http://10.2.122.159:8088
    var secinfoIpAndPort = 'http://zzkh.gf.com.cn';
    var applyIPAndPort = 'http://10.2.122.159:8088';

    return {
        applyInfo: {
            applyURl: applyIPAndPort + '/apply',
            sendSmsCodeURL: applyIPAndPort + '/token/mobile/sendSmsCode',
            idCardURL: applyIPAndPort + '/apply/idCard'
        },
        mode: true, // （配置数据，申请数据全部真实，不会alert）
        tipsTimeout: 3000,
        idCardErrorMessage: 'blahblah',

        mock: {
            // location, provinces, cities, branches, banks, educatio, risks, backAgreement
        }
    }
});





IonicModule.directive('ionInfiniteScroll', function($timeout) {
    return {
        require: ['?^$ionicScroll', 'ionInfiniteScroll'],
        template: function($element, $attrs) {
            if($attrs.icon) return '<i class="icon {{icon()}} icon-refreshing {{scrollingType}}"></i>';
            return '<ion-spinner icon="{{spinner()}}"></ion-spinner>'
        },
        scope: true,
        controller: '$ionInfiniteScroll',
        link: function($scope, $element, $attrs, ctrls) {
            var jsScrolling = infiniteScrollCtrl.jsScrolling = !scrollCtrl.isNative();

            if(jsScrolling) {
                infiniteScrollCtrl.scrollView = scrollCtrl.scrllView;
                $scope.scrollingType = 'js-scrolling';
                scrollCtrl.$element.on('scroll', infiniteScrollCtrl.checkBounds);
            } else {
                // native with overflow scroll
            }

            // immediateCheck
        }
    }
})

IonicModule.directive('ionRefresher', function() {
    return {
        replace: true,
        require: ['?^$ionicScroll', 'ionRefresher'],
        controller: '$ionRefresher',
        template: '',
        link: function($scope, $element, $attrs, ctrls) {
            var scrollCtrl = ctrls[0],
                refresherCtrl = ctrls[1];

            if(!scrollCtrl || scrollCtrl.isNative()) {
                refresherCtrl.init();
            } else {
                $element[0].classList.add('js-scrolling');
                scrollCtrl._setRefresher(
                    $scope,
                    $element[0],
                    refresherCtrl.getRefreshDomMethods()
                );

                $scope.$on('scroll.refreshComplete', function() {
                    $scope.$evalAsync(function() {
                        scrollCtrl.scrollView.finishPullToRefresh();
                    });
                })
            }
        }
    }
})