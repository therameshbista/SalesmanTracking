angular.module('starter.services', [])
        .factory('Routes', ['$http', '$localstorage', 'Internet', '$q', 'config', function ($http, $localstorage, Internet, $q, config) {
                return {
                    all: function ($token) {

                        var deferred = $q.defer();
                        config.get().then(function (result) {
                            if (Internet.isConnected() == true)
                            {


                                console.log("from live");

                                $http.get(result.baseUrl + "/get-targets?token=" + $token)
                                        .success(function (data, status, headers, config) {
                                            deferred.resolve(data);
                                            var date = new Date();

                                            $localstorage.setObject('allroutes', data);
                                        })
                                        .error(function (data, status, headers, config) {
                                            $localstorage.getObject('allroutes').lastupdate = $localstorage.get("lastupdatestores");
                                            deferred.resolve($localstorage.getObject('allroutes'));

                                        });
                            } else {
                                $localstorage.getObject('allroutes')
                                console.log("from sqllite");
                                deferred.resolve($localstorage.getObject('allroutes'));

                            }
                        });



                        return deferred.promise;

                    },
                    groupByDay: function (data) {
                        var groups = [];
                        if (typeof data == 'undefined' || typeof data == null || typeof data == '') {
                            return groups;
                        }

                        for (var i = 0; i < data.length; i++) {
                            var item = data[i];
                            //noinspection JSUnresolvedVariable
                            if (!groups[item.day]) {
                                //noinspection JSUnresolvedVariable
                                groups[item.day] = [];
                            }
                            //noinspection JSUnresolvedVariable
                            groups[item.day].push(
                                    item
                                    );
                        }


                        return groups;
                    },
                    groupByStore: function (data) {
                        var groups = [];
                        if (typeof data == 'undefined' || typeof data == null || typeof data == '') {
                            return groups;
                        }
                        for (var i = 0; i < data.length; i++) {
                            var item = data[i];
                            //noinspection JSUnresolvedVariable
                            if (!groups[item.store_id]) {
                                //noinspection JSUnresolvedVariable
                                groups[item.store_id] = [];
                            }
                            //noinspection JSUnresolvedVariable
                            groups[item.store_id].push(
                                    item
                                    );
                        }
                        return groups;
                    },
                    getStoresFromRouteId: function (source, routeId) {
                        var groups = {};
                        console.log(source);
                        var data = source[routeId]
                        //   console.log(data);
                        if (typeof data == 'undefined' || typeof data == null || typeof data == '') {
                            return groups;
                        }
                        for (var i = 0; i < data.length; i++) {
                            var item = data[i];
                            //noinspection JSUnresolvedVariable
                            if (!groups[item.store_id]) {
                                //noinspection JSUnresolvedVariable
                                groups[item.store_id] = [];
                            }
                            //noinspection JSUnresolvedVariable
                            groups[item.store_id].push(
                                    item
                                    );
                        }
                        return groups;
                    },
                    getRoutesOfADay: function (source, day) {
                        //debugger;
                        var groups = {};
                        var data = source[day]
                        if (typeof data == 'undefined' || typeof data == null || typeof data == '') {
                            return groups;
                        }
                        for (var i = 0; i < data.length; i++) {
                            var item = data[i];
                            //noinspection JSUnresolvedVariable
                            //   if (!groups[item.route_id]) {
                            //noinspection JSUnresolvedVariable
                            groups[item.route_id] = [];
                            //    }
                            //noinspection JSUnresolvedVariable
                            groups[item.route_id].push(
                                    item
                                    );
                        }
                        return groups;
                    },
                    getProductGroupsForStore: function (source, storeId, day) {
                        return source.filter(function (value) {
                            return (value.day == day && value.store == storeId)
                        })
                    },
                    getProductsForStore: function (source, storeId, productGroupId, day) {
                        return source.filter(function (value) {
                            return (value.day == day && value.store == storeId && value.product_group_id == productGroupId)
                        })
                    }

                };
            }])
        .factory('LoaderService', function ($rootScope, $ionicLoading) {
            return {
                show: function () {
                    $rootScope.loading = $ionicLoading.show({
                        content: '<ion-spinner class="spiral-energized"></ion-spinner> Loading...',
                        animation: 'fade-in',
                        showBackdrop: true,
                        maxWidth: 200,
                        showDelay: 10
                    });
                },
                hide: function () {
                    $ionicLoading.hide();
                }
            }
        })
        .factory('RoutesRegistry', function ($rootScope) {
            var routes = {
                'filtered': {},
                'unfiltered': {},
                'latLng': {},
                'positionChanged': false
            };
            this.setFiltered = function (data) {
                routes.filtered = data;
            };
            this.getFiltered = function () {
                return routes.filtered;
            };
            this.setUnfiltered = function (data) {
                routes.unfiltered = data;
            };
            this.getUnfiltered = function () {
                return routes.unfiltered;
            };
            this.setLatLng = function (data) {
                routes.latLng = data;
            };
            this.getLatLng = function () {
                return routes.latLng;
            };
            this.setPositionChanged = function (data) {
                $rootScope.$broadcast("positionChanged");
            };

            return this;
        })
        .service('config', function ($http, $q) {
            this.get = function () {
                var deferred = $q.defer();
                $http.get('js/config.json', {
                    cache: true
                })
                        .success(function (data, status, headers, config) {
                            deferred.resolve(data);
                        })
                        .error(function (data, status, headers, config) {
                            deferred.reject(data);
                        });
                return deferred.promise;
            }
        })
        .service("punch", function ($http, $rootScope, $auth, $localstorage, Internet, config) {
            return {
                order: function (action) {

                    navigator.geolocation.getCurrentPosition(function (position) {
                        var configs = {};
                        configs.headers = {};
                        configs.headers.Authorization = 'Bearer ' + $auth.getToken();
                        var storeid = $rootScope.storeId;
                        if (storeid == undefined)
                        {
                            storeid = "";
                        }
                        var routeid = $rootScope.routeId;
                        if (routeid == undefined)
                        {
                            routeid = "";
                        }
                        var latlng = {
                            "lat": position.coords.latitude,
                            "lng": position.coords.longitude,
                            "date": Date(),
                            "route_id": routeid,
                            "store_id": storeid,
                            "action": action
                        }
                        config.get().then(function (result) {
                            if (Internet.isConnected() == true)
                            {
                                console.log("Punch in Internet");
                                var latlangdata = $localstorage.getObject("updatedpunchs");
                                if (latlangdata.length > 0)
                                {
                                    latlangdata.push(latlng);
                                } else {
                                    latlangdata = [];
                                    latlangdata.push(latlng);
                                    latlangdata = latlangdata;
                                }
                                $http.post(result.baseUrl + "/add-new-order-punch", latlangdata, configs)
                                        .success(function (data, status, headers, config) {
                                            $localstorage.setObject("updatedpunchs", []);

                                        })
                                        .error(function (data, status, headers, config) {
                                            console.log("Punch failuer Internet");
                                            var latlangdata = $localstorage.getObject("updatedpunchs");
                                            if (latlangdata.length > 0)
                                            {
                                                var dataforinsert = latlangdata;
                                            } else {
                                                var dataforinsert = [];
                                            }
                                            dataforinsert.push(latlng);
                                            $localstorage.setObject("updatedpunchs", dataforinsert);
                                        });
                            } else {
                                console.log("Punch without Internet");
                                var latlangdata = $localstorage.getObject("updatedpunchs");
                                if (latlangdata.length > 0)
                                {
                                    var dataforinsert = latlangdata;
                                } else {
                                    var dataforinsert = [];
                                }
                                dataforinsert.push(latlng);
                                $localstorage.setObject("updatedpunchs", dataforinsert);

                            }
                        });
                    }, function (err) {
                        console.log(err);
                    });


                }
            };
        })
        .service('checkimei', ['$window', '$q', function ($window, $q) {
                return{
                    check: function (imeiarray) {
                        var deferred = $q.defer();
                        console.log("Inside checkimei function");
                        var deviceID = $window.device.uuid;
                        console.log(imeiarray);
                        var same = false;
                        angular.forEach(imeiarray, function (imei) {
                            console.log("inside foreach loop");
                            console.log(imei + ' = ' + deviceID);
                            if (imei == deviceID)
                            {
                                same = true;
                                console.log("Same man");

                            }
                        });


                        if (same === true)
                        {
                            console.log("same");
                            deferred.resolve(123);
                        } else {
                            console.log(":( not same");
                            deferred.resolve('notsame');
                        }
                        return deferred.promise;

                    }
                }

        }])
        .service('customService', ['$window', '$q', function ($window, $q){
            return{
                check: function (param) {
                   alert(param);

                }
            }

        }])
        .factory('$localstorage', ['$window', function ($window) {
                return {
                    set: function (key, value) {
                        $window.localStorage[key] = value;
                    },
                    get: function (key, defaultValue) {
                        return $window.localStorage[key] || defaultValue;
                    },
                    setObject: function (key, value) {
                        $window.localStorage[key] = JSON.stringify(value);
                    },
                    getObject: function (key) {
                        if ($window.localStorage[key] != undefined)
                        {
                            return JSON.parse($window.localStorage[key] || '[]');
                        } else {
                            return [];
                        }

                    }
                }
            }])
        .factory('getMap', ['$http', '$localstorage', 'Internet', '$q', '$auth', 'config', '$cordovaGeolocation', '$compile', 'RoutesRegistry', '$rootScope', '$cordovaToast', '$interval', function ($http, $localstorage, Internet, $q, $auth, config, $cordovaGeolocation, $compile, RoutesRegistry, $rootScope, $cordovaToast, $interval) {
                return {
                    get: function (data, title, mapId) {
                        var options = {timeout: 10000, enableHighAccuracy: true};
                        $cordovaGeolocation.getCurrentPosition(options).then(
                                function (position) {
                                    var id = (typeof mapId == 'undefined' ? 'map' : mapId);
                                    var content = (typeof title == 'undefined' || typeof title == '') ? 'Outlet Location' : title;
                                    if (typeof data == 'undefined' || !data) {
                                        var latitude = position.coords.latitude;
                                        var longitude = position.coords.longitude;
                                    } else {
                                        var latitude = parseFloat(data[0].latitude);
                                        var longitude = parseFloat(data[0].longitude);
                                    }
                                    var latLng = new google.maps.LatLng(latitude, longitude);
                                    RoutesRegistry.setLatLng(latLng);
                                    var mapOptions = {
                                        streetViewControl: true,
                                        center: latLng,
                                        zoom: 18,
                                        mapTypeId: google.maps.MapTypeId.TERRAIN
                                    };
                                    var map = new google.maps.Map(document.getElementById(id),
                                            mapOptions);
                                    var infowindow = new google.maps.InfoWindow({
                                        content: content
                                    });
                                    var marker = new google.maps.Marker({
                                        position: latLng,
                                        map: map,
                                        title: content
                                    });
                                    infowindow.open(map, marker);
                                    google.maps.event.addListener(marker, 'click', function () {
                                        infowindow.open(map, marker);
                                    });
                                    google.maps.event.addListener(map, 'click', function (e) {
                                        createMarker(e.latLng, "Outlet locaion", id);
                                    });
                                    return map;
                                }, function (error) {
                            console.log(error)
                        })
                    },
                    trackGPS: function () {
                        if (!$rootScope.is_tracking) {
                            $rootScope.is_tracking = 1;
                            initiateGPSPositioning();
                            setInterval(function () {
                                initiateGPSPositioning();
                            }, 60000);
                        }

                    }
                }
                function createMarker(latLng, content, id) {
                    RoutesRegistry.setLatLng(latLng);
                    RoutesRegistry.setPositionChanged(true);
                    var mapOptions = {
                        streetViewControl: true,
                        center: latLng,
                        zoom: 18,
                        mapTypeId: google.maps.MapTypeId.TERRAIN
                    };
                    var map = new google.maps.Map(document.getElementById(id),
                            mapOptions);
                    var infowindow = new google.maps.InfoWindow({
                        content: content
                    });
                    var marker = new google.maps.Marker({
                        position: latLng,
                        map: map,
                        title: content
                    });
                    infowindow.open(map, marker);
                    google.maps.event.addListener(marker, 'click', function () {
                        infowindow.open(map, marker);
                    });
                    google.maps.event.addListener(map, 'click', function (e) {
                        createMarker(e.latLng, "Outlet locaion", id);
                    });
                    return latLng;
                }

                function inrange(min, number, max) {
                    if (!isNaN(number) && (number >= min) && (number <= max)) {
                        return true;
                    } else {
                        return false;
                    }
                    ;
                }

                function monitorGPSLocation(latlng) {
                    var deferred = $q.defer();
                    var configs = {};
                    configs.headers = {};
                    configs.headers.Authorization = 'Bearer ' + $auth.getToken();
                    config.get().then(function (result) {
                        if (Internet.isConnected() == true)
                        {
                            var latlangdata = $localstorage.getObject("updatedpositions");
                            console.log("From Monitor GPS");
                            console.log(latlangdata);
                            if (latlangdata.length > 0)
                            {
                                latlangdata.push(latlng);
                            } else {
                                latlangdata = [];
                                latlangdata.push(latlng);
                                latlangdata = latlangdata;
                            }
                            $http.post(result.baseUrl + "/update-position", latlangdata, configs)
                                    .success(function (data, status, headers, config) {
                                        $localstorage.setObject("updatedpositions", []);
                                        deferred.resolve(data);
                                    })
                                    .error(function (data, status, headers, config) {
                                        var latlangdata = $localstorage.getObject("updatedpositions");
                                        if (latlangdata.length > 0)
                                        {

                                            var dataforinsert = latlangdata;
                                        } else {
                                            var dataforinsert = [];
                                        }

                                        dataforinsert.push(latlng);
                                        $localstorage.setObject("updatedpositions", dataforinsert);
                                        deferred.resolve("success");
                                    });
                        } else {
                            var latlangdata = $localstorage.getObject("updatedpositions");
                            if (latlangdata.length > 0)
                            {
                                var dataforinsert = latlangdata;
                            } else {
                                var dataforinsert = [];
                            }

                            dataforinsert.push(latlng);
                            $localstorage.setObject("updatedpositions", dataforinsert);
                            deferred.resolve("success");
                        }

                    });
                    return deferred.promise;
                }

                function sendGPSLocation(position) {
                    var options = {timeout: 10000, enableHighAccuracy: true};
                    $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
                        var latlng = {
                            "lat": position.coords.latitude,
                            "lng": position.coords.longitude,
                            "date": Date()
                        }
                        monitorGPSLocation(latlng).then(function (res) {
                            console.log(res)
                        }, function (err) {
                            console.log(err)
                        });
                    }, function (err) {
                        console.log(err)
                    });
                }

                function initiateGPSPositioning() {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        var latlng = {
                            "lat": position.coords.latitude,
                            "lng": position.coords.longitude,
                            "date": Date()
                        }
                        monitorGPSLocation(latlng);
                    }, function (err) {
                        console.log(err);
                    });
                }
            }])
        .service('ProductService', ['Internet', '$http', '$q', '$localstorage', 'config', '$auth', '$cordovaGeolocation', '$ionicPopup', 'localStorageService', 'LoaderService', '$state', function (Internet, $http, $q, $localstorage, config, $auth, $cordovaGeolocation, $ionicPopup, localStorageService, LoaderService, $state) {
                return {
                    updateTarget: function (token, data) {
                        var keys = $localstorage.getObject('keys') || [];
                        var key = data.target_id;
                        keys.push(key);
                        $localstorage.setObject(key, data);
                        var deferred = $q.defer();
                        var configs = {};
                        configs.headers = configs.headers || {};
                        if (token) {
                            configs.headers.Authorization = 'Bearer ' + token;
                        }
                        config.get().then(function (result) {
                            $http.post(result.baseUrl + "/update-target", data, configs)
                                    .success(function (data, status, headers, config) {
                                        deferred.resolve(data);
                                    })
                                    .error(function (data, status, headers, config) {
                                        deferred.reject(data);
                                    });
                        });
                        return deferred.promise;
                    },
                    getProductsList: function () {
                        var deferred = $q.defer();
                        config.get().then(function (result) {
                            if (Internet.isConnected() == true)
                            {
                                $http.get(result.baseUrl + "/get-products-list")
                                        .success(function (data, status, headers, config) {
                                            deferred.resolve(data);
                                            $localstorage.setObject('allproducts', data);
                                        })
                                        .error(function (data, status, headers, config) {

                                            deferred.resolve($localstorage.getObject('allproducts'));
                                        });
                            } else {
                                console.log("from sqllite");

                                deferred.resolve($localstorage.getObject('allproducts'));
                            }
                        });
                        return deferred.promise;
                    },
                    getProductsFromProductGroupId: function (productGroupId) {
                        var groups = {};
                        var data = $localstorage.getObject('products', false);
                        if (typeof data == 'undefined' || typeof data == null || typeof data == '') {
                            return groups;
                        }
                        groups[productGroupId] = [];
                        for (var i = 0; i < data.length; i++) {
                            var item = data[i];

                            //noinspection JSUnresolvedVariable
                            if (item.product_sub_group_id == productGroupId)
                            {
                                var gid = parseInt(item.product_sub_group_id);
                                groups[gid].push(
                                        item
                                        );
                            }

                        }
                        return groups[productGroupId];
                    },
                    addProduct: function (data) {
                        var options = {timeout: 10000, enableHighAccuracy: true};
                        $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
                            data.latitude = position.coords.latitude;
                            data.longitude = position.coords.longitude;
                            data.day = Date();
                            var orders = $localstorage.getObject('orders');
                            orders.push(data);
                            $localstorage.setObject('orders', orders);
                            localStorageService.setRoutes(data.route_id);
                            localStorageService.setStores(data.store_id);
                            localStorageService.setProductGroups(data.product_group_id);
                            localStorageService.setProducts(data.product_id);
                            return true;
                        }, function (err) {
                            var gpsError = '';
                            if (err.PERMISSION_DENIED) {
                                gpsError = "The permission for GPS has been disabled for this app";
                            } else if (err.POSITION_UNAVAILABLE) {
                                gpsError = "Your current position cannot be tracked right now by GPS, please try again later";
                            } else if (err.TIMEOUT) {
                                gpsError = "Your position request is timed out, please try again later";
                            } else {
                                gpsError = "Make sure you are connected to internet and gps is enabled."
                            }
                            $ionicPopup.alert({
                                title: 'Cannot Add Product!',
                                template: gpsError
                            });
                        });
                        return false;

                    },
                    verifyProducts: function (row, comment, visit) {

                        var orderTimestamp = Math.round(+new Date()/1000);
                        var orders = $localstorage.getObject('orders');
                        var unverifiedProducts = $localstorage.getObject('unverifiedProducts');
                        var products = row || unverifiedProducts;
                        for (var i = 0; i < products.length; i++) {
                            var data = products[i];
                            console.log("Visited=" + visit);
                            data.comment = comment;
                            data.visit = visit;
                            data.timestamp = orderTimestamp;
                            orders.push(data);
                            unverifiedProducts.splice(unverifiedProducts.indexOf(data), 1);
                            $localstorage.setObject('orders', orders);
                            localStorageService.setRoutes(data.route_id);
                            localStorageService.setStores(data.store_id);
                            localStorageService.setProductGroups(data.product_group_id);
                            localStorageService.setProducts(data.product_id);
                        }
                        $localstorage.setObject('unverifiedProducts', unverifiedProducts);
                        return true;
                    },
                    setProductData: function (data) {
                        var options = {timeout: 10000, enableHighAccuracy: true};
                        $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
                            data.latitude = position.coords.latitude;
                            data.longitude = position.coords.longitude;
                            data.day = Date();
                            var unverifiedProducts = $localstorage.getObject('unverifiedProducts');
                            unverifiedProducts.push(data);
                            $localstorage.setObject('unverifiedProducts', unverifiedProducts);
                            localStorageService.setUnverifiedProduct(data.product_id);
                            return true;
                        }, function (err) {
                            var gpsError = '';
                            if (err.PERMISSION_DENIED) {
                                gpsError = "The permission for GPS has been disabled for this app";
                            } else if (err.POSITION_UNAVAILABLE) {
                                gpsError = "Your current position cannot be tracked right now by GPS, please try again later";
                            } else if (err.TIMEOUT) {
                                gpsError = "Your position request is timed out, please try again later";
                            } else {
                                gpsError = "Make sure you are connected to internet and gps is enabled."
                            }
                            $ionicPopup.alert({
                                title: 'Cannot Add Product!',
                                template: gpsError
                            });
                        });
                        return false;
                    },
                    getUnverifiedProductData: function (storeId) {
                        var unverifiedProducts = $localstorage.getObject('unverifiedProducts');
                        var products = []
                        for (var i = 0; i < unverifiedProducts.length; i++) {
                            if (unverifiedProducts[i].store_id == storeId) {
                                products.push(unverifiedProducts[i]);
                            }
                        }
                        return products;
                    },
                    syncData: function () {
                        var deferred = $q.defer();
                        var data = $localstorage.getObject('orders');
                        var configs = {};
                        configs.headers = configs.headers || {};
                        configs.headers.Authorization = 'Bearer ' + $auth.getToken();
                        config.get().then(function (result) {

                            $http.post(result.baseUrl + "/update-target", data, configs)
                                    .success(function (data, status, headers, config) {
                                        deferred.resolve(data);
                                    })
                                    .error(function (data, status, headers, config) {
                                        deferred.reject(data);
                                    });



                        });
                        return deferred.promise;
                    },
                    syncStoreAdd: function () {
                        var deferred = $q.defer();
                        var configs = {};
                        configs.headers = configs.headers || {};
                        configs.headers.Authorization = 'Bearer ' + $auth.getToken();
                        config.get().then(function (result) {
                            var newstoredata = $localstorage.getObject("newstoreforadd");
                            if (newstoredata.length > 0)
                            {

                                var ii = 0;
                                angular.forEach(newstoredata, function (datas, key) {
                                    var mappedformat = mapFormToDb(datas);
                                    $http.post(result.baseUrl + "/add-new-store", mappedformat, configs)
                                            .success(function (data, status, headers, config) {
                                                deferred.resolve(data);
                                            })
                                            .error(function (data, status, headers, config) {
                                                deferred.reject(data);
                                            });

                                });

                            } else {
                                deferred.resolve("success");
                            }
                            return deferred.promise;
                        });
                    },
                    clearOrders: function () {
                        $localstorage.setObject('orders', []);
                    },
                    clearstores: function () {
                        $localstorage.setObject("newstoreforadd", []);
                    },
                    downloadallData: function () {
                        config.get().then(function (result) {
                            var deferred = $q.defer();
                            $http.get(result.baseUrl + "/get-products-list")
                                    .success(function (data, status, headers, config) {
                                        $localstorage.setObject('allproducts', data);
                                        LoaderService.hide();
                                    })
                                    .error(function (data, status, headers, config) {
                                    });
                            $http.get(result.baseUrl + "/no-order-reasons")
                                    .success(function (data, status, headers, config) {
                                        $localstorage.setObject('no-order-reasons', data);
                                        LoaderService.hide();
                                    })
                                    .error(function (data, status, headers, config) {
                                    });
                            $http.get(result.baseUrl + "/get-new-store-creation-info")
                                    .success(function (data, status, headers, config) {
                                        $localstorage.setObject('get-new-store-creation-info', data);
                                        LoaderService.hide();
                                    })
                                    .error(function (data, status, headers, config) {
                                    });
                            $http.get(result.baseUrl + "/get-target-details")
                                    .success(function (data, status, headers, config) {
                                        $localstorage.setObject('get_target_details', data);
                                        LoaderService.hide();
                                    })
                                    .error(function (data, status, headers, config) {
                                    });
                            $http.get(result.baseUrl + "/get-coverage-report")
                                    .success(function (data, status, headers, config) {
                                        $localstorage.setObject('get-coverage-report', data);
                                        LoaderService.hide();
                                    })
                                    .error(function (data, status, headers, config) {
                                    });

                            $http.get(result.baseUrl + "/get-targets?token=" + $auth.getToken())
                                    .success(function (data, status, headers, config) {
                                      console.log(data);
                                        $localstorage.setObject('allroutes', data);
                                        LoaderService.hide();
                                        // $state.go('tab.days');
                                        $state.transitionTo('tab.days', null, {reload: true, notify: true});
                                    })
                                    .error(function (data, status, headers, config) {

                                    });
                            deferred.resolve(true);
                            return deferred.promise;
                        });

                    }
                };
                function mapFormToDb(data)
                {
                    data['name'] = data['storeName'];
                    data['phone_number'] = data['phoneNumber'];
                    data['landline'] = data['landline'];
                    data['email'] = data['email'];
                    data['address'] = data['address'];
                    data['contact_person'] = data['contactPerson'];
                    data['longitude'] = data['lat'];
                    data['latitude'] = data['long'];
                    data['pan_no'] = data['panNo'];
                    data['store_size'] = data['size'];
                    data['store_type'] = ' ';
                    data['route_id'] = data['route'];
                    data['needs_verification'] = true;
                    return data;
                }
            }])
        .service('Store', ['$http', 'Internet', '$q', 'config', '$auth', '$cordovaGeolocation', '$localstorage', '$ionicPopup', 'localStorageService', function ($http, Internet, $q, config, $auth, $cordovaGeolocation, $localstorage, $ionicPopup, localStorageService) {
                return {
                    getDetails: function (storeId) {
                        var deferred = $q.defer();
                        config.get().then(function (result) {
                            if (Internet.isConnected() == true)
                            {
                                $http.get(result.baseUrl + "/get-store-details/" + storeId + '/store_id')
                                        .success(function (data, status, headers, config) {
                                            deferred.resolve(data);
                                            $localstorage.setObject('store_' + storeId + "_details", data);
                                        })
                                        .error(function (data, status, headers, config) {
                                            // deferred.reject(data);
                                            deferred.resolve($localstorage.getObject('store_' + storeId + "_details"));
                                        });
                            } else {
                                deferred.resolve($localstorage.getObject('store_' + storeId + "_details"));
                            }
                        });
                        return deferred.promise;
                    },
                    noOrderReasons: function () {
                        var deferred = $q.defer();
                        config.get().then(function (result) {
                            if (Internet.isConnected() == true)
                            {
                                $http.get(result.baseUrl + "/no-order-reasons")
                                        .success(function (data, status, headers, config) {
                                            deferred.resolve(data);
                                            $localstorage.setObject('no-order-reasons', data);
                                        })
                                        .error(function (data, status, headers, config) {
                                            //     deferred.reject(data);
                                            deferred.resolve($localstorage.getObject('no-order-reasons'));
                                        });
                            } else {
                                deferred.resolve($localstorage.getObject('no-order-reasons'));
                            }
                        });
                        return deferred.promise;
                    },
                    postNoOrderReason: function (data) {
                        var options = {timeout: 10000, enableHighAccuracy: true};
                        $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
                            data.latitude = position.coords.latitude;
                            data.longitude = position.coords.longitude;
                            data.day = Date();
                            localStorageService.setRoutes(data.route_id);
                            localStorageService.setStores(data.store_id);
                            var noOrders = $localstorage.getObject('noOrders');
                            noOrders.push(data);
                            $localstorage.setObject('noOrders', noOrders);
                            return true;
                        }, function (err) {
                            var gpsError = '';
                            if (err.PERMISSION_DENIED) {
                                gpsError = "The permission for GPS has been disabled for this app";
                            } else if (err.POSITION_UNAVAILABLE) {
                                gpsError = "Your current position cannot be tracked right now by GPS, please try again later";
                            } else if (err.TIMEOUT) {
                                gpsError = "Your position request is timed out, please try again later";
                            } else {
                                gpsError = "Make sure you are connected to internet and gps is enabled."
                            }
                            $ionicPopup.alert({
                                title: 'Cannot Add no delivery reason!',
                                template: gpsError
                            });
                        });
                        return false;
                    },
                    syncNoOrdersData: function () {
                        var deferred = $q.defer();
                        var data = $localstorage.getObject('noOrders');
                        var configs = {};
                        configs.headers = configs.headers || {};
                        configs.headers.Authorization = 'Bearer ' + $auth.getToken();
                        config.get().then(function (result) {
                            $http.post(result.baseUrl + "/update-no-orders", data, configs)
                                    .success(function (data, status, headers, config) {
                                        deferred.resolve(data);
                                    })
                                    .error(function (data, status, headers, config) {
                                        deferred.reject(data);
                                    });
                        });
                        return deferred.promise;
                    },
                    clearNoOrdersData: function () {
                        $localstorage.setObject('noOrders', []);
                    },
                    getNewAddStoreInfo: function () {
                        var deferred = $q.defer();
                        config.get().then(function (result) {
                            if (Internet.isConnected() == true)
                            {
                                $http.get(result.baseUrl + "/get-new-store-creation-info")
                                        .success(function (data, status, headers, config) {
                                            deferred.resolve(data);
                                            $localstorage.setObject('get-new-store-creation-info', data);
                                        })
                                        .error(function (data, status, headers, config) {
                                            // deferred.reject(data);
                                            deferred.resolve($localstorage.getObject('get-new-store-creation-info'));
                                        });
                            } else {
                                deferred.resolve($localstorage.getObject('get-new-store-creation-info'));
                            }
                        });
                        return deferred.promise;
                    },
                    postNewStoreData: function (postData) {
                        var mappedData = postData;
                        var deferred = $q.defer();
                        var configs = {};
                        configs.headers = configs.headers || {};
                        configs.headers.Authorization = 'Bearer ' + $auth.getToken();
                        config.get().then(function (result) {
                            if (Internet.isConnected() == true)
                            {
                                var newstoredata = $localstorage.getObject("newstoreforadd");
                                if (newstoredata.length > 0)
                                {
                                    newstoredata.push(mappedData);
                                } else {
                                    newstoredata = [];
                                    newstoredata.push(mappedData);

                                }
                                angular.forEach(newstoredata, function (datas, key) {
                                    var mappedformat = mapFormToDb(datas);
                                    $http.post(result.baseUrl + "/add-new-store", mappedformat, configs)
                                            .success(function (data, status, headers, config) {
                                                deferred.resolve(data);
                                            })
                                            .error(function (data, status, headers, config) {
                                                var newstoredata = $localstorage.getObject("newstoreforadd");
                                                if (newstoredata.length > 0)
                                                {
                                                    var newstoredata = newstoredata;
                                                } else {
                                                    var newstoredata = [];
                                                }
                                                newstoredata.push(mappedData);
                                                $localstorage.setObject("newstoreforadd", newstoredata);
                                                deferred.resolve("success");
                                            });
                                });
                            } else {
                                var newstoredata = $localstorage.getObject("newstoreforadd");
                                if (newstoredata.length > 0)
                                {
                                    var newstoredata = newstoredata;
                                } else {
                                    var newstoredata = [];
                                }
                                newstoredata.push(mappedData);
                                $localstorage.setObject("newstoreforadd", newstoredata);
                                deferred.resolve("success");

                            }
                        });
                        return deferred.promise;
                    },
                    updateLatLng: function (data) {
                        var deferred = $q.defer();
                        var configs = {};
                        configs.headers = configs.headers || {};
                        configs.headers.Authorization = 'Bearer ' + $auth.getToken();
                        config.get().then(function (result) {
                            $http.post(result.baseUrl + "/update-latlng", data, configs)
                                    .success(function (data, status, headers, config) {
                                        deferred.resolve(data);
                                    })
                                    .error(function (data, status, headers, config) {
                                        deferred.reject(data);
                                    });
                        });
                        return deferred.promise;
                    }
                };
                function mapFormToDb(data)
                {
                    data['name'] = data['storeName'];
                    data['phone_number'] = data['phoneNumber'];
                    data['landline'] = data['landline'];
                    data['email'] = data['email'];
                    data['address'] = data['address'];
                    data['contact_person'] = data['contactPerson'];
                    data['longitude'] = data['lat'];
                    data['latitude'] = data['long'];
                    data['pan_no'] = data['panNo'];
                    data['store_size'] = data['size'];
                    data['store_type'] = ' ';
                    data['route_id'] = data['route'];
                    data['needs_verification'] = true;
                    return data;
                }
            }])
        .service('Target', ['$http', 'Internet', '$q', 'config', '$auth', '$localstorage', function ($http, Internet, $q, config, $auth, $localstorage) {
                return {
                    get: function (storeId) {
                        var deferred = $q.defer();
                        config.get().then(function (result) {
                            if (Internet.isConnected() == true)
                            {
                                $http.get(result.baseUrl + "/get-target-details")
                                        .success(function (data, status, headers, config) {
                                            deferred.resolve(data);
                                            $localstorage.setObject('get_target_details', data);
                                        })
                                        .error(function (data, status, headers, config) {
                                            // deferred.reject(data);
                                            deferred.resolve($localstorage.getObject('get_target_details'));
                                        });
                            } else {
                                deferred.resolve($localstorage.getObject('get_target_details'));
                            }
                        });
                        return deferred.promise;
                    },
                    getCoverageReport: function () {
                        var deferred = $q.defer();
                        config.get().then(function (result) {
                            if (Internet.isConnected() == true)
                            {
                                $http.get(result.baseUrl + "/get-coverage-report")
                                        .success(function (data, status, headers, config) {
                                            deferred.resolve(data);
                                            $localstorage.setObject('get-coverage-report', data);
                                        })
                                        .error(function (data, status, headers, config) {
                                            deferred.reject(data);
                                            deferred.resolve($localstorage.getObject('get-coverage-report'));
                                        });
                            } else {
                                deferred.resolve($localstorage.getObject('get-coverage-report'));
                            }
                        });
                        return deferred.promise;
                    },
                    getUnSyncedTarget: function () {
                        var orders = $localstorage.getObject('orders');
                        var total = 0;
                        for (var i = 0; i < orders.length; i++) {
                            if (orders[i].discount == undefined || orders[i].discount == null)
                            {
                                orders[i].discount = 0;
                            }
                            var afterdiscount = (100 - localOrders[i].discount) / 100;
                            total += (orders[i].price * orders[i].sold_qty) * afterdiscount;
                        }
                        return total;
                    }
                }
            }])
        .service('TargetHistory', ['$http', '$localstorage', 'Internet', '$q', 'config', '$auth', function ($http, $localstorage, Internet, $q, config, $auth) {
                return {
                    get: function (storeId) {
                        var url = "/get-store-history";
                        if (typeof storeId != 'undefined') {
                            url = "/get-store-history/" + storeId;
                        }
                        var deferred = $q.defer();
                        config.get().then(function (result) {
                            if (Internet.isConnected() == true)
                            {
                                $http.get(result.baseUrl + url)
                                        .success(function (data, status, headers, config) {
                                            deferred.resolve(data);
                                            $localstorage.setObject('get-coverage-report-' + storeId, data);
                                        })
                                        .error(function (data, status, headers, config) {
                                            deferred.reject(data);
                                            deferred.resolve($localstorage.getObject('get-coverage-report-' + storeId));
                                        });
                            } else {
                                deferred.resolve($localstorage.getObject('get-coverage-report-' + storeId));

                            }
                        });
                        return deferred.promise;
                    },
                    groupByStore: function (data) {
                        var groups = [];
                        if (typeof data == 'undefined' || typeof data == null || typeof data == '') {
                            return groups;
                        }
                        for (var i = 0; i < data.length; i++) {
                            var item = data[i];
                            if (!groups[item.store_id]) {
                                groups[item.store_id] = [];
                            }
                            groups[item.store_id].push(
                                    item
                                    );
                        }
                        return groups;
                    },
                    getTargetHistory: function (data) {
                        var returnData = [];
                        var today = new Date().getDay();
                        for (var i = 0; i < data.length; i++) {
                            var item = data[i];
                            returnData.push(item);
                        }
                        return returnData;
                    }
                }
            }])
        .service('OrderStatus', ['$http', '$localstorage', 'Internet', '$q', 'config', '$auth', function ($http, $localstorage, Internet, $q, config, $auth) {
                return {
                    get: function (storeId) {
                        var url = "/get-order-status";
                        if (typeof storeId != 'undefined') {
                            url = "/get-order-status/" + storeId;
                        }
                        var deferred = $q.defer();
                        config.get().then(function (result) {
                            if (Internet.isConnected() == true)
                            {
                                $http.get(result.baseUrl + url)
                                        .success(function (data, status, headers, config) {
                                            console.log(data);
                                            deferred.resolve(data);
                                            $localstorage.setObject('get-coverage-report-' + storeId, data);
                                        })
                                        .error(function (data, status, headers, config) {
                                            deferred.reject(data);
                                            deferred.resolve($localstorage.getObject('get-coverage-report-' + storeId));
                                        });
                            } else {
                                deferred.resolve($localstorage.getObject('get-coverage-report-' + storeId));

                            }
                        });
                        return deferred.promise;
                    }
                }
            }])
        .service('Orders', function ($http, Internet, $q, config, $auth, $localstorage, Routes) {
            return {
                getUnSyncedOrders: function (storeId) {
                    var orders = [];
                    var localOrders = $localstorage.getObject('orders');
                    for (var i = 0; i < localOrders.length; i++) {
                        if (typeof storeId != 'undefined') {
                            if (localOrders[i].store_id == storeId) {
                                var obj = {
                                    "amount": localOrders[i].sold_qty * localOrders[i].price,
                                    "day": localOrders[i].day.split(' ').slice(0, 3).join(' '),
                                    "product_name": localOrders[i].product_name,
                                    "product_group_name": localOrders[i].product_group_name,
                                    "route_name": localOrders[i].route_name,
                                    "store_name": localOrders[i].store_name,
                                    "store_id": localOrders[i].store_id,
                                    "quantity": localOrders[i].sold_qty
                                }
                                orders.push(obj);
                            }
                        } else {
                            var obj = {
                                "amount": localOrders[i].sold_qty * localOrders[i].price,
                                "day": localOrders[i].day.split(' ').slice(0, 3).join(' '),
                                "product_name": localOrders[i].product_name,
                                "product_group_name": localOrders[i].product_group_name,
                                "route_name": localOrders[i].route_name,
                                "store_name": localOrders[i].store_name,
                                "store_id": localOrders[i].store_id,
                                "quantity": localOrders[i].sold_qty
                            }
                            orders.push(obj);
                        }
                    }
                    return orders;
                },
                getOrders: function () {
                    var deferred = $q.defer();
                    this.getSyncedOrders().then(function (result) {
                        var orders = result;
                        var localOrders = $localstorage.getObject('orders');
                        for (var i = 0; i < localOrders.length; i++) {
                            if (localOrders[i].discount == undefined || localOrders[i].discount == null)
                            {
                                localOrders[i].discount = 0;
                            }
                            var afterdiscount = (100 - localOrders[i].discount) / 100;
                            var obj = {
                                "amount": localOrders[i].sold_qty * localOrders[i].price * afterdiscount,
                                "day": localOrders[i].day.split(' ').slice(0, 3).join(' '),
                                "product_name": localOrders[i].product_name,
                                "route_name": localOrders[i].route_name,
                                "store_name": localOrders[i].store_name,
                                "store_id": localOrders[i].store_id,
                                "quantity": localOrders[i].sold_qty
                            }
                            orders.push(obj);
                        }
                        // var unVefifiedOrders = $localstorage.getObject('unverifiedProducts');
                        // for (var i = 0; i < unVefifiedOrders.length; i++) {
                        //     var obj = {
                        //         "amount": unVefifiedOrders[i].sold_qty * unVefifiedOrders[i].price,
                        //         "day": unVefifiedOrders[i].day.split(' ').slice(0, 3).join(' '),
                        //         "product_name": unVefifiedOrders[i].product_name,
                        //         "route_name": unVefifiedOrders[i].route_name,
                        //         "store_name": unVefifiedOrders[i].store_name,
                        //         "store_id": unVefifiedOrders[i].store_id,
                        //         "quantity": unVefifiedOrders[i].sold_qty
                        //     }
                        //     orders.push(obj);
                        // }
                        deferred.resolve(Routes.groupByStore(orders));
                    }, function (err) {
                        deferred.reject(err);
                    });
                    return deferred.promise;
                },
                getSyncedOrders: function (storeId) {
                    var url = "/get-todays-order";
                    if (typeof storeId != 'undefined') {
                        url = "/get-todays-order/" + storeId;
                    }
                    var deferred = $q.defer();
                    config.get().then(function (result) {
                        if (Internet.isConnected() == true)
                        {
                            $http.get(result.baseUrl + url)
                                    .success(function (data, status, headers, config) {
                                        deferred.resolve(data);
                                        $localstorage.setObject('get-todays-order-' + storeId, data);
                                    })
                                    .error(function (data, status, headers, config) {
                                        deferred.reject(data);
                                        deferred.resolve($localstorage.getObject('get-todays-order-' + storeId));
                                    });
                        } else {
                            deferred.resolve($localstorage.getObject('get-todays-order-' + storeId));

                        }
                    });
                    return deferred.promise;
                }
            }
        })
        .service('localStorageService', function ($localstorage, $rootScope, CacheFactory) {
            var options = {
                maxAge: 54000000, // Items added to this cache expire after 15 hour.
                cacheFlushInterval: 54000000, // This cache will clear itself every 15 hour.
                deleteOnExpire: 'aggressive', // Items will be deleted from this cache right when they expire.
                storageMode: 'localStorage' // This cache will use `localStorage`.
            };
            var routes = CacheFactory.get('routes') || CacheFactory('routes', options);
            var stores = CacheFactory.get('stores') || CacheFactory('stores', options);
            var productGroups = CacheFactory.get('productGroups') || CacheFactory('productGroups', options);
            var products = CacheFactory.get('product') || CacheFactory('product', options);
            var unverifiedRoute = CacheFactory.get('unverifiedRoute') || CacheFactory('unverifiedRoute', options);
            var unverifiedStore = CacheFactory.get('unverifiedStore') || CacheFactory('unverifiedStore', options);
            var unverifiedProductGroup = CacheFactory.get('unverifiedProductGroup') || CacheFactory('unverifiedProductGroup', options);
            var unverifiedProduct = CacheFactory.get('unverifiedProduct') || CacheFactory('unverifiedProduct', options);
            var syncedRoute = CacheFactory.get('syncedRoute') || CacheFactory('syncedRoute', options);
            var syncedStore = CacheFactory.get('syncedStore') || CacheFactory('syncedStore', options);
            var syncedProductGroup = CacheFactory.get('syncedProductGroup') || CacheFactory('syncedProductGroup', options);
            var syncedProduct = CacheFactory.get('syncedProduct') || CacheFactory('syncedProduct', options);

            this.setRoutes = function (routeId) {
                var str = $rootScope.day + '' + routeId;
                routes.put(hashCode(str), hashCode(str));
                return this;
            };

            this.routeExits = function (routeId) {
                var str = $rootScope.day + '' + routeId;
                return routes.get(hashCode(str)) ? true : false;
            }

            this.setStores = function (storeId) {
                var str = $rootScope.day + '' + $rootScope.routeId + '' + storeId;
                stores.put(hashCode(str), hashCode(str));
                this.setRoutes($rootScope.routeId);
                return this;
            }

            this.storeExists = function (storeId) {
                var str = $rootScope.day + '' + $rootScope.routeId + '' + storeId;
                return stores.get(hashCode(str)) ? true : false;
            }

            this.setProductGroups = function (productGroupId) {
                var str = $rootScope.day + '' + $rootScope.routeId + '' + $rootScope.storeId + '' + productGroupId;
                productGroups.put(hashCode(str), hashCode(str));
                this.setStores($rootScope.storeId);
                this.setRoutes($rootScope.routeId);
                return this;
            }

            this.productGroupExists = function (productGroupId) {
                var str = $rootScope.day + '' + $rootScope.routeId + '' + $rootScope.storeId + '' + productGroupId;
                return productGroups.get(hashCode(str)) ? true : false;
            }

            this.setProducts = function (productId) {
                var str = $rootScope.day + '' + $rootScope.routeId + '' + $rootScope.storeId + '' + $rootScope.productGroupId + '' + productId;
                products.put(hashCode(str), hashCode(str));
                this.setProductGroups($rootScope.productGroupId);
                this.setStores($rootScope.storeId);
                this.setRoutes($rootScope.routeId);
                return this;
            }

            this.productExists = function (productId) {
                var str = $rootScope.day + '' + $rootScope.routeId + '' + $rootScope.storeId + '' + $rootScope.productGroupId + '' + productId;
                return products.get(hashCode(str)) ? true : false;
            }

            this.setUnverifiedRoute = function () {
                var str = $rootScope.day + '' + $rootScope.routeId;
                unverifiedRoute.put(hashCode(str), hashCode(str));
                return this;
            }
            this.setUnverifiedStore = function () {
                var str = $rootScope.day + '' + $rootScope.routeId + '' + $rootScope.storeId;
                unverifiedStore.put(hashCode(str), hashCode(str));
                return this;
            }
            this.setUnverifiedProductGroup = function () {
                var str = $rootScope.day + '' + $rootScope.routeId + '' + $rootScope.storeId + '' + $rootScope.productGroupId;
                unverifiedProductGroup.put(hashCode(str), hashCode(str));
                return this;
            }
            this.setUnverifiedProduct = function (productId) {
                var str = $rootScope.day + '' + $rootScope.routeId + '' + $rootScope.storeId + '' + $rootScope.productGroupId + '' + productId;
                unverifiedProduct.put(hashCode(str), hashCode(str));
                this.setUnverifiedRoute();
                this.setUnverifiedStore();
                this.setUnverifiedProductGroup();
                return this;
            }

            this.isUnverifiedProduct = function (productId) {
                var str = $rootScope.day + '' + $rootScope.routeId + '' + $rootScope.storeId + '' + $rootScope.productGroupId + '' + productId;
                return unverifiedProduct.get(hashCode(str)) ? true : false;
            }
            this.isUnverifiedProductGroup = function (productGroupId) {
                var str = $rootScope.day + '' + $rootScope.routeId + '' + $rootScope.storeId + '' + productGroupId;
                return unverifiedProductGroup.get(hashCode(str)) ? true : false;
            }
            this.isUnverifiedStore = function (storeId) {
                var str = $rootScope.day + '' + $rootScope.routeId + '' + storeId;
                return unverifiedStore.get(hashCode(str)) ? true : false;
            }

            this.isUnverifiedRoute = function (routeId) {
                var str = $rootScope.day + '' + routeId;
                return unverifiedRoute.get(hashCode(str)) ? true : false;
            }

            this.removeUnverifiedProduct = function (productId) {
                var str = $rootScope.day + '' + $rootScope.routeId + '' + $rootScope.storeId + '' + $rootScope.productGroupId + '' + productId;
                unverifiedProduct.remove(hashCode(str));
            }

            this.clearUnverified = function () {
                unverifiedProduct.removeAll();
                unverifiedProductGroup.removeAll();
                unverifiedStore.removeAll();
                unverifiedRoute.removeAll();
            }

            this.setSynced = function (productId) {
                var routeKeys = routes.keys();
                for (var i = 0; i < routeKeys.length; i++) {
                    var route = routes.get(routeKeys[i]);
                    syncedRoute.put(route, route);
                    routes.remove(route);
                }

                var storeKeys = stores.keys();
                for (var i = 0; i < storeKeys.length; i++) {
                    var store = stores.get(storeKeys[i]);
                    syncedStore.put(store, store);
                    stores.remove(store);
                }

                var productGroupsKeys = productGroups.keys();
                for (var i = 0; i < productGroupsKeys.length; i++) {
                    var productGroup = productGroups.get(productGroupsKeys[i]);
                    syncedProductGroup.put(productGroup, productGroup);
                    productGroups.remove(productGroup);
                }

                var productKeys = products.keys();
                for (var i = 0; i < productKeys.length; i++) {
                    var product = products.get(productKeys[i]);
                    syncedProduct.put(product, product);
                    products.remove(product);
                }
            }

            this.isSyncedProduct = function (productId) {
                var str = $rootScope.day + '' + $rootScope.routeId + '' + $rootScope.storeId + '' + $rootScope.productGroupId + '' + productId;
                return syncedProduct.get(hashCode(str)) ? true : false;
            }
            this.isSyncedProductGroup = function (productGroupId) {
                var str = $rootScope.day + '' + $rootScope.routeId + '' + $rootScope.storeId + '' + productGroupId;
                return syncedProductGroup.get(hashCode(str)) ? true : false;
            }
            this.isSyncedStore = function (storeId) {
                var str = $rootScope.day + '' + $rootScope.routeId + '' + storeId;
                return syncedStore.get(hashCode(str)) ? true : false;
            }
            this.isSyncedRoute = function (routeId) {
                var str = $rootScope.day + '' + routeId;
                return syncedRoute.get(hashCode(str)) ? true : false;
            }

            this.clearStorage = function () {
                $localstorage.setObject('orders', []);
                $localstorage.setObject('noOrders', []);
            }
            function hashCode(str) {
                var hash = 0;
                if (str.length == 0)
                    return hash;
                for (var i = 0; i < str.length; i++) {
                    char = str.charCodeAt(i);
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash; // Convert to 32bit integer
                }
                return hash;
            }
        })
        .service("Internet", function ($cordovaNetwork) {
            return {
                isConnected: function () {
                    return window.navigator.onLine;
                }
            }
        })



        .service('LoginService', ['$http', '$q', function ($http, $q) {
                return {
                    loginUser: function (name, pw) {
                        var deferred = $q.defer();
                        var data = {'username': name, 'password': pw};
                        config.get().then(function (result) {
                            console.log("Here" + result.imei_check);
                            if (result.imei_check === true)
                            {

                                var deviceID = window.device.uuid;
                                //var deviceID = 1234567;
                                var data = {'username': name, 'password': pw, 'imeino': deviceID};
                            }
                            $http.post(result.baseUrl + "/authenticate", data)
                                    .success(function (data, status, headers, config) {
                                        deferred.resolve(data);
                                    })
                                    .error(function (data, status, headers, config) {
                                        deferred.reject(data);
                                    });
                        })

                        return deferred.promise;
                    }
                }
            }]);
