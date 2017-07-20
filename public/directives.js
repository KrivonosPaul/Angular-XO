(function(){
    var app=angular.module('directs',[]);
    app.directive('infoBlock', function(){
        return{
            restrict:'A',
            templateUrl:'infoblock.html',
            controller:'gameController'
        };
    });
    app.directive('cells',function(){
        return {
            restrict:'E',
            templateUrl:'cells.html',
            controller:'gameController'
        }
    });
    app.directive('scores',function(){
        return {
            restrict:'A',
            templateUrl:'scores.html',
            controller:'gameController'
        }
    });
})();