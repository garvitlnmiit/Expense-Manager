angular.module('expenseManagerController', [])

  // inject the service factory into our controller
  .controller('mainController', ['$scope','$http', '$location', '$anchorScroll', 'ExpenseOps', 'FriendOps', 'CurrencyConverter', 'AlertSrv', 'IsNumberSrv', function($scope, $http, $location, $anchorScroll, ExpenseOps, FriendOps, CurrencyConverter, AlertSrv, IsNumberSrv) {

    var editExpenseId;

    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    $scope.alerts = [];

    $scope.multiSelectData = [];

    $scope.multiSelectModel = [];

    $scope.multiSelectSettings = {
      scrollableHeight: '100px',
      scrollable: true,
      enableSearch: true
    };

    $scope.addEditExpenseIdc = "Add Expense";

    $scope.formData = {};
    $scope.loading = true;
    $scope.editable=[];

    $scope.format = 'dd-MMMM-yyyy';
    $scope.dt = new Date();
    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };

    $scope.open = function($event) {
      $event.preventDefault();
      $event.stopPropagation();

      $scope.opened = true;
    };

    $scope.onAlertClose = function() {
      $scope.alerts = AlertSrv.removeAlert($scope.alerts);
    }

    $scope.paymentTypes = ['Payment Type', 'Credit Card', 'Debit Card', 'Cash'];
    $scope.selectedPaymentType=$scope.paymentTypes[0];

    $scope.currencyTypes = ['Currency Type', 'Rupees', 'Dollar', 'Euros'];
    $scope.selectedCurrencyType = $scope.currencyTypes[0];

    $scope.currencyFilterTypes = ['Rupees', 'Dollar', 'Euros'];
    $scope.currencyFilter = $scope.currencyFilterTypes[0];

    $scope.expenditure=0;

    $scope.expenses = [];

    function makeDefault() {
      $scope.selectedPaymentType = $scope.paymentTypes[0];
      $scope.selectedCurrencyType = $scope.currencyTypes[0];
      $scope.multiSelectModel = [];
      $scope.dt = new Date();
      $scope.expenditure = 0;
    };

    function isValidInput() {
      console.log($scope.alerts);
      if($scope.selectedPaymentType === $scope.paymentTypes[0]) {
        $scope.alerts = AlertSrv.addAlert('alert-danger', 'Please select a payment type', $scope.alerts);
        return -1;
      }

      if($scope.selectedCurrencyType === $scope.currencyTypes[0]) {
        $scope.alerts = AlertSrv.addAlert('alert-danger', 'Please select a currency type', $scope.alerts);
        return -1;
      }

      if(!$scope.multiSelectModel.length) {
        $scope.alerts = AlertSrv.addAlert('alert-danger', 'Please select a friend', $scope.alerts);
        return -1;
      }

      if(!IsNumberSrv($scope.expenditure)) {
        $scope.alerts = AlertSrv.addAlert('alert-danger', 'Please enter a valid amount', $scope.alerts);
        return -1;
      }

      return 0;
    };

    //Add or Edit expense
    $scope.onAddEditExpense = function() {
      if($scope.addEditExpenseIdc === "Add Expense"){
        $scope.onAddExpense();
      }else{
        $scope.onUpdateExpense();
      }
    };

    //Add expense
    $scope.onAddExpense = function() {

      if(isValidInput()==-1){
        return;
      }

      var selectedFriends = $scope.multiSelectModel;

      var expenseObj = {

        paymentType : $scope.selectedPaymentType,
        friendName : selectedFriends,
        dateTime : $scope.dt,
        date : $scope.dt.getDate() + "-" + months[$scope.dt.getMonth()] + "-" + $scope.dt.getFullYear(),
        currencyType : $scope.selectedCurrencyType,
        amount : $scope.expenditure
      };

      createExpense(expenseObj);
    };

    //Update expense
    $scope.onUpdateExpense = function() {

      if(isValidInput()==-1){
        return;
      }

      var dateObj = new Date($scope.dt);

      var expenseObj = {

        paymentType : $scope.selectedPaymentType,
        friendName : $scope.multiSelectModel,
        dateTime : dateObj,
        date : dateObj.getDate() + "-" + (dateObj.getMonth()+1) + "-" + dateObj.getFullYear(),
        currencyType : $scope.selectedCurrencyType,
        amount : $scope.expenditure
      };

      updateExpense(expenseObj);
    };

    $scope.onEditCancel = function() {
      $scope.addEditExpenseIdc = "Add Expense";
      makeDefault();
    };

    // To edit an expense
    $scope.onEditClick = function(id) {

      var foundFlag = false;
      var expenseObj;

      for(iter=0; iter<$scope.expenses.length; iter++){
        if($scope.expenses[iter]._id === id){
          expenseObj = $scope.expenses[iter];
          foundFlag = true;
          editExpenseId = id;
          break;
        }
      }

      if(foundFlag){
        $scope.selectedPaymentType = expenseObj.paymentType;
        $scope.multiSelectModel = [];
        $scope.dt = expenseObj.dateTime;
        $scope.selectedCurrencyType = expenseObj.currencyType;
        $scope.expenditure = expenseObj.amount;

        for(var iter=0; iter<expenseObj.friendName.length; iter++) {
          $scope.multiSelectModel.push(expenseObj.friendName[iter]);
        }

        $scope.addEditExpenseIdc = "Update Expense";

        $location.hash('top');
        $anchorScroll();
      }
    };


    $scope.addFriend = function() {

      var found = false;

      $scope.friendName = $scope.friendName.trim().toLowerCase();

      if(!$scope.friendName) {
        $scope.alerts = AlertSrv.addAlert('alert-danger', 'Please enter a valid name', $scope.alerts);
        return;
      }

      for(var iter=0; iter<$scope.multiSelectData.length; iter++) {
        if($scope.multiSelectData[iter]['label'] === $scope.friendName) {
          found=true;
          break;
        }
      }

      if(found) {
        $scope.alerts = AlertSrv.addAlert('alert-danger', 'Duplicate names are not allowed', $scope.alerts);
        return;
      }
      createFriend({name:$scope.friendName});
    };

    //Watching currency filter
    $scope.$watch(
      function(scope) {return scope.currencyFilter},
      function(newCurrType, oldCurrType) {
        for(var iter=0; iter<$scope.expenses.length; iter++) {
          if(newCurrType!==$scope.expenses[iter].currencyType){
            $scope.expenses[iter].convertedAmount = CurrencyConverter($scope.expenses[iter].amount, $scope.expenses[iter].currencyType, newCurrType);
          }else{
            $scope.expenses[iter].convertedAmount = $scope.expenses[iter].amount;
          }
        }
      }
    );

    function calConvertedAmount(data) {
      for(var iter=0; iter<data.length; iter++){
        if($scope.currencyFilter!==$scope.expenses[iter].currencyType){
          $scope.expenses[iter].convertedAmount = CurrencyConverter($scope.expenses[iter].amount, $scope.expenses[iter].currencyType, $scope.currencyFilter);
        }else {
          $scope.expenses[iter].convertedAmount = $scope.expenses[iter].amount;
        }
      }
    };

    // GET =====================================================================

    FriendOps.get()
      .success(function(data) {
        //alert(data);
        var obj={};
        $scope.multiSelectData = [];
        for(var iter=0; iter<data.length; iter++){
          obj = {
            id:data[iter]['_id'],
            label:data[iter]['name']
          };
          $scope.multiSelectData[iter] = obj;
        }
        $scope.loading = false;
      });

    ExpenseOps.get()
      .success(function(data) {
        //alert(data);
        $scope.expenses = data;
        $scope.loading = false;
        calConvertedAmount(data);
      });

    // CREATE ==================================================================

    var createFriend = function(data) {

        $scope.loading = true;

        // call the create function from our service (returns a promise object)
        FriendOps.create(data)

          .success(function(data) {
            $scope.loading = false;
            var obj={};
            $scope.multiSelectData = [];

            for(var iter=0; iter<data.length; iter++){
              obj = {
                id:data[iter]['_id'],
                label:data[iter]['name']
              };
              $scope.multiSelectData[iter]=obj;
            }
            $scope.alerts = AlertSrv.addAlert('alert-success', 'Friend added', $scope.alerts);
          });
    };

    var createExpense = function(data) {

        $scope.loading = true;

        // call the create function from our service (returns a promise object)
        ExpenseOps.create(data)

          .success(function(dataList) {
            $scope.loading = false;
            $scope.expenses = dataList;
            calConvertedAmount(dataList);

            $scope.alerts = AlertSrv.addAlert('alert-success', 'Expense added', $scope.alerts);
            makeDefault();
          });

    };


    // DELETE ==================================================================
    // delete an expense
    $scope.deleteExpense = function(id) {
      $scope.loading = true;

      ExpenseOps.delete(id)
        // if successful creation, call our get function to get all the new expenses
        .success(function(data) {
          $scope.loading = false;
          $scope.expenses = data; // assign our new list of expenses
          calConvertedAmount(data);

          $scope.alerts = AlertSrv.addAlert('alert-success', 'Expense deleted', $scope.alerts);
        });
    };

    // EDIT ==================================================================
    // edit an expense
    var updateExpense = function(expenseObj) {
      $scope.loading = true;

      ExpenseOps.edit(editExpenseId, expenseObj)

        .success(function(dataList) {
          $scope.loading = false;
          $scope.expenses = dataList;
          calConvertedAmount(dataList);

          $scope.addEditExpenseIdc = "Add Expense";

          $scope.alerts = AlertSrv.addAlert('alert-success', 'Expense updated', $scope.alerts);

          makeDefault();
        });
    };

  }]);