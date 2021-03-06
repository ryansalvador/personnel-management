var app = angular.module('personnelManagement', ['ui.router']);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl'
    });

/*    
  $stateProvider
    .state('list', {
      url: '/list/all',
      templateUrl: '/list.html',
      controller: 'ListCtrl',
      resolve: {
        postPromise: ['personnelFactory', function(personnelFactory){
            return personnelFactory.getAll();
        }]
        }
    });    
*/

  $stateProvider
    .state('list', {
      url: '/list/{filter}',
      templateUrl: '/list.html',
      controller: 'ListCtrl',
      resolve: {
        promiseObj: ['$stateParams', 'personnelFactory', function($stateParams, personnelFactory){
            return personnelFactory.getFilter($stateParams.filter.toUpperCase());
        }]
        }
    });    

  $stateProvider
    .state('about', {
      url: '/about',
      templateUrl: '/about.html',
      controller: 'AboutCtrl'
    });
    
  $stateProvider
    .state('create', {
      url: '/create',
      templateUrl: '/create.html',
      controller: 'CreateCtrl'
    });
    
  $stateProvider
    .state('view', {
      url: '/view/{id}',
      templateUrl: '/view.html',
      controller: 'ViewCtrl',
      resolve: {
            promiseObj: ['$stateParams', 'personnelFactory', function($stateParams, personnelFactory) {
                return personnelFactory.get($stateParams.id);
            }]
      }
    });
    
  $stateProvider
    .state('record', {
      url: '/view/{id}/record',
      templateUrl: '/record.html',
      controller: 'RecordCtrl',
      resolve: {
            promiseObj: ['$stateParams', 'personnelFactory', function($stateParams, personnelFactory) {
                return personnelFactory.getRecord($stateParams.id);
            }]
      }      
    });    
    
  $urlRouterProvider.otherwise('home');
}]);

app.factory('personnelFactory', ['$http', function($http){
    
        
    var o = {
        personnelFactory: []
    };
    
    o.getAll = function() {
        return $http.get('/list').success(function(data){
          angular.copy(data, o.personnelFactory);
        });
    };
    
    o.getFilter = function(filter) {
        return $http.get('/list/' + filter).success(function(data){
          angular.copy(data, o.personnelFactory);
        });
    };
    
    o.get = function(id) {
      return $http.get('/view/' + id).then(function(res){
        return res.data;
      });
    };
    
    o.create = function(person) {
    //    console.log('from create ' + person.firstName);
        return $http.post('/add', person).success(function(data){
    //        o.personnelFactory.push(data);
              console.log("Record Added.");
        });
    };
    
    o.update = function(person) {
    //  console.log('from update ' + person.firstName);
    //  pass person as paramater so index.js can access req.body variables
        return $http.put('/view/' + person._id + '/update', person)
    .success(function(data){
    //  person.firstName = "Updated!!!";
        console.log("Record Updated.");
    });
    };

    o.delete = function(person) {
    //  console.log('from delete ' + person.firstName);
        return $http.delete('/view/' + person._id + '/delete')
    .success(function(data){
        console.log("Record Deleted.");
    });
    };
    
    /* Test Data
    
    o.personnelFactory = [
        {firstName: "Ryan", 
        middleName: "Palacios", 
        lastName: "Salvador", 
        birthdate: "09/08/1983", 
        gender: "Male", 
        maritalStatus: "Married", 
        occupation: "Software Dev", 
        contactNumber: "09175138559"
        },
        {firstName: "Jay Alfred", 
        middleName: "Salazar", 
        lastName: "Montemayor", 
        birthdate: "10/20/1983", 
        gender: "Male", 
        maritalStatus: "Married", 
        occupation: "Tester", 
        contactNumber: "09159479110"
        }
    ]
    */

    o.getRecord = function(id) {
      return $http.get('/view/' + id +'/record').then(function(res){
        return res.data;
      });
    };

    o.addRecord = function(id, record) {
      return $http.post('/view/' + id + '/record/add', record);
    };

    o.deleteRecord = function(record) {
      return $http.delete('/view/' + record._id + '/record/delete')    
     .success(function(data){
        console.log("Record Log Deleted.");
    });
    
    };

  return o;
}]);

app.controller('MainCtrl', ['$scope', 'personnelFactory', function($scope, personnelFactory){
  $scope.appTitle = 'Project Small Potato';
    
  $scope.personnel = personnelFactory.personnelFactory;
    
}]);

app.controller('ListCtrl', ['$scope', 'personnelFactory', function($scope, personnelFactory){
   
  $scope.personnel = personnelFactory.personnelFactory;
    
}]);

app.controller('AboutCtrl', ['$scope', function($scope){
  $scope.pageHeader = 'So Say Good Night To The Bad Guy!';
}]);

app.controller('CreateCtrl', ['$scope', '$location', 'personnelFactory', function($scope, $location, personnelFactory) {
  $scope.pageHeader = 'Add Patient';
    
    $scope.personnel = personnelFactory.personnelFactory;
    
    $scope.addSuccess = 0;
    
    $scope.addPatient = function(){
      personnelFactory.create({
          firstName: $scope.firstName, 
          middleName: $scope.middleName, 
          //Convert Last Name to Uppercase
          lastName: $scope.lastName.toUpperCase(), 
          birthdate: $scope.birthdate, 
          address: $scope.address,
          gender: $scope.gender, 
          maritalStatus: $scope.maritalStatus, 
          occupation: $scope.occupation, 
          contactNumber: $scope.contactNumber,           
          referredBy: $scope.referredBy
      });        
        
      $scope.firstName = "";
      $scope.middleName = "";
      $scope.lastName = "";
      $scope.birthdate = "";
      $scope.address = "";      
      $scope.gender = "";
      $scope.maritalStatus = "";
      $scope.occupation = "";
      $scope.contactNumber = "";
      $scope.referredBy = "";
      
      $location.path('/home');
      
      $scope.addSuccess = 1;
    };
}]);

app.controller('ViewCtrl', ['$scope', 'personnelFactory', 'promiseObj', function($scope, personnelFactory, promiseObj) {
    
    var person = promiseObj;
    
    $scope.pageHeader = 'View Patient Details';
    
    $scope.personnelFactory = personnelFactory;
    
    $scope.person = person;
    
    $scope.updateSuccess = 0;
    $scope.deleteSuccess = 0;
    
    $scope.updatePerson = function(person){ 
      
      personnelFactory.update(person);        

      $scope.updateSuccess = 1;
    };
      
    $scope.deletePerson = function(person){ 
      $scope.person.firstName = "";
      $scope.person.middleName = "";
      $scope.person.lastName = "";
      $scope.person.address = "";
      $scope.person.birthdate = "";
      $scope.person.gender = "";
      $scope.person.maritalStatus = "";
      $scope.person.occupation = "";
      $scope.person.contactNumber = "";
      $scope.person.referredBy = "";
      
      personnelFactory.delete(person);        
    
      $scope.deleteSuccess = 1;
          
    };      
      
}]);

app.controller('RecordCtrl', ['$scope', 'personnelFactory', 'promiseObj', function($scope, personnelFactory, promiseObj){
  $scope.pageHeader = 'Record Details';
  
  $scope.person = promiseObj;
  
  $scope.addRecord = function () {
    personnelFactory.addRecord($scope.person._id, {
        date: $scope.date,
        nameOfLab: $scope.nameOfLab,
        weight: $scope.weight,
        bp: $scope.bp,
        hr: $scope.hr,
        hemoglobin: $scope.hemoglobin,
        hematocrift: $scope.hematocrift,
        rbc: $scope.rbc,
        wbc: $scope.wbc,
        neutrophils: $scope.neutrophils,
        lymphocytesMonocytes: $scope.lymphocytesMonocytes,
        basophils: $scope.basophils,
        eosinophils: $scope.eosinophils,
        fbs: $scope.fbs,
        rbs: $scope.rbs,
        hba1c: $scope.hba1c,
        bun: $scope.bun,
        creatinine: $scope.creatinine,
        oneScr: $scope.oneScr,
        egfr: $scope.egfr,
        na: $scope.na,
        k: $scope.k,
        cl: $scope.cl,
        albumin: $scope.albumin,
        globulin: $scope.globulin,
        uricAcid: $scope.uricAcid,
        totalCholesterolTriglyceride: $scope.totalCholesterolTriglyceride,
        hdl: $scope.hdl,
        ldl: $scope.ldl,
        psa: $scope.psa,
        sgot: $scope.sgot
    }).success(function(record) {
        $scope.person.records.push(record);
    });
  };
  
  $scope.deleteRecord = function(record){ 
      
      personnelFactory.deleteRecord(record).success(function(data){
            $scope.person.records.splice(record._id, 1);        
    });    
    };      
 
}]);