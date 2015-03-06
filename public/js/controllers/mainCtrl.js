angular.module('expenseManagerController', [])

  // inject the service factory into our controller
  .controller('mainController', ['$scope','$http','ExpenseOps', 'FriendOps', 'CurrencyConverter', function($scope, $http, ExpenseOps, FriendOps, CurrencyConverter) {

    $scope.errorMsg = "";

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

    $scope.friendName = "";
    $scope.friends = ['Select Friend'];
    $scope.selectedFriend = $scope.friends[0];

    $scope.paymentTypes = ['Payment Type', 'Credit Card', 'Debit Card', 'Cash'];
    $scope.selectedPaymentType=$scope.paymentTypes[0];

    $scope.currencyTypes = ['Currency Type', 'Rupees', 'Dollar', 'Euros'];
    $scope.selectedCurrencyType = $scope.currencyTypes[0];

    $scope.currencyFilterTypes = ['Rupees', 'Dollar', 'Euros'];
    $scope.currencyFilter = $scope.currencyFilterTypes[0];

    $scope.expenditure=0;

    $scope.expenses = [];

    function isNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

    $scope.addExpense = function() {

      if($scope.selectedPaymentType === $scope.paymentTypes[0]) {
        $scope.errorMsg = "Please select a payment type";
        return;
      }

      if($scope.selectedCurrencyType === $scope.currencyTypes[0]) {
        $scope.errorMsg = "Please select a currency type";
        return;
      }

      if($scope.selectedFriend === $scope.friends[0]) {
        $scope.errorMsg = "Please select a friend";
        return;
      }

      if(!isNumber($scope.expenditure)) {
        $scope.errorMsg = "Please enter a valid amount";
        return;
      }

      $scope.errorMsg = "";

      var expenseObj = {

        paymentType : $scope.selectedPaymentType,
        friendName : $scope.selectedFriend,
        dateTime : $scope.dt,
        date : $scope.dt.getDate() + "-" + ($scope.dt.getMonth()+1) + "-" + $scope.dt.getFullYear(),
        currencyType : $scope.selectedCurrencyType,
        amount : $scope.expenditure
      };

      $scope.createExpense(expenseObj);

      //Make default
      $scope.selectedPaymentType = $scope.paymentTypes[0];
      $scope.selectedCurrencyType = $scope.currencyTypes[0];
      $scope.selectedFriend = $scope.friends[0];
      $scope.dt = new Date();
      $scope.expenditure = 0;

    };

    $scope.addFriend = function() {

      $scope.friendName = $scope.friendName.trim().toLowerCase();

      if($scope.friendName && ($scope.friends.indexOf($scope.friendName) == -1)){
        $scope.friends.push($scope.friendName);
        $scope.errorMsg = "";
        $scope.createFriend({name:$scope.friendName});
      } else {
        $scope.errorMsg = "Invalid name";
      }
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
        $scope.friends = ['Select Friend'];
        for(var iter=0; iter<data.length; iter++){
          $scope.friends.push(data[iter].name);
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

    $scope.createFriend = function(data) {

        $scope.loading = true;

        // call the create function from our service (returns a promise object)
        FriendOps.create(data)

          .success(function(data) {
            $scope.loading = false;
            $scope.friendName = '';
            $scope.friends = ['Select Friend'];
            for(var iter=0; iter<data.length; iter++){
              $scope.friends.push(data[iter].name);
            }
          });
    };

    $scope.createExpense = function(data) {

        $scope.loading = true;

        // call the create function from our service (returns a promise object)
        ExpenseOps.create(data)

          .success(function(dataList) {
            $scope.loading = false;
            $scope.expenses = dataList;
            calConvertedAmount(dataList);
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
        });
    };

  }]);