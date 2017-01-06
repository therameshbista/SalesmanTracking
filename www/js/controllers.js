angular.module('starter.controllers', [])
        .controller('DashCtrl', function ($scope) {
        })
        .controller('DaysCtrl', function ($scope) {
            $scope.today = new Date().getDay();
            $scope.days = [
                {
                    'id': 0,
                    'name': 'Sunday'
                },
                {
                    'id': 1,
                    'name': 'Monday'
                },
                {
                    'id': 2,
                    'name': 'Tuesday'
                },
                {
                    'id': 3,
                    'name': 'Wednesday'
                },
                {
                    'id': 4,
                    'name': 'Thursday'
                },
                {
                    'id': 5,
                    'name': 'Friday'
                },
                {
                    'id': 6,
                    'name': 'Saturday'
                },
            ];
        })
        .controller('ConnectionCtrl', function (Internet, $scope) {

            if (Internet.isConnected() == true)
            {

                $scope.lastupdated = false;
                var date = new Date();
                $localstorage.set("lastupdated", date);
            } else {
                $scope.lastupdated = $localstorage.get("lastupdated");
            }
        })
        .controller('RoutesCtrl', function ($scope, Routes, $auth, $ionicPopup, RoutesRegistry, LoaderService, $stateParams, $rootScope, localStorageService) {

            $scope.$on('$ionicView.enter', function () {
                LoaderService.show();
                Routes.all($auth.getToken())
                        .then(function (success) {
                            console.log("Token :" + $auth.getToken());
                            LoaderService.hide();
                            $scope.data = success;



                            //   RoutesRegistry.setUnfiltered(success);
                            //  $scope.daysData = Routes.groupByDay($scope.data)
                            //   var day = $scope.day = $rootScope.day = $stateParams.day;
                            //    var today = $scope.today = new Date().getDay();
                            /*     if (day == today) {
                             $rootScope.extraRoute = 0;
                             } else if (day > today) {
                             $rootScope.extraRoute = 1;
                             } else if (day < today) {
                             $rootScope.extraRoute = 2;
                             }
                             */
                            //    $scope.routes = Routes.getRoutesOfADay($scope.daysData, day);
                            $scope.routes = success;
                            RoutesRegistry.setFiltered($scope.routes);
                        },
                                function (error) {
                                    LoaderService.hide();
                                    var alertPopup = $ionicPopup.alert({
                                        title: 'Failed fetching routes!',
                                        template: 'Please check your internet connection!'
                                    });
                                });
            });
            $scope.keyExists = function (id) {
                return localStorageService.routeExits(id);
            }
            $scope.isUnverified = function (id) {
                return localStorageService.isUnverifiedRoute(id);
            }
            $scope.isSynced = function (id) {
                return localStorageService.isSyncedRoute(id);
            }
            $scope.isEmpty = function (obj) {
                for (var i in obj)
                    if (obj.hasOwnProperty(i))
                        return false;
                return true;
            };

        })
        .controller('StoresCtrl',
                function ($scope, Internet, $stateParams, $auth, Routes, RoutesRegistry,
                        $cordovaGeolocation, $ionicPopup, LoaderService, $ionicModal,
                        Store, getMap, $rootScope, $localstorage, localStorageService, $state, $ionicHistory, punch, Target) {
                    $rootScope.routeId = $stateParams.routeId;
                    $rootScope.routeName = $stateParams.routeName;
                    /*     if (typeof $stateParams.storeType != 'undefined' && $stateParams.storeType.toLowerCase() == 'wholesale') {
                     $rootScope.storeType = 'wholesale';
                     } else if (typeof $stateParams.storeType != 'undefined' && $stateParams.storeType.toLowerCase() == 'special') {
                     $rootScope.storeType = 'special';
                     } else {
                     $rootScope.storeType = 'retail';
                     }*/
                    $scope.location = {};

                    $scope.keyExists = function (id) {
                        return localStorageService.storeExists(id);
                    }
                    $scope.isUnverified = function (id) {
                        return localStorageService.isUnverifiedStore(id);
                    }
                    $scope.isSynced = function (id) {
                        return localStorageService.isSyncedStore(id);
                    }
                    $scope.addStore = function () {
                        console.log("Must be hide");
                        LoaderService.hide();
                        $state.go('tab.add-new-store', {fabbutton: true, fromStores: true, routeId: $rootScope.routeId});

                    }
                    $scope.getCurrentLocation = function () {
                        getMap.get(false, 'Your Location', 'map1');
                    }
                    if (!$stateParams.fromStores && $stateParams.routeId) {
                        $scope.routeId = $stateParams.routeId;
                        LoaderService.show();
                        Routes.all($auth.getToken())
                                .then(function (success) {
                                    LoaderService.hide();
                                    $scope.stores = success;
                                    //   $scope.stores = Routes.getStoresFromRouteId(success, $stateParams.routeId);
                                });
                        $ionicModal.fromTemplateUrl('templates/store-details.html', {
                            scope: $scope
                        }).then(function (modal) {
                            $scope.storeDetailsModal = modal;
                        });
                        $ionicModal.fromTemplateUrl('templates/no-order-reason.html', {
                            scope: $scope
                        }).then(function (modal) {
                            $scope.noOrderReasonModal = modal;
                        });
                        $scope.showModal = function (popupType, store) {
                            $scope.store = store;
                            if (popupType == 1) {
                                Store.getDetails($scope.store[0].store_id).then(function (result) {
                                    getMap.get(result);
                                    $scope.modalData = result;
                                    $scope.storeDetailsModal.show();
                                })
                            } else if (popupType == 2) {
                                $scope.choice = {};
                                $scope.reasons = $localstorage.getObject('noOrderReasons', false);
                                $rootScope.storeId = $scope.store[0].store_id;
                                if (typeof $scope.reasons == 'object' && $scope.reasons.length < 1) {
                                    Store.noOrderReasons().then(function (result) {
                                        $scope.reasons = result;
                                        $localstorage.setObject('noOrderReasons', result);
                                        $scope.noOrderReasonModal.show();
                                    });
                                } else {
                                    $scope.noOrderReasonModal.show();
                                }
                            }
                        }

                        $scope.addReason = function () {
                            var data = {};
                            data.route_id = $rootScope.routeId;
                            data.store_id = $rootScope.storeId;
                            data.extra_route = $rootScope.extraRoute;
                            var reason = '';
                            if ($scope.choice.id == 6) {
                                data.reason = $scope.choice.other_reason;
                            } else {
                                data.reason = $scope.reasons[$scope.choice.id]
                            }
                            Store.postNoOrderReason(data);
                            $scope.noOrderReasonModal.hide();
                        }
                    } else {
                        if ($stateParams.fromStores) {
                            $scope.selectedRouteId = $stateParams.routeId;
                        }
                        function isNumeric(n) {
                            return !isNaN(parseFloat(n)) && isFinite(n);
                        }

                        getMap.get(false, 'You are here', 'map1');

                        $scope.form = {};
                        Store.getNewAddStoreInfo().then(function (result) {
                            $scope.storeSizes = {"Wholesale": "Wholesale", "Retail": "Retail", "Special": "Special"};
                            $scope.routes = result.routes;

                        });
                        $scope.addNewStore = function () {


                            Routes.all($auth.getToken())
                                    .then(function (success) {
                                        $scope.allStoresDataPan = success;
                                        var panNumberDuplicate = false;
                                        console.log(typeof $scope.form.panNo);

                                        if (typeof $scope.form.panNo != 'undefined') {
                                            for (var i = 0; i < success.length; i++) {
                                                console.log(typeof success[i].pan_no);
                                                if (success[i].pan_no === $scope.form.panNo.toString()) {
                                                    panNumberDuplicate = true;
                                                    break;
                                                } else {
                                                    console.log(success[i].pan_no);
                                                }
                                            }
                                        }


                                        if (panNumberDuplicate === true && typeof $scope.form.panNo != 'undefined') {
                                            $ionicPopup.alert({
                                                title: 'Invalid Pan',
                                                template: 'The entered pan is already entered and is duplicate.'
                                            });
                                        } else if (
                                                typeof $scope.form.storeName == 'undefined' ||
                                                typeof $scope.form.phoneNumber == 'undefined' ||
                                                typeof $scope.form.contactPerson == 'undefined' ||
                                                typeof $scope.form.size == 'undefined' ||
                                                typeof $scope.form.address == 'undefined' ||
                                                (typeof $scope.form.route == 'undefined' && !$stateParams.fabbutton) ||
                                                $scope.form.storeName == '' ||
                                                $scope.form.phoneNumber == '' ||
                                                $scope.form.contactPerson == '' ||
                                                $scope.form.panNo == '' ||
                                                $scope.form.size == '' ||
                                                $scope.form.address == '' ||
                                                ($scope.form.route == '' && !$stateParams.fabbutton)
                                                ) {
                                            $ionicPopup.alert({
                                                title: 'Invalid data',
                                                template: 'Please fill all the required fileds.'
                                            });
                                        } else if (!isNumeric($scope.form.phoneNumber)) {
                                            $ionicPopup.alert({
                                                title: 'Invalid phone number',
                                                template: 'Phone number shold be number.'
                                            });
                                        } else {
                                            if ($scope.form.route == '' || typeof $scope.form.route == 'undefined') {
                                                $scope.form.route = $stateParams.routeId;
                                            }

                                            $scope.form.lat = RoutesRegistry.getLatLng().lat();
                                            $scope.form.long = RoutesRegistry.getLatLng().lng();


                                            LoaderService.show();
                                            Store.postNewStoreData($scope.form).then(function (res) {
                                                LoaderService.hide();
                                                punch.order("Outlet Added");
                                                $ionicPopup.alert({
                                                    title: 'Success',
                                                    template: 'Store added successfully.'
                                                });
                                                $scope.form = {};
                                                $ionicHistory.goBack();
                                            }, function (error) {
                                                var message = '';
                                                if (typeof error['name'] !== 'undefined') {
                                                    message += "<br/>" + error['name'].pop();
                                                }
                                                if (typeof error['pan_no'] !== 'undefined') {
                                                    message += "<br/>" + error['pan_no'].pop();
                                                }
                                                LoaderService.hide();
                                                $ionicPopup.alert({
                                                    title: 'Error',
                                                    template: (message == '') ? 'An error occured while sending data to the server.' : message
                                                });
                                            })
                                        }
                                    },
                                            function (error) {

                                            });
                        }
                    }
                })
        .controller('ProductGroupCtrl',
                function ($window, $scope, $stateParams, Routes, RoutesRegistry, $rootScope,
                        $localstorage, ProductService, localStorageService, $ionicSlideBoxDelegate,
                        Store, getMap, TargetHistory, LoaderService, $state, Orders, $ionicModal, $ionicPopup, $ionicHistory, Internet) {
                    var day = $rootScope.day;
                    LoaderService.show();
                    $rootScope.storeType = $stateParams.storeType;
                    $scope.productsGroups = $localstorage.getObject('products', false);
                    if (typeof $scope.productsGroups == 'object' && $scope.productsGroups.length < 1 || (Internet.isConnected() === true)) {
                        ProductService.getProductsList().then(function (result) {
                            LoaderService.hide();
                            $scope.productsGroups = result;
                            $localstorage.setObject('products', result);
                        })
                    } else {
                        LoaderService.hide();
                    }
                    $scope.orderEdit = true;
//                    $ionicModal.fromTemplateUrl('templates/edit-order.html', {
//                        scope: $scope
//                    }).then(function (modal) {
//                        $scope.modal = modal;
//                    });
                    $scope.$on('positionChanged', function () {
                        $scope.showFab = true;
                        $scope.$apply();
                    });
                    $rootScope.storeId = $stateParams.storeId;
                    $rootScope.storeName = $stateParams.storeName;
                    $scope.storeName = $rootScope.storeName;

                    $scope.toggleGroup = function (group) {
                        if (group.product_sub_group_id)
                        {
                            if ($scope.isGroupShown(group)) {
                                $scope.shownGroup = null;
                            } else {
                                $scope.shownGroup = group;
                            }
                        } else {
                            var link = "tab/product/" + group.product_group_id + "/" + group.product_group_name;
                            $window.location.href = link;
                        }

                    };
                    $scope.isGroupShown = function (group) {
                        return $scope.shownGroup === group;
                    };

                    $scope.updateLocation = function () {
                        LoaderService.show();
                        var latlng = RoutesRegistry.getLatLng();
                        var data = {
                            "store_id": $rootScope.storeId,
                            "lat": latlng.lat(),
                            "lng": latlng.lng()
                        }
                        Store.updateLatLng(data).then(function (succ) {
                            LoaderService.hide();
                        }, function (err) {
                            LoaderService.hide();
                        })
                    }
                    $scope.getCurrentLocation = function () {
                        getMap.get(false, 'Your Location');

                        $scope.showFab = true;
                    }
                    $scope.choice = {};
                    $scope.reasons = $localstorage.getObject('noOrderReasons', false);
                    if (typeof $scope.reasons == 'object' && $scope.reasons.length < 1) {
                        Store.noOrderReasons().then(function (result) {
                            $scope.reasons = result;
                            $localstorage.setObject('noOrderReasons', result);
                        });
                    }

                    TargetHistory.get($stateParams.storeId).then(function (result) {
                        $scope.orderHistory = result;
                    },
                            function (error) {
                                $scope.orderHistoryError = error;
                            });

                    $scope.active_content = 'groups';
                    $scope.verifiyable = false;
                    $scope.setActiveContent = function (active_content) {
                        $scope.active_content = active_content;
                        alert($scope.active_content);
                        if (active_content == 'info') {
                            Store.getDetails($stateParams.storeId).then(function (result) {
                                getMap.get(result);
                                $scope.modalData = result;
                            });
                        }
                        if (active_content == 'verify-orders') {
                            $scope.verifiyable = false;
                            $scope.unverifiedProducts = ProductService.getUnverifiedProductData($rootScope.storeId);
                            $scope.totalAmount = 0;
                            for (var i = 0; i < $scope.unverifiedProducts.length; i++) {
                                var totalAmt = ($scope.unverifiedProducts[i].price * $scope.unverifiedProducts[i].sold_qty);
                                var priceWithExcise = totalAmt + (totalAmt * $scope.unverifiedProducts[i].excise) / 100;
                                var withDiscount = priceWithExcise - (priceWithExcise * $scope.unverifiedProducts[i].discount) / 100;
                                var withTax = withDiscount + (withDiscount * $scope.unverifiedProducts[i].tax) / 100;
                                $scope.totalAmount += withTax;
                            }
                            $scope.storeName = $rootScope.storeName;
                        }
                        if (active_content == 'orders') {
                            var orders = Orders.getUnSyncedOrders();
                            Orders.getSyncedOrders($rootScope.storeId).then(function (success) {
                                $scope.orders = orders.concat(success);
                            },
                                    function (error) {
                                        $scope.orders = orders;
                                    });
                        }

                    }
                    $scope.onItemDelete = function (item) {
                        $scope.unverifiedProducts.splice($scope.unverifiedProducts.indexOf(item), 1);
                        localStorageService.removeUnverifiedProduct(item.product_id);
                        $scope.totalAmount = 0;
                        for (var i = 0; i < $scope.unverifiedProducts.length; i++) {
                            var totalAmt = ($scope.unverifiedProducts[i].price * $scope.unverifiedProducts[i].sold_qty);
                            var priceWithExcise = totalAmt + (totalAmt * $scope.unverifiedProducts[i].excise) / 100;
                            var withDiscount = priceWithExcise - (priceWithExcise * $scope.unverifiedProducts[i].discount) / 100;
                            var withTax = withDiscount + (withDiscount * $scope.unverifiedProducts[i].tax) / 100;
                            $scope.totalAmount += withTax;
                        }
                        $localstorage.setObject('unverifiedProducts', $scope.unverifiedProducts);
                    };
                    $scope.showEditProduct = function (item) {
                        $scope.item = item;
                        $scope.discount = item.discount;
                        $scope.sold_qty = item.sold_qty;
                        $scope.calculateTotal(item.sold_qty, item.price, item.discount, item.excise, item.tax);
                        $ionicModal.fromTemplateUrl('templates/edit-order.html', {
                            scope: $scope
                        }).then(function (modal) {
                            $scope.modal = modal;
                            $scope.modal.show();
                        });
                    }

                    $scope.calculateTotal = function (qty, price, discount, excise, tax) {
                        if (discount == null) {
                            discount = 0;
                        }
                        var total = qty * price;
                        var exciseAmt = ((total * excise) / 100);
                        var excisedAmount = total + exciseAmt;
                        var discount = ((excisedAmount * discount) / 100);
                        var discountedAmount = excisedAmount - discount;
                        var taxAmount = (discountedAmount * tax) / 100;
                        var totalAmount = discountedAmount + taxAmount;
                        $scope.discountAmt = discount;
                        $scope.exciseAmt = exciseAmt;
                        $scope.taxAmt = taxAmount;
                        $scope.totalSum = totalAmount;
                    }
                    $scope.updateOrder = function (qty) {
                        var index = $scope.unverifiedProducts.indexOf($scope.item);
                        $scope.unverifiedProducts[index].sold_qty = qty;
                        $scope.totalAmount = 0;
                        for (var i = 0; i < $scope.unverifiedProducts.length; i++) {
                            var totalAmt = ($scope.unverifiedProducts[i].price * $scope.unverifiedProducts[i].sold_qty);
                            var priceWithExcise = totalAmt + (totalAmt * $scope.unverifiedProducts[i].excise) / 100;
                            var withDiscount = priceWithExcise - (priceWithExcise * $scope.unverifiedProducts[i].discount) / 100;
                            var withTax = withDiscount + (withDiscount * $scope.unverifiedProducts[i].tax) / 100;
                            $scope.totalAmount += withTax;
                        }
                        $localstorage.setObject('unverifiedProducts', $scope.unverifiedProducts);
                        $scope.modal.hide();
                    }

                    $scope.verifyProducts = function () {
                        $ionicModal.fromTemplateUrl('templates/comment.html', {
                            scope: $scope
                        }).then(function (modal) {
                            $scope.commentModal = modal;
                            $scope.commentModal.show();
                        });
                    }
                    $scope.visit = 1;
                    $scope.ischeckedvisit = function (visit) {
                        if (visit == $scope.visit)
                        {
                            return true;
                        } else {
                            return false;
                        }
                    };
                    $scope.addCommentAndVerifyProduct = function (comment, visit) {

                        ProductService.verifyProducts($scope.unverifiedProducts, comment, $scope.visit);
                        $scope.unverifiedProducts = ProductService.getUnverifiedProductData($rootScope.storeId);
                        $scope.totalAmount = 0;
                        for (var i = 0; i < $scope.unverifiedProducts.length; i++) {
                            var totalAmt = ($scope.unverifiedProducts[i].price * $scope.unverifiedProducts[i].sold_qty);
                            var priceWithExcise = totalAmt + (totalAmt * $scope.unverifiedProducts[i].excise) / 100;
                            var withDiscount = priceWithExcise - (priceWithExcise * $scope.unverifiedProducts[i].discount) / 100;
                            var withTax = withDiscount + (withDiscount * $scope.unverifiedProducts[i].tax) / 100;
                            $scope.totalAmount += withTax;
                        }
                        $scope.storeName = $rootScope.storeName;
                        localStorageService.clearUnverified();
                        $scope.commentModal.remove();
                        $state.go('tab.stores', {"routeId": $rootScope.routeId, "routeName": $rootScope.routeName}, {reload: true});
                    }

                    $scope.isEmpty = function (obj) {
                        for (var i in obj) {
                            if (obj.hasOwnProperty(i))
                                return false;
                        }
                        return true;
                    };
                    $scope.keyExists = function (id) {
                        return localStorageService.productGroupExists(id);
                    }
                    $scope.isUnverified = function (id) {
                        return localStorageService.isUnverifiedProductGroup(id);
                    }
                    $scope.isSynced = function (id) {
                        return localStorageService.isSyncedProductGroup(id);
                    }
                    $scope.allDelivered = function (data) {
                        var delivered = true;
                        angular.forEach(data, function (k) {
                            if ((k.is_delivered == 0) && !($localstorage.get(k.target_id, false))) {
                                delivered &= false;
                                return false;
                            }
                        });
                        return delivered;
                    }
                    $scope.addReason = function () {
                        var data = {};
                        data.route_id = $rootScope.routeId;
                        data.store_id = $rootScope.storeId;
                        data.extra_route = $rootScope.extraRoute;
                        var reason = '';
                        if ($scope.choice.id == 6) {
                            data.reason = $scope.choice.other_reason;
                        } else {
                            data.reason = $scope.reasons[$scope.choice.id]
                        }
                        Store.postNoOrderReason(data);
                        $ionicPopup.alert({
                            title: 'No Order Reason Added',
                            template: 'Successfully added the no order Reason'
                        });
                        $ionicHistory.goBack();
                    }

                })
        .controller('ProductSubGroupCtrl',
                function ($window, $scope, $stateParams, Routes, RoutesRegistry, $rootScope,
                        $localstorage, ProductService, localStorageService, $ionicSlideBoxDelegate,
                        Store, getMap, TargetHistory, LoaderService, $state, Orders, $ionicModal, $ionicPopup, $ionicHistory, punch, Internet, $ionicTabsDelegate) {

                    var day = $rootScope.day;
                    $scope.productsGroups = $localstorage.getObject('products', false);
                    if (typeof $scope.productsGroups == 'object' && $scope.productsGroups.length < 1 || (Internet.isConnected() === true)) {
                        ProductService.getProductsList().then(function (result) {
                            $scope.productsGroups = result;
                            $localstorage.setObject('products', result);
                        })
                    }
//                    $ionicModal.fromTemplateUrl('templates/edit-order.html', {
//                        scope: $scope
//                    }).then(function (modal) {
//                        $scope.modal = modal;
//                    });
                    $scope.$on('positionChanged', function () {
                        $scope.showFab = true;
                        $scope.$apply();
                    });
                    $rootScope.groupId = $stateParams.productGroupId;
                    $rootScope.groupName = $stateParams.productGroupName;
                    $scope.groupName = $rootScope.groupName;
                    console.log($scope.groupName);
                    $scope.groupId = $stateParams.productGroupId;

                    $scope.updateLocation = function () {
                        LoaderService.show();
                        var latlng = RoutesRegistry.getLatLng();
                        var data = {
                            "store_id": $rootScope.storeId,
                            "lat": latlng.lat(),
                            "lng": latlng.lng()
                        }
                        Store.updateLatLng(data).then(function (succ) {
                            LoaderService.hide();
                        }, function (err) {
                            LoaderService.hide();
                        })
                    }
                    $scope.getCurrentLocation = function () {
                        getMap.get(false, 'Your Location');

                        $scope.showFab = true;
                    }
                    $scope.choice = {};
                    $scope.reasons = $localstorage.getObject('noOrderReasons', false);
                    if (typeof $scope.reasons == 'object' && $scope.reasons.length < 1) {
                        Store.noOrderReasons().then(function (result) {
                            $scope.reasons = result;
                            $localstorage.setObject('noOrderReasons', result);
                        });
                    }

                    TargetHistory.get($stateParams.storeId).then(function (result) {
                        $scope.orderHistory = result;
                    },
                            function (error) {
                                $scope.orderHistoryError = error;
                            });

                    $scope.active_content = 'groups';
                    $scope.verifiyable = false;
                    $scope.setActiveContent = function (active_content) {

                        $scope.active_content = active_content;

                        if (active_content == 'info') {
                            Store.getDetails($stateParams.storeId).then(function (result) {
                                getMap.get(result);
                                $scope.modalData = result;
                            });
                        }
                        if (active_content == 'verify-orders') {
                            $scope.verifiyable = true;
                            $scope.unverifiedProducts = ProductService.getUnverifiedProductData($rootScope.storeId);
                            $scope.totalAmount = 0;

                            for (var i = 0; i < $scope.unverifiedProducts.length; i++) {
                                console.log($scope.unverifiedProducts[i]);
                                if ($scope.unverifiedProducts[i].discount == undefined || $scope.unverifiedProducts[i].discount == null)
                                {
                                    $scope.unverifiedProducts[i].discount = 0;
                                }
                                var afterdiscount = 100 - $scope.unverifiedProducts[i].discount;

                                var totalAmt = ($scope.unverifiedProducts[i].price * $scope.unverifiedProducts[i].sold_qty);
                                var priceWithExcise = totalAmt + (totalAmt * $scope.unverifiedProducts[i].excise) / 100;
                                var withDiscount = priceWithExcise - (priceWithExcise * $scope.unverifiedProducts[i].discount) / 100;
                                var withTax = withDiscount + (withDiscount * $scope.unverifiedProducts[i].tax) / 100;

                                $scope.totalAmount += withTax;
                            }
                            $scope.storeName = $rootScope.storeName;
                        }
                        if (active_content == 'orders') {
                            var orders = Orders.getUnSyncedOrders();
                            Orders.getSyncedOrders($rootScope.storeId).then(function (success) {
                                $scope.orders = orders.concat(success);
                            },
                                    function (error) {
                                        $scope.orders = orders;
                                    });
                        }

                    }
                    $scope.onItemDelete = function (item) {
                        $scope.unverifiedProducts.splice($scope.unverifiedProducts.indexOf(item), 1);
                        localStorageService.removeUnverifiedProduct(item.product_id);
                        $scope.totalAmount = 0;
                        for (var i = 0; i < $scope.unverifiedProducts.length; i++) {
                            var totalAmt = ($scope.unverifiedProducts[i].price * $scope.unverifiedProducts[i].sold_qty);
                            var priceWithExcise = totalAmt + (totalAmt * $scope.unverifiedProducts[i].excise) / 100;
                            var withDiscount = priceWithExcise - (priceWithExcise * $scope.unverifiedProducts[i].discount) / 100;
                            var withTax = withDiscount + (withDiscount * $scope.unverifiedProducts[i].tax) / 100;
                            $scope.totalAmount += withTax;
                        }
                        $localstorage.setObject('unverifiedProducts', $scope.unverifiedProducts);
                    };
                    $scope.showEditProduct = function (item) {
                        $scope.item = item;
                        $scope.sold_qty = item.sold_qty;
                        if (item.discount == undefined || item.discount == null)
                        {
                            item.discount = 0;
                        }
                        $scope.discount = item.discount;
                        $ionicModal.fromTemplateUrl('templates/edit-order.html', {
                            scope: $scope
                        }).then(function (modal) {
                            $scope.modal = modal;
                            $scope.modal.show();
                        });
                    }
                    $scope.updateOrder = function (qty, discount) {
                        var index = $scope.unverifiedProducts.indexOf($scope.item);
                        $scope.unverifiedProducts[index].sold_qty = qty;
                        if (discount == undefined || discount == null)
                        {
                            discount = 0;
                        }
                        $scope.unverifiedProducts[index].discount = discount;
                        $scope.totalAmount = 0;
                        for (var i = 0; i < $scope.unverifiedProducts.length; i++) {
                            if ($scope.unverifiedProducts[i].discount == undefined || $scope.unverifiedProducts[i].discount == null)
                            {
                                $scope.unverifiedProducts[i].discount = 0;
                            }
                            var afterdiscount = 100 - $scope.unverifiedProducts[i].discount;
                            var totalAmt = ($scope.unverifiedProducts[i].price * $scope.unverifiedProducts[i].sold_qty);
                            var priceWithExcise = totalAmt + (totalAmt * $scope.unverifiedProducts[i].excise) / 100;
                            var withDiscount = priceWithExcise - (priceWithExcise * $scope.unverifiedProducts[i].discount) / 100;
                            var withTax = withDiscount + (withDiscount * $scope.unverifiedProducts[i].tax) / 100;
                            $scope.totalAmount += withTax;
                        }
                        $localstorage.setObject('unverifiedProducts', $scope.unverifiedProducts);
                        $scope.modal.hide();
                        punch.order("Order Updated");
                    }

                    $scope.verifyProducts = function () {
                        $ionicModal.fromTemplateUrl('templates/comment.html', {
                            scope: $scope
                        }).then(function (modal) {
                            $scope.commentModal = modal;
                            $scope.commentModal.show();
                        });
                    }
                    $scope.visit = 1;
                    $scope.ischeckedvisit = function (visit) {
                        if (visit == $scope.visit)
                        {
                            return true;
                        } else {
                            return false;
                        }
                    };

                    $scope.addCommentAndVerifyProduct = function (comment, visit) {
                        console.log("Unverified :");
                        console.log($scope.unverifiedProducts);
                        ProductService.verifyProducts($scope.unverifiedProducts, comment, visit);
                        $scope.unverifiedProducts = ProductService.getUnverifiedProductData($rootScope.storeId);
                        $scope.totalAmount = 0;
                        for (var i = 0; i < $scope.unverifiedProducts.length; i++) {
                            if ($scope.unverifiedProducts[i].discount == undefined || $scope.unverifiedProducts[i].discount == null)
                            {
                                $scope.unverifiedProducts[i].discount = 0;
                            }
                            var afterdiscount = 100 - $scope.unverifiedProducts[i].discount;
                            var totalAmt = ($scope.unverifiedProducts[i].price * $scope.unverifiedProducts[i].sold_qty);
                            var priceWithExcise = totalAmt + (totalAmt * $scope.unverifiedProducts[i].excise) / 100;
                            var withDiscount = priceWithExcise - (priceWithExcise * $scope.unverifiedProducts[i].discount) / 100;
                            var withTax = withDiscount + (withDiscount * $scope.unverifiedProducts[i].tax) / 100;
                            $scope.totalAmount += withTax;
                        }
                        $scope.storeName = $rootScope.storeName;
                        localStorageService.clearUnverified();
                        $scope.commentModal.remove();
                        $state.go('tab.stores', {"routeId": $rootScope.routeId, "routeName": $rootScope.routeName}, {reload: true});
                        punch.order("Order Verified");
                    }

                    $scope.isEmpty = function (obj) {
                        for (var i in obj) {
                            if (obj.hasOwnProperty(i))
                                return false;
                        }
                        return true;
                    };
                    $scope.keyExists = function (id) {
                        return localStorageService.productGroupExists(id);
                    }
                    $scope.isUnverified = function (id) {
                        return localStorageService.isUnverifiedProductGroup(id);
                    }
                    $scope.isSynced = function (id) {
                        return localStorageService.isSyncedProductGroup(id);
                    }
                    $scope.allDelivered = function (data) {
                        var delivered = true;
                        angular.forEach(data, function (k) {
                            if ((k.is_delivered == 0) && !($localstorage.get(k.target_id, false))) {
                                delivered &= false;
                                return false;
                            }
                        });
                        return delivered;
                    }
                    $scope.addReason = function () {
                        var data = {};
                        data.route_id = $rootScope.routeId;
                        data.store_id = $rootScope.storeId;
                        data.extra_route = $rootScope.extraRoute;
                        var reason = '';
                        if ($scope.choice.id == 6) {
                            data.reason = $scope.choice.other_reason;
                        } else {
                            data.reason = $scope.reasons[$scope.choice.id]
                        }
                        Store.postNoOrderReason(data);
                        $ionicPopup.alert({
                            title: 'No Order Reason Added',
                            template: 'Successfully added the no order Reason'
                        });
                        $ionicHistory.goBack();
                    }
                    $scope.selectTabWithIndex = function(index) {
                      $ionicTabsDelegate.select(index);
                    }
                    $rootScope.$on("verify", function (evt, user) {
                      $scope.setActiveContent('verify-orders');


                    });
                })
        .controller('ProductCtrl', function ($scope, $stateParams, Routes, RoutesRegistry, $rootScope, $ionicModal, ProductService, $auth, LoaderService, $localstorage, $ionicPopup, localStorageService, $state, punch, $ionicTabsDelegate) {
            var day = $rootScope.day;
            $scope.products = ProductService.getProductsFromProductGroupId($stateParams.productGroupId);
            $rootScope.productGroupId = $stateParams.productGroupId;
            $scope.storeName = $rootScope.storeName;
            $scope.storeType = $rootScope.storeType;
            $scope.groupId = $stateParams.productGroupId;
            $scope.isEmpty = function (obj) {
                for (var i in obj)
                    if (obj.hasOwnProperty(i))
                        return false;
                return true;
            };
            $ionicModal.fromTemplateUrl('templates/add-product.html', {
                scope: $scope
            }).then(function (modal) {
                $scope.modal = modal;
            });
            $scope.$on('$destroy', function () {
                $scope.modal.remove();
            });
            $scope.addProduct = function (qty, discount, comment) {
                if(qty <= 0){
                    var alertPopup = $ionicPopup.alert({
                        title: 'Invalid Product Quantity',
                        template: 'Please make sure the quantity for the product is greater than 0. An order cannot have a zero quantity.'
                    });
                    return false;
                }
                $scope.showVerifyProductsButton = true;
                LoaderService.show();
                var data = $scope.product;
                data.route_id = $rootScope.routeId;
                data.route_name = $rootScope.routeName;
                data.store_id = $rootScope.storeId;
                data.store_name = $rootScope.storeName;
                data.sold_qty = qty;
                if (discount == undefined || discount == null)
                {
                    discount = 0;
                }
                data.discount = discount;
                data.extra_order = $rootScope.extraRoute;
                if (ProductService.setProductData(data)) {
                    $scope.product.visited = true;
                }
                LoaderService.hide();
                $scope.modal.remove();
                punch.order("Order Done");
            };
            $scope.calculateTotal = function (qty, price, discount, excise, tax) {
                if (discount == null) {
                    discount = 0;
                }
                var total = qty * price;
                var exciseAmt = ((total * excise) / 100);
                var excisedAmount = total + exciseAmt;
                var discount = ((excisedAmount * discount) / 100);
                var discountedAmount = excisedAmount - discount;
                var taxAmount = (discountedAmount * tax) / 100;
                var totalAmount = discountedAmount + taxAmount;
                $scope.discountAmt = discount;
                $scope.exciseAmt = exciseAmt;
                $scope.taxAmt = taxAmount;
                $scope.totalSum = totalAmount;
            }

            $scope.getPrice = function (product) {
                if (typeof $scope.storeType != 'undefined' && $scope.storeType.toLowerCase() == 'wholesale') {
                    product.price = product.wholesale_price;
                } else if (typeof $scope.storeType != 'undefined' && $scope.storeType.toLowerCase() == 'special') {
                    product.price = product.special_price;
                } else if (typeof $scope.storeType != 'undefined' && $scope.storeType.toLowerCase() == 'retail') {
                    product.price = product.retail_price;
                }
                return  product.price;
            }

            $scope.dispatchProduct = function (product) {
                if (typeof $scope.storeType != 'undefined' && $scope.storeType.toLowerCase() == 'wholesale') {
                    product.price = product.wholesale_price;
                } else if (typeof $scope.storeType != 'undefined' && $scope.storeType.toLowerCase() == 'special') {
                    product.price = product.special_price;
                } else if (typeof $scope.storeType != 'undefined' && $scope.storeType.toLowerCase() == 'retail') {
                    product.price = product.retail_price;
                }
                $scope.product = product;
                if (product.is_delivered == 1 || $localstorage.get(product.target_id, false)) {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Product already delivered',
                        template: 'This product has been already delivered for this store.'
                    });
                } else {
                    $ionicModal.fromTemplateUrl('templates/add-product.html', {
                        scope: $scope
                    }).then(function (modal) {
                        $scope.modal = modal;
                        $scope.modal.show();
                    });

                }
            }
            $scope.keyExists = function (id) {
                return localStorageService.productExists(id)
            }
            $scope.isUnverified = function (id) {
                return localStorageService.isUnverifiedProduct(id);
            }
            $scope.isSynced = function (id) {
                return localStorageService.isSyncedProduct(id);
            }
            $scope.verify = function () {
              alert("Basant yespachi ko load ma, yeha nera chai sab se ride side ko verify tab ma redirect huna parne, but bhaako chaina");
                $rootScope.$broadcast('verify');
                $state.go('tab.subpg', {productGroupId: $rootScope.groupId, productGroupName: $rootScope.groupName});
            }
        })
        .controller('AccountCtrl', function ($scope, $window, $auth, $state, ProductService, LoaderService, $ionicPopup, Store, localStorageService, $localstorage, $cordovaGeolocation, $rootScope, punch, Internet) {
            $rootScope.logout = function () {
                var confirmPopup = $ionicPopup.confirm({
                    title: '<strong>Logout?</strong>',
                    template: 'Sure you want to Logout?',
                    okText: 'Yes',
                    cancelText: 'Cancel'
                });

                confirmPopup.then(function (res) {
                    if (res) {
                        $localstorage.set('noOrders', []);
                        $localstorage.set('orders', []);
                        $localstorage.set('product', []);
                        $localstorage.set('products', []);
                        $localstorage.set('routes', []);
                        $localstorage.set('stores', []);
                        $localstorage.set('productGroups', []);
                        $auth.logout();
                        $rootScope.showSyncButton = $rootScope.showDownloadButton = $rootScope.showLogoutButton = $rootScope.showVerifyButton = $rootScope.showProfileChange = false;
                        $state.go('login');
                    } else {
                        // Don't close
                    }
                });
            }

            $rootScope.automaticlogout = function () {
                $localstorage.set('noOrders', []);
                $localstorage.set('orders', []);
                $localstorage.set('product', []);
                $localstorage.set('products', []);
                $localstorage.set('routes', []);
                $localstorage.set('stores', []);
                $localstorage.set('productGroups', []);
                $window.localStorage.clear();
                $auth.logout();
                $rootScope.showSyncButton = $rootScope.showDownloadButton = $rootScope.showLogoutButton = $rootScope.showVerifyButton = $rootScope.showProfileChange = false;
                $state.go('login');
            };
            $rootScope.sync = function () {
                var confirmPopup = $ionicPopup.confirm({
                    title: '<strong>Sync Data?</strong>',
                    template: 'Sure you want to send all orders for manager verification?',
                    okText: 'Yes',
                    cancelText: 'Cancel'
                });
                confirmPopup.then(function (res) {
                    if (res) {
                        punch.order("Synced Records");
                        LoaderService.show();

                        ProductService.syncData().then(function (success) {
                            ProductService.clearOrders();

                            localStorageService.setSynced();
                            LoaderService.hide();
                        }, function (error) {
                            LoaderService.hide();
                            $ionicPopup.alert({
                                title: 'Sync failed!',
                                template: 'Could not sync at this moment. Please try again later.'
                            });
                        });
                        ProductService.syncStoreAdd(function (success) {
                            ProductService.clearstores();
                            LoaderService.hide();
                        }, function (error) {
                            LoaderService.hide();
                            $ionicPopup.alert({
                                title: 'Sync failed!',
                                template: 'Could not sync at this moment. Please try again later.'
                            });
                        });
                        LoaderService.show();
                        Store.syncNoOrdersData().then(function (success) {
                            $localstorage.set('noOrders', []);
                            LoaderService.hide();
                        }, function (error) {
                            LoaderService.hide();
                            $ionicPopup.alert({
                                title: 'Sync failed!',
                                template: 'Could not sync at this moment. Please try again later.'
                            });
                        });
                        $state.go('tab.days');


                    } else {
                        // Don't close
                    }
                });
            }
            $rootScope.download = function () {
                var confirmPopup = $ionicPopup.confirm({
                    title: '<strong>Download Data?</strong>',
                    template: 'Sure you want to download your data?',
                    okText: 'Yes',
                    cancelText: 'Cancel'
                });
                confirmPopup.then(function (res) {
                    if (res) {
                        if (Internet.isConnected() == true)
                        {
                            //
                            LoaderService.show();
                            ProductService.downloadallData(function (success) {

                            }, function (error) {
                                LoaderService.hide();
                                $ionicPopup.alert({
                                    title: 'Download failed!',
                                    template: 'An error occured while download datas. Please make sure you are connected to the internet.'
                                });
                            });
                            punch.order("Download Records");

                        } else {
                            $ionicPopup.alert({
                                title: 'Connection failed!',
                                template: 'Please make sure you are connected to the internet.'
                            });
                        }

                    } else {
                        // Don't close
                    }
                });
            }
        })
        .controller('TargetCtrl', function ($scope, Target, LoaderService) {
            LoaderService.show;
            $scope.today = Date.now();
            Target.get().then(function (result) {
                result.unsyncedOrder = Target.getUnSyncedTarget();
                $scope.orders = result;
            });
            Target.getCoverageReport().then(function (result) {
                $scope.covereage = result;
                LoaderService.hide();
            });
        })
        .controller('TargetHistoryCtrl', function ($scope, TargetHistory, Routes, LoaderService) {
            LoaderService.show();
            TargetHistory.get().then(function (result) {
                $scope.data = result;
                LoaderService.hide();
            });
            $scope.toggleGroup = function (group) {
                if ($scope.isGroupShown(group)) {
                    $scope.shownGroup = null;
                } else {
                    $scope.shownGroup = group;
                }
            };
            $scope.isGroupShown = function (group) {
                return $scope.shownGroup === group;
            };
        })
        .controller('OrdersCtrl', function ($scope, Orders, Routes, LoaderService) {
            LoaderService.show();
            Orders.getOrders().then(function (val) {
                LoaderService.hide();
                $scope.todaysOrders = val.filter(function (e) {
                    return e;
                });
                ;
            }, function (err) {
                LoaderService.hide();
                console.log(err)
            });
        })
        .controller('ProfileCtrl', function ($scope, $rootScope, LoaderService, config, $ionicPopup, $auth, $http, $ionicHistory) {
            $scope.data = {};
            $scope.data.new_password = "";
            $scope.data.repassword = "";
            $scope.changepassword = function () {
                if ($scope.data.new_password != $scope.data.repassword)
                {
                    var alertPopup = $ionicPopup.alert({
                        title: 'Password Change Error!',
                        template: 'Password donot match'
                    });
                } else {
                    var details = {};
                    details.password = $scope.data.new_password;
                    LoaderService.show();
                    var configs = {};
                    configs.headers = configs.headers || {};
                    configs.headers.Authorization = 'Bearer ' + $auth.getToken();
                    config.get().then(function (result) {
                        $http.post(result.baseUrl + "/update-password", details, configs)
                                .success(function (data, status, headers, config) {
                                    LoaderService.hide();
                                    var alertPopup = $ionicPopup.alert({
                                        title: 'Success',
                                        template: 'Password changed successfully'
                                    });
                                    $ionicHistory.goBack();
                                })
                                .error(function (data, status, headers, config) {
                                    LoaderService.hide();
                                    var alertPopup = $ionicPopup.alert({
                                        title: 'Error!',
                                        template: 'Password cannot changed '
                                    });
                                    $ionicHistory.goBack();
                                });
                    });

                }
            }
        })
        .controller('OrderVerifiedNotVerifiedCtrl', function ($scope, OrderStatus, Routes, LoaderService) {
            LoaderService.show();
            OrderStatus.get().then(function (result) {
                $scope.data = result;
                LoaderService.hide();
            });
            $scope.toggleGroup = function (group) {
                if ($scope.isGroupShown(group)) {
                    $scope.shownGroup = null;
                } else {
                    $scope.shownGroup = group;
                }
            };
            $scope.isGroupShown = function (group) {
                return $scope.shownGroup === group;
            };
        })
        .controller('LoginCtrl',
                function ($scope, LoginService, $window, $localstorage, Internet, $ionicPopup, $state, $auth, LoaderService,
                        SatellizerConfig, config, $location, $http, checkimei, $cordovaGeolocation, $ionicSideMenuDelegate, $ionicHistory, getMap, $rootScope, ProductService) {
                    var posOptions = {timeout: 10000, enableHighAccuracy: false};
                    config.get().then(function (result) {
                        SatellizerConfig.baseUrl = result.baseUrl;
                        SatellizerConfig.loginUrl = '/authenticate';
                        $scope.data = {};
                        if ($auth.isAuthenticated()) {
                            $rootScope.showSyncButton = $rootScope.showDownloadButton = $rootScope.showLogoutButton = $rootScope.showVerifyButton = $rootScope.showProfileChange = true;
                            $cordovaGeolocation
                                    .getCurrentPosition(posOptions)
                                    .then(function (position) {
                                        getMap.trackGPS();
                                        $state.go('tab.days');
                                        var date = new Date();
                                        var yyyy = date.getFullYear().toString();
                                        var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
                                        var dd = date.getDate().toString();
                                        var fulldate = yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]);

                                        var getdate = $localstorage.get("currentdate");
                                        if (getdate == undefined || getdate == null)
                                        {
                                            $localstorage.set("currentdate", fulldate);
                                        } else {
                                            if (getdate != fulldate)
                                            {
                                              $window.localStorage.clear();
                                              $auth.logout();
                                              $rootScope.showSyncButton = $rootScope.showDownloadButton = $rootScope.showLogoutButton = $rootScope.showVerifyButton = $rootScope.showProfileChange = false;
                                              $state.go('login', {}, {reload: true});
                                              $state.go('login');
                                              $rootScope.automaticlogout();
                                              $state.go('login');
                                            }
                                        }

                                    }, function (err) {
                                        $rootScope.showSyncButton = $rootScope.showDownloadButton = $rootScope.showLogoutButton = $rootScope.showVerifyButton = false;
                                        console.log(err);
                                        var alertPopup = $ionicPopup.alert({
                                            title: 'Login failed!',
                                            template: 'please enable gps on your device!'
                                        });
                                        LoaderService.hide();
                                    });
                        }
                        $scope.login = function () {
                            LoaderService.show();
                            if (Internet.isConnected() == true)
                            {
                                $cordovaGeolocation
                                        .getCurrentPosition(posOptions)
                                        .then(function (position) {
                                            $ionicHistory.nextViewOptions({
                                                disableBack: true,
                                                disableAnimate: true,
                                                historyRoot: true
                                            });
                                            $ionicHistory.clearCache();
                                            $ionicHistory.clearHistory();
                                            $ionicSideMenuDelegate.toggleLeft();
                                            var credentials = {
                                                username: $scope.data.username,
                                                password: $scope.data.password
                                            }

                                            $auth.login(credentials).then(function (data) {
                                                if (result.imei_check == true)
                                                {
                                                    $scope.deviceID = device.uuid;
                                                    console.log($scope.deviceID);
                                                    // $scope.deviceID = 'a2db7ce7e735d284';
                                                    var $token = $auth.getToken();
                                                    $http.get(result.baseUrl + "/get-imeino?token=" + $token).success(function (data, status, headers, config) {
                                                        console.log(data.imeino);
                                                        var imeiarray = data.imeino.split(',');

                                                        $scope.ismatch = false;
                                                        console.log("Before check");
                                                        checkimei.check(imeiarray).then(function (result) {
                                                            console.log('Return result : ' + result);
                                                            if (result === "notsame")
                                                            {
                                                                $window.localStorage.clear();
                                                                $auth.logout();
                                                                $rootScope.showSyncButton = $rootScope.showDownloadButton = $rootScope.showLogoutButton = $rootScope.showVerifyButton = $rootScope.showProfileChange = false;
                                                                $state.go('login', {}, {reload: true});
                                                                var alertPopup = $ionicPopup.alert({
                                                                    title: 'Login failed!',
                                                                    template: 'Your Device Id :' + $scope.deviceID + ' is not registered .'
                                                                });
                                                                $state.go('login');
                                                                $rootScope.automaticlogout();
                                                            } else {
                                                                ProductService.downloadallData(function (success) {
                                                                });
                                                                $rootScope.showSyncButton = $rootScope.showDownloadButton = $rootScope.showDownloadButton = $rootScope.showLogoutButton = $rootScope.showVerifyButton = $rootScope.showProfileChange = true;
                                                            }

                                                        });

                                                    });
                                                } else {
                                                    ProductService.downloadallData(function (success) {
                                                    });
                                                    $rootScope.showSyncButton = $rootScope.showDownloadButton = $rootScope.showDownloadButton = $rootScope.showLogoutButton = $rootScope.showVerifyButton = $rootScope.showProfileChange = true;

                                                }

                                                LoaderService.hide();
                                                getMap.trackGPS();
                                                $state.go('tab.days');
                                                var date = new Date();
                                                var yyyy = date.getFullYear().toString();
                                                var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
                                                var dd = date.getDate().toString();
                                                var fulldate = yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]);

                                                var getdate = $localstorage.get("currentdate");
                                                if (getdate == undefined || getdate == null)
                                                {
                                                    $localstorage.set("currentdate", fulldate);
                                                } else {
                                                    if (getdate != fulldate)
                                                    {
                                                        $window.localStorage.clear();
                                                    }
                                                }
                                            })
                                                    .catch(function (response) {
                                                        $rootScope.showSyncButton = $rootScope.showDownloadButton = $rootScope.showLogoutButton = $rootScope.showVerifyButton = $rootScope.showProfileChange = false;
                                                        LoaderService.hide();
                                                        var alertPopup = $ionicPopup.alert({
                                                            title: 'Login failed!',
                                                            template: 'Login username or password do not match. Check your credentials.'
                                                        });
                                                    });
                                        }, function (err) {
                                            $rootScope.showSyncButton = $rootScope.showDownloadButton = $rootScope.showLogoutButton = $rootScope.showVerifyButton = $rootScope.showProfileChange = false;
                                            console.log(err);
                                            var alertPopup = $ionicPopup.alert({
                                                title: 'Login failed!',
                                                template: 'please enable gps on your device!'
                                            });
                                            LoaderService.hide();
                                        });
                            } else {
                                var alertPopup = $ionicPopup.alert({
                                    title: 'Login failed!',
                                    template: 'No Internet Connection'
                                });
                                LoaderService.hide();
                            }


                        }
                    });
                });


