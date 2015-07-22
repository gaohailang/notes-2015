describe('Calc Controller', function () {
  var scope, httpBackend, timeout;

  beforeEach(module('app'));

  beforeEach(inject(function ($rootScope, $controller, $httpBackend, $timeout) {
    timeout = $timeout;
    scope = $rootScope.$new();
    httpBackend = $httpBackend;
    httpBackend.when('GET', 'http://maps.googleapis.com/maps/api/geocode/json?address=london').respond({results: [{}, {}, {}]});
    $controller('CalcCtrl', {
      $scope: scope
    });
  }));

  it('should add correctly', function (done) {
    scope.first = '1';
    scope.second = '3';
    scope.operator = '+';
    scope.doAddition();
    expect(3).toEqual(4);

    setTimeout(function() {
      console.log('wtf');
      expect(scope.latest).toEqual('1');
      done();
    }, 5000);
  });

  /*it('should be able to search for locations', function () {
    scope.model.term = 'london';
    scope.search();
    httpBackend.flush();
    expect(scope.results.length).toEqual(3);
  });*/
})