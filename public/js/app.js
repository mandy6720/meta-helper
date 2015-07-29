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
		.when('/clients/:id.json',
			{
				controller: 'ClientController',
				templateUrl: '../templates/client-info.html'
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

	// GET request that populates the client list
	$http.get('http://bookmefish.herokuapp.com/clients.json').
	  success(function(data) {
	    $scope.clients = data.clients;
	    clientList = data.clients;
	    console.log("success");
	  }).
	  error(function(data) {
	    console.log("error", data)
	  });

	  $scope.currentClient;
	  $scope.searchId;

	  $scope.addNewNote = function(activeClient) {
	  	$scope.currentClient = activeClient;
	  	var newNote = $("#new-note").val();
	  	console.log("id: " + $scope.currentClient.id);
	  	console.log(newNote);
	  	// Send note info to the server
	  	$http.post('http://bookmefish.herokuapp.com/notes/' + 3, {
	  		note: {
		  		voicemail_id: $scope.currentClient.id,
		  		info: newNote
	  		}
	  	}).success(function(data){
	  		console.log("note added")
	  	}).error(function(data){
	  		console.log("error! note didn't post")
	  	})
	  }

	  // Searches existing client list for matching name
	  $scope.getClientId = function(activeClient) {
	  	$scope.currentClient = activeClient;
	  	var result = _.findWhere(clientList, {
	  		first_name: $scope.currentClient.first_name,
	  		last_name: $scope.currentClient.last_name
	  	});
	  	// If no clients match the name:
	  	if (!result) {
	  		alert("No clients match that name");
	  	}
	  	//note: maybe change this down the road to search by ID

	  	var searchId = result.id;
	  	console.log(result, searchId);

	  	// Otherwise, if match found:
	  	if (searchId) {
	  		alert("Found! Client ID: " + searchId);
	  	} 
	}

})

app.controller("CalendarController", function($scope, $http) {

	// Header stuff for user auth
	$http.defaults.headers.get = { 'Authorization' : 'VALUE_THAT_SHOULDNT_BE_HARDCODED_BUT_IS_RIGHT_NOW' }

	// Sets what today is
	$scope.today = moment();
	$scope.formattedToday = moment().format("MMM Do");

	// GET request that populates appointments
	$http.get('http://bookmefish.herokuapp.com/appointments.json').
	  success(function(data) {
	  
	    $scope.appointments = data.appointments;
	    console.log("success");

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

		// Adds settings and functions to the calendar
		$("#calendar").fullCalendar({
			eventClick: function(calEvent, jsEvent, view) {

	        alert('Event: ' + calEvent.title);
	        alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);
	        alert('View: ' + view.name);

	        // change the border color just for fun
	        $(this).css('border-color', 'red');

	    }
		});

	  }).
	  error(function(data) {
	    console.log("error", data)
	  });

})


// Calls Controller
app.controller("CallsController", function($scope, $http) {

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
	  	$scope.clientNotes = $scope.activeClient.notes;
	  	console.log(voicemail.id)
	  	$('#more-info').modal();
	  }

	  // Opens modal window to edit client info
	  $scope.toggleEditMode = function(activeClient) {
	  	$scope.activeClient = activeClient;
	  	$scope.clientNotes = $scope.activeClient.notes;
	  	console.log(activeClient.id)
	  	$('#edit-client').modal();
	  }

	  // Cancels edit
	  $scope.cancelEdit = function(activeClient) {
	  	$scope.activeClient = activeClient;
	  	console.log(activeClient)
	  	$('#more-info').modal();
	  }
})

// effect for sticking the menu to the top of the page on scoll up
$("#link-list").sticky();




