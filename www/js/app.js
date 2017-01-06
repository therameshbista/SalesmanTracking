var url = 'http://usmart.unified-it.com:8080/api/update-position';
var oms = angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'satellizer', 'ngCordova', 'angular-cache'])
        .run(function ($ionicPlatform,$localstorage,$auth,Internet,$http) {
            $ionicPlatform.ready(function () {
                if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                    cordova.plugins.Keyboard.disableScroll(true);
                }
                if (window.StatusBar) {
                    // org.apache.cordova.statusbar required
                    StatusBar.styleLightContent();
                }
                if (navigator && navigator.splashscreen) {
                    navigator.splashscreen.hide();
                }

                // Background mode activation:

                document.addEventListener('deviceready', function () {
                    // Android customization
                    cordova.plugins.backgroundMode.setDefaults({text: 'Running App on Background'});
                    // Enable background mode
                    cordova.plugins.backgroundMode.enable();

                    // Called when background mode has been activated
                    cordova.plugins.backgroundMode.onactivate = function () {
                        setTimeout(function () {
                            backgroundGeolocation = window.backgroundGeolocation || window.backgroundGeoLocation || window.universalGeolocation;
                            /**
                             * This callback will be executed every time a geolocation is recorded in the background.
                             */
                            var callbackFn = function (location) {
                                var latlng = {
                                    "lat": location.latitude,
                                    "lng": location.longitude,
                                    "date": Date()
                                }



                            if (Internet.isConnected() != true) {
                                var dataforinsert = [];
                                dataforinsert.push(latlng);
                                $localstorage.setObject("updatedpositions", dataforinsert);
                                }else{
                                var latlngData = [];
                                latlngData.push(latlng);
                                var configs = {};
                                configs.headers = {};
                                configs.headers.Authorization = 'Bearer ' + $auth.getToken();
                                $http.post(url , latlngData)
                                  .success(function (data, status, headers, config) {
                                    console.log('succcess');
                                  })
                                  .error(function (data, status, headers, config) {
                                   console.log('failed');
                                  });
                              }
                                // Do your HTTP request here to POST location to your server.
                                // jQuery.post(url, JSON.stringify(location));

                                /*
                                 IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
                                 and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
                                 IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
                                 */
                                backgroundGeolocation.finish();
                            };

                            var failureFn = function (error) {
                                console.log('BackgroundGeolocation error');
                            };

                            // BackgroundGeolocation is highly configurable. See platform specific configuration options
                            backgroundGeolocation.configure(callbackFn, failureFn, {
                                desiredAccuracy: 10,
                                stationaryRadius: 0,
                                distanceFilter: 0,
                                notificationTitle:'App Running On Background',
                                notificationText:'GPS Position is recording',
                                startForeground: false,
                                interval:15000,
                                debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
                                stopOnTerminate: true, // <-- enable this to clear background location settings when the app terminates
                            });

                            // Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app.
                            backgroundGeolocation.start();
                            // Modify the currently displayed notification
                            cordova.plugins.backgroundMode.configure({
                                text: 'USmartSalesman is running on background'
                            });
                        }, 500);

                    }
                }, false);




                // If you wish to turn OFF background-tracking, call the #stop method.
                // backgroundGeolocation.stop();

                /*	if (window.cordova) {
                 db = $cordovaSQLite.openDB({ name: "my.db" }); //device
                 }else{
                 db = window.openDatabase("my.db", '1', 'my', 1024 * 1024 * 100); // browser
                 }
                 */

                // to check whether connection is avaialable or not
                /*		if(window.Connection) {
                 if(navigator.connection.type == Connection.NONE) {
                 $ionicPopup.confirm({
                 title: "Internet Disconnected",
                 content: "The internet is disconnected on your device."
                 })
                 .then(function(result) {
                 if(!result) {
                 ionic.Platform.exitApp();
                 }
                 });
                 }
                 }
                 */

                //  $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS people (id integer primary key, firstname text, lastname text)");
                //    $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS route_records (id integer primary key, salesman_id integer,route_id integer,day integer,route_name text,store_name text,store_type text, store_id integer)");

            }).then(function () {
                // return db;
            });
        })
        .filter('unique', function () {
            return function (collection, keyname) {
                var output = [],
                        keys = [];
                angular.forEach(collection, function (item) {
                    var key = item[keyname];
                    if (keys.indexOf(key) === -1) {
                        keys.push(key);
                        output.push(item);
                    }
                });
                return output;
            };
        })
        .config(function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                    .state('login', {
                        url: '/login',
                        templateUrl: 'templates/login.html',
                        controller: 'LoginCtrl as login'
                    })
                    // setup an abstract state for the tabs directive
                    .state('tab', {
                        url: '/tab',
                        abstract: true,
                        templateUrl: 'templates/tabs.html'
                    })
                    .state('tab.days', {
                        url: '/days',
                        views: {
                            'tab-routes': {
                                templateUrl: 'templates/tab-routes.html',
                                controller: 'RoutesCtrl'
                            }
                        }
                    })
                    // Each tab has its own nav history stack:

                    .state('tab.dash', {
                        url: '/dash',
                        views: {
                            'tab-dash': {
                                templateUrl: 'templates/tab-dash.html',
                                controller: 'DashCtrl'
                            }
                        }
                    })
                    .state('tab.routes', {
                        url: '/routes/:day',
                        views: {
                            'tab-routes': {
                                templateUrl: 'templates/tab-routes.html',
                                controller: 'RoutesCtrl'
                            }
                        }
                    })
                    .state('tab.stores', {
                        url: '/stores/:routeId/:routeName',
                        views: {
                            'tab-routes': {
                                templateUrl: 'templates/stores.html',
                                controller: 'StoresCtrl'
                            }
                        }
                    })
                    .state('tab.pg', {
                        url: '/pg/:storeId/:storeName/:storeType',
                        views: {
                            'tab-routes': {
                                templateUrl: 'templates/product-groups.html',
                                controller: 'ProductGroupCtrl'
                            }
                        }
                    })
                    .state('tab.subpg', {
                        url: '/subpg/:productGroupId/:productGroupName',
                        views: {
                            'tab-routes': {
                                templateUrl: 'templates/product-subgroups.html',
                                controller: 'ProductSubGroupCtrl'
                            }
                        }
                    })
                    .state('tab.product', {
                        url: '/product/:productGroupId/:productGroupName',
                        views: {
                            'tab-routes': {
                                templateUrl: 'templates/products.html',
                                controller: 'ProductCtrl as pc'
                            }
                        }
                    })
                    .state('tab.add-new-store', {
                        cache: false,
                        url: '/add-new-store?:fromStores?:routeId?:fabbutton',
                        views: {
                            'tab-add-new-store': {
                                templateUrl: 'templates/add-new-store.html',
                                controller: 'StoresCtrl'
                            }
                        }
                    })
                    .state('tab.target', {
                        cache: false,
                        url: '/target',
                        views: {
                            'tab-target': {
                                templateUrl: 'templates/target.html',
                                controller: 'TargetCtrl'
                            }
                        }
                    })
                    .state('tab.target-history', {
                        cache: false,
                        url: '/target-history',
                        views: {
                            'tab-target-history': {
                                templateUrl: 'templates/target-history.html',
                                controller: 'TargetHistoryCtrl'
                            }
                        }
                    })
                    .state('tab.orderverifiednonverified', {
                        cache: false,
                        url: '/orderverifiednonverified',
                        views: {
                            'tab-orderverifiednonverified': {
                                templateUrl: 'templates/order-verified-not-verified.html',
                                controller: 'OrderVerifiedNotVerifiedCtrl'
                            }
                        }
                    })
                    .state('tab.profilechange', {
                        cache: false,
                        url: '/profilechange',
                        views: {
                            'tab-profilechange': {
                                templateUrl: 'templates/edit-password.html',
                                controller: 'ProfileCtrl'
                            }
                        }
                    })
                    .state('tab.orders', {
                        cache: false,
                        url: '/orders',
                        views: {
                            'tab-orders': {
                                templateUrl: 'templates/tab-orders.html',
                                controller: 'OrdersCtrl'
                            }
                        }
                    });

            // if none of the above states are matched, use this as the fallback
            // $urlRouterProvider.otherwise('/tab/dash');
            $urlRouterProvider.otherwise('/login');

        });

oms.
        directive('onValidSubmit', ['$parse', '$timeout', function ($parse, $timeout) {
                return {
                    require: '^form',
                    restrict: 'A',
                    link: function (scope, element, attrs, form) {
                        form.$submitted = false;
                        var fn = $parse(attrs.onValidSubmit);
                        element.on('submit', function (event) {
                            scope.$apply(function () {
                                element.addClass('ng-submitted');
                                form.$submitted = true;
                                if (form.$valid) {
                                    if (typeof fn === 'function') {
                                        fn(scope, {$event: event});
                                    }
                                }
                            });
                        });
                    }
                }

            }])
        .directive('fabButton', function fabButtonDirective() {
            return {
                restrict: 'E',
                replace: true,
                transclude: true,
                template: template,
                link: link
            };
            //isAnchor
            function isAnchor(attr) {
                return angular.isDefined(attr.href) || angular.isDefined(attr.ngHref);
            }

            //template
            function template(element, attr) {
                return isAnchor(attr) ?
                        '<a class="fab-button" ng-transclude></a>' :
                        '<button class="fab-button" ng-transclude></button>';
            }

            //link
            function link(scope, element, attr) {
                var target = '#' + attr['targetId'];
                //var bgColor = attr['bg-color'];
                //element.style=bgColor;
                var targetEl = angular.element(document.querySelector(target));
                var savePos = 0;
                targetEl.bind('scroll', function (e) {
                    if (savePos < e.detail.scrollTop) {
                        savePos = e.detail.scrollTop;
                        element.removeClass('fadeInUp animated');
                        element.addClass('fadeOutDown animated');
                    }
                    if (savePos > e.detail.scrollTop) {
                        savePos = e.detail.scrollTop;
                        element.removeClass('fadeOutDown animated');
                        element.addClass('fadeInUp animated');
                    }
                });
            }
        })
        .directive('validated', ['$parse', function ($parse) {
                return {
                    restrict: 'AEC',
                    require: '^form',
                    link: function (scope, element, attrs, form) {
                        var inputs = element.find("*");
                        for (var i = 0; i < inputs.length; i++) {
                            (function (input) {
                                var attributes = input.attributes;
                                if (attributes.getNamedItem('ng-model') != void 0 && attributes.getNamedItem('name') != void 0) {
                                    var field = form[attributes.name.value];
                                    if (field != void 0) {
                                        scope.$watch(function () {
                                            return form.$submitted + "_" + field.$valid;
                                        }, function () {
                                            if (form.$submitted != true)
                                                return;
                                            var inp = angular.element(input);
                                            if (inp.hasClass('ng-invalid')) {
                                                element.removeClass('has-success');
                                                element.addClass('has-error');
                                            } else {
                                                element.removeClass('has-error').addClass('has-success');
                                            }
                                        });
                                    }
                                }
                            })(inputs[i]);
                        }
                    }
                }
            }])
        .directive('textarea', function () {
            return {
                restrict: 'E',
                link: function (scope, element, attr) {
                    var update = function () {
                        element.css("height", "auto");
                        var height = element[0].scrollHeight;
                        element.css("height", element[0].scrollHeight + "px");
                    };
                    scope.$watch(attr.ngModel, function () {
                        update();
                    });
                }
            };
        })
        .filter('getSKUcounts', function () {
            return function (orders) {
                if (typeof orders === 'undefined') {
                    return;
                }
                var products = [];
                for (var i = 0; i < orders.length; i++) {
                    products.push(orders[i].product_name);
                }
                var count = products.filter(function (item, pos) {
                    return products.indexOf(item) == pos;
                });
                return (count == null || count == 'undefined') ? 0 : count.length;
            }

        })
        .filter('getBrandcounts', function () {
            return function (orders) {
                if (typeof orders === 'undefined') {
                    return;
                }
                var productGroups = [];
                for (var i = 0; i < orders.length; i++) {
                    if (orders[i].product_group_name == 'undefined' || orders[i].product_group_name == null) {
                        continue;
                    }
                    productGroups.push(orders[i].product_group_name);
                }
                var count = productGroups.filter(function (item, pos) {
                    return productGroups.indexOf(item) == pos;
                });
                return (count == null || count == 'undefined') ? 0 : count.length;
            }
        })
        .filter('removeSlash', [function () {
                return function (url)
                {
                    var newurl = url.replace("/", "-");
                    return newurl;
                };
            }])
        .filter('getTotalAmount', function () {
            return function (orders) {
                if (typeof orders === 'undefined') {
                    return;
                }
                var amount = 0;
                for (var i = 0; i < orders.length; i++) {
                    if (typeof orders[i].amount == 'undefined' && typeof orders[i].sold_qty != 'undefined') {
                        amount += parseFloat(orders[i].amount);
                    } else if (typeof orders[i].amount != 'undefined' && typeof orders[i].quantity != 'undefined') {
                        amount += parseFloat(orders[i].amount);
                    } else {
                        amount += parseFloat(orders[i].amount);
                    }
                }
                return amount;
            }
        });
        
        
oms.config(function($ionicConfigProvider) {
  $ionicConfigProvider.views.maxCache(0);
});
