angular.module('expenseManagerService', [])

  // super simple service
  // each function returns a promise object
  .factory('ExpenseOps', ['$http',function($http) {
    return {
      get : function() {
        return $http.get('/api/expenses');
      },
      create : function(expenseData) {
        return $http.post('/api/expenses', expenseData);
      },
      edit : function(expenseData) {
        return $http.put('/api/expenses', expenseData);
      },
      delete : function(id) {
        return $http.delete('/api/expenses/' + id);
      }
    }
  }])

  .factory('FriendOps', ['$http',function($http) {
    return {
      get : function() {
        return $http.get('/api/friends');
      },
      create : function(friendData) {
        return $http.post('/api/friends', friendData);
      }
    }
  }])

  // currency converter service
  .factory('CurrencyConverter', function(){
    return function(amount, currencyType, convertToCurrency) {

      var conversionData = {
        dollarToRupees : 62.72,
        dollarToEuros : 0.92,
        eurosToRupees : 68.15
      };
      var convertedAmount;

      switch(currencyType) {
        case 'Rupees':
          if(convertToCurrency==='Dollar'){
            convertedAmount = amount/conversionData.dollarToRupees;
            convertedAmount = convertedAmount.toFixed(2);
          } else if(convertToCurrency==='Euros'){
            convertedAmount = amount/conversionData.eurosToRupees;
            convertedAmount = convertedAmount.toFixed(2);
          }
          break;
        case 'Dollar':
          if(convertToCurrency==='Rupees'){
            convertedAmount = amount*conversionData.dollarToRupees;
            convertedAmount = convertedAmount.toFixed(2);
          } else if(convertToCurrency==='Euros'){
            convertedAmount = amount*conversionData.dollarToEuros;
            convertedAmount = convertedAmount.toFixed(2);
          }
          break;
        case 'Euros':
          if(convertToCurrency==='Dollar'){
            convertedAmount = amount/conversionData.dollarToEuros;
            convertedAmount = convertedAmount.toFixed(2);
          } else if(convertToCurrency==='Rupees'){
            convertedAmount = amount*conversionData.eurosToRupees;
            convertedAmount = convertedAmount.toFixed(2);
          }
          break;
      }

      return convertedAmount;
    }
  });