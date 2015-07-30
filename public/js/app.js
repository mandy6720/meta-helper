var app = angular.module("scheduleApp", ['ui.calendar', 'ngRoute'])

var clientList;
var appointmentsArr = [];

//Sets up routes to the different views
app.config(function ($routeProvider) {
	$routeProvider
		.when('/dashboard',
			{
				controller: 'CalendarController',
				templateUrl: '../templates/dashboard.html'
			})
		.when('/calendar', 
			{
				controller: 'CalendarController',
				templateUrl: '../templates/calendar.html'
			})
		.when('/clients',
			{
				controller: 'ClientController',
				templateUrl: '../templates/clients.html'
			})
		.when('/calls', 
			{
				controller: 'CallsController',
				templateUrl: '../templates/calls.html'
			})
		.otherwise({ redirectTo: '/dashboard'})
});


// Client Controller
app.controller("ClientController", function($scope, $http){

	// Header stuff for user auth
	$http.defaults.headers.get = { 'Authorization' : 'VALUE_THAT_SHOULDNT_BE_HARDCODED_BUT_IS_RIGHT_NOW' }

	// Header stuff for user auth
	$http.defaults.headers.post = { 'Authorization' : 'VALUE_THAT_SHOULDNT_BE_HARDCODED_BUT_IS_RIGHT_NOW' }


	// GET request that populates the client list
	$http.get('http://bookmefish.herokuapp.com/clients.json').
	  success(function(data) {
	    $scope.clients = data.clients;
	    clientList = data.clients;
	  }).
	  error(function(data) {
	    console.log("error", data)
	  });

	  $scope.currentClient;
	  $scope.activeClient;
	  $scope.clientNotes;


	  $scope.updateClient = function(activeClient) {
	  	$scope.currentClient = activeClient;
	  	console.log($scope.currentClient)
	  	
	  	// Send note info to the server

	  	/*
	  	$http.post('http://bookmefish.herokuapp.com/client', {
	  		client: { 
	  			first_name: , 
	  			last_name:, 
	  			address:, 
	  			zip:, 
	  			display_phone:, 
	  			county:, 
	  			family_size:, 
	  			account_number:, 
	  			email: 
	  		}
	  	}).success(function(data){
	  		console.log("client added")
	  	}).error(function(data){
	  		console.log("error! client didn't post", data)
	  	})
	  	$scope.currentClient.notes.push({info: newNote});

	  	*/
	  }

	  $scope.searchClients = function(newVM) {

	  	var person = [];

	  	$http.get('http://bookmefish.herokuapp.com/clients/search?q=' + newVM.first_name + " " + newVM.last_name + " " + newVM.display_phone).
	  		success(function(data) {

	  			person = data;

	  			// if found, use their ID
	  			if (person.length > 0) {
	  				console.log(person[0].id)

	  				$http.post('http://bookmefish.herokuapp.com/voicemails', {
	  					voicemail: {
	  						client_id: person[0].id
	  					}
	  				}).success(function(data) {
	  					console.log("yay! it worked!");
	  				}).
	  				error(function(data){
	  					console.log("error!", data)
	  				})
	  			} else {
	  				
	  				// if not found, create a person

	  				$http.post('http://bookmefish.herokuapp.com/clients', {
	  					client: { 
	  						first_name: newVM.first_name, 
	  						last_name: newVM.last_name, 
	  						display_phone: newVM.display_phone
	  					}
	  				}).
	  				success(function(data){
	  					console.log("success! new client sent", data);
	  					// Add voicemail
	  					$http.post('http://bookmefish.herokuapp.com/voicemails', {
	  						voicemail: { 
	  							client_id: data.id
	  						}
	  					})
	  					// go to notes page
	  					$.modal.close();
	  					
	  				}).
	  				error(function(data){
	  					console.log("error! didn't post", data)
	  				})

	  			}

	  		}).
	  		error(function(data) {
	  			console.log("error", data)
	  		})


	   }

	   	$scope.toggleEditNoteMode = function(activeClient) {
		  	$scope.activeClient = activeClient;
		  	$scope.clientNotes = $scope.activeClient.notes;
		  	$('#edit-note').modal();
	  }


	  $scope.addNewNote = function(activeClient) {
	  	$scope.currentClient = activeClient;
	  	var newNote = $("#new-note").val();
	  	// Send note info to the server
	  	$http.post('http://bookmefish.herokuapp.com/voicemails/' + $scope.currentClient.id + "/notes", {
	  		note: {
		  		info: newNote
	  		}
	  	}).success(function(data){
	  		console.log("note added", data)
	  	}).error(function(data){
	  		console.log("error! note didn't post", data)
	  	})
	  	$scope.currentClient.notes.push({info: newNote});
	  }

})

app.controller("CalendarController", function($scope, $http) {

	// Header stuff for user auth
	$http.defaults.headers.get = { 'Authorization' : 'VALUE_THAT_SHOULDNT_BE_HARDCODED_BUT_IS_RIGHT_NOW' }

	// Header stuff for user auth
	$http.defaults.headers.post = { 'Authorization' : 'VALUE_THAT_SHOULDNT_BE_HARDCODED_BUT_IS_RIGHT_NOW' }


	// Sets what today is
	$scope.today = moment();
	$scope.formattedToday = moment().format("MMM Do");

	// GET request that populates appointments
	$http.get('http://bookmefish.herokuapp.com/appointments.json').
	  success(function(data) {
	  
	    $scope.appointments = data.appointments;

	    // Sets up appointments array for today to display on the dashboard
	    $scope.todaysAppts = []; 

	    for (var i = 0; i < $scope.appointments.length; i++) {
			var currentAppt = $scope.appointments[i];

			// Formats the appointments data for use with the calendar
			appointmentsArr.push({
				title: currentAppt.last_name + ", " + currentAppt.first_name,
				start: moment(currentAppt.date_time).format("YYYY-MM-DD"),
				editable: true
			})

			// Formats each date into human-friendly format
			currentAppt.date_time = moment(currentAppt.date_time).format("MMM Do");

			// Populates todays appointments for dashboard
			if (currentAppt.date_time === $scope.formattedToday) {
				$scope.todaysAppts.push(currentAppt);
			}

	    }	

	    // Renders every appointment in the calendar    
	    $("#calendar").fullCalendar( 'addEventSource', appointmentsArr);

	  }).
	  error(function(data) {
	    console.log("error", data)
	  });

})


// Calls Controller
app.controller("CallsController", function($scope, $http, $filter) {

	// Header stuff for user auth
	$http.defaults.headers.get = { 'Authorization' : 'VALUE_THAT_SHOULDNT_BE_HARDCODED_BUT_IS_RIGHT_NOW' }

// Header stuff for user auth
	$http.defaults.headers.post = { 'Authorization' : 'VALUE_THAT_SHOULDNT_BE_HARDCODED_BUT_IS_RIGHT_NOW' }


	// Sets up array of people you need to call (unresolved calls)
	$scope.toCall = [];

	// GET request that popluates voicemail list
	$http.get('http://bookmefish.herokuapp.com/voicemails.json').
		success(function(data) {
			$scope.calls = data.voicemails;
			
			// Populates the toCall array (dashboard)
			for (var i = 0; i < $scope.calls.length; i++) {
				if ($scope.calls[i].resolved === false) {
					$scope.toCall.push($scope.calls[i]);
				}
			}

		}).
	  error(function(data) {
	    console.log("error", data)
	  });

	  //Sets up activeClient variable on $scope
	  $scope.activeClient;

	  // Grabs info for the modal (pop-up) when you click the little green phone icon
	  $scope.makeActive = function(voicemail) {
	  	$scope.activeClient = voicemail;
	  	$scope.activeClient.client.next_allowable_appointment = moment($scope.activeClient.client.next_allowable_appointment).format("MMM Do YYYY")
	  	$scope.clientNotes = $scope.activeClient.notes;
	  	$('#more-info').modal();
	  }

	  // Opens modal window to add or edit notes
	  $scope.toggleEditNoteMode = function(activeClient) {
	  	$scope.activeClient = activeClient;
	  	$scope.clientNotes = $scope.activeClient.notes;
	  	$('#edit-note').modal();
	  }

	  //Toggles Edit Client mode
	  $scope.toggleEditClientMode = function(activeClient) {
	  	$scope.activeClient = activeClient;
	  	$scope.clientNotes = $scope.activeClient.notes;
	  	$('#edit-client').modal();
	  }

	  // Cancels edit
	  $scope.cancelEdit = function(activeClient) {
	  	$scope.activeClient = activeClient;
	  	$('#more-info').modal();
	  }

	  $scope.openVM = function() {
	  	$("#add-vm").modal();
	  }
})

// effect for sticking the menu to the top of the page on scoll up
$("#link-list").sticky();





