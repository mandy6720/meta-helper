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

	// Header stuff for user auth
	$http.defaults.headers.put = { 'Authorization' : 'VALUE_THAT_SHOULDNT_BE_HARDCODED_BUT_IS_RIGHT_NOW' }



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
	  	
	  	//Need to make a call to grab actual client object


	  	$scope.activeClient = activeClient;
	  	console.log($scope.activeClient)
	  	
	  	// Send note info to the server

	 
	  	$http.put('http://bookmefish.herokuapp.com/clients/' + activeClient.client.id, {
	  		client: { 
	  			first_name: $scope.activeClient.client.first_name, 
	  			last_name: $scope.activeClient.client.last_name, 
	  			address: $scope.activeClient.client.address, 
	  			zip: $scope.activeClient.client.zip, 
	  			display_phone: $scope.activeClient.client.display_phone, 
	  			county: $scope.activeClient.client.county, 
	  			family_size: $scope.activeClient.client.family_size, 
	  			account_number: $scope.activeClient.client.account_number, 
	  			email: $scope.activeClient.client.email,
	  			active_client: $scope.activeClient.client.active_client
	  		}
	  	}).success(function(data){
	  		console.log("client updated!");
	  		$.modal.close();
	  	}).error(function(data){
	  		console.log("error! client didn't post", data)
	  	})

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
	  					
	  					// Ideally, posts a note ... then:
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
		  	$('#edit-note').modal({
	  		showClose: false
	  	});
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
	  	$.modal.close();
	  }


})

app.controller("CalendarController", function($scope, $http) {

	// Header stuff for user auth
	$http.defaults.headers.get = { 'Authorization' : 'VALUE_THAT_SHOULDNT_BE_HARDCODED_BUT_IS_RIGHT_NOW' }

	// Header stuff for user auth
	$http.defaults.headers.post = { 'Authorization' : 'VALUE_THAT_SHOULDNT_BE_HARDCODED_BUT_IS_RIGHT_NOW' }

	// Header stuff for user auth
	$http.defaults.headers.put = { 'Authorization' : 'VALUE_THAT_SHOULDNT_BE_HARDCODED_BUT_IS_RIGHT_NOW' }



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

	  $scope.pantryDay;
	  $scope.pantryDays = [];

	  // Get the pantry days from the server
	  $http.get("http://bookmefish.herokuapp.com/pantry_days.json").
			success(function(data){
				$scope.pantryDays = data.pantry_days;
			}).
			error(function(data) {
				console.log("error! couldn't get pantry days!")
			})

	  $scope.closeModal = function() {
	  	$.modal.close();
	  }

	  $scope.createPD = function() {
	  	$("#create-pd").modal({
	  		showClose: false
	  	});
	  }

	  $scope.addPD = function(pantryDay) {
	  	console.log(pantryDay)
	  	var dateSelected = $("#datepicker").val();
	  	dateSelected = moment.utc(dateSelected)
	  	$http.post("http://bookmefish.herokuapp.com/pantry_days", {
	  		pantry_day: {
	  			date_time: dateSelected,
	  			num_volunteers: pantryDay.num_volunteers, 
	  			max_num_clients: pantryDay.max_num_clients
	  		}
	  	}).
	  	success(function(data) {
	  		console.log("created pantry day!", data);
	  		$.modal.close();
	  	}).
	  	error(function(data){
	  		console.log("error! coudn't create pantry day!")
	  	})
	  }

	// Opens the EDIT pantry days window
	$scope.openEditPD = function(){
		$("#edit-pd").modal({
			showClose: false
		});
	}

	// Search pantry days function
	$scope.searchPDs = function(pantryDay) {
		var searchedPD = $("#edit-datepicker").val();
		var searchResult;

		for (var i = 0; i < $scope.pantryDays.length; i++) {
			var current = $scope.pantryDays[i];
			current.date_time = moment(current.date_time).format('L')

			if (current.date_time == searchedPD) {
				console.log("match!");
				searchResult = current;
			} 

		}
		if (!searchResult) {
				alert("This isn't a pantry day (yet)!")
			} else {
				$scope.pantryDay = searchResult
			}

	}

	// Edit pantry days function
	$scope.editPD = function(pantryDay) {
		$http.put('http://bookmefish.herokuapp.com/pantry_days/' + pantryDay.id, {
			pantry_day: { 
				num_volunteers: pantryDay.num_volunteers,
				max_num_clients: pantryDay.max_num_clients
			}
		}).
		success(function(data) {
			console.log("pantry day updated!");
			$.modal.close();
		}).
		error(function(data){
			console.log("Error! Pantry day didn't post!")
		})
	}


})


// Calls Controller
app.controller("CallsController", function($scope, $http, $filter) {

	// Header stuff for user auth
	$http.defaults.headers.get = { 'Authorization' : 'VALUE_THAT_SHOULDNT_BE_HARDCODED_BUT_IS_RIGHT_NOW' }

// Header stuff for user auth
	$http.defaults.headers.post = { 'Authorization' : 'VALUE_THAT_SHOULDNT_BE_HARDCODED_BUT_IS_RIGHT_NOW' }

	// Header stuff for user auth
	$http.defaults.headers.patch = { 'Authorization' : 'VALUE_THAT_SHOULDNT_BE_HARDCODED_BUT_IS_RIGHT_NOW' }



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
	  	$('#more-info').modal({
	  		showClose: false
	  	});
	  }

	  // Opens modal window to add or edit notes
	  $scope.toggleEditNoteMode = function(activeClient) {
	  	$scope.activeClient = activeClient;
	  	$scope.clientNotes = $scope.activeClient.notes;
	  	$('#edit-note').modal({
	  		showClose: false
	  	});
	  }

	  //Toggles Edit Client mode
	  $scope.toggleEditClientMode = function(activeClient) {
	  	$scope.activeClient = activeClient;
	  	$scope.clientNotes = $scope.activeClient.notes;
	  	$('#edit-client').modal({
	  		showClose: false
	  	});
	  }

	  // Cancels edit
	  $scope.cancelEdit = function(activeClient) {
	  	$scope.activeClient = activeClient;
	  	$('#more-info').modal({
	  		showClose: false
	  	});
	  }

	  $scope.openVM = function() {
	  	$("#add-vm").modal({
	  		showClose: false
	  	});
	  }

	  $scope.resolve = function(activeClient){

	  	$http.put('http://bookmefish.herokuapp.com/voicemails/' + activeClient.id, {
	  		voicemail: { 
	  			resolved: activeClient.resolved, 
	  			out_of_area: activeClient.out_of_area,
	  			above_income: activeClient.above_income,
	  			needs_other: activeClient.needs_other,
	  			no_docs: activeClient.no_docs,
	  			time_with_call: activeClient.time_with_call
	  		}
	  	})
	  }

	  // Opens booking screen
	  $scope.openBooking = function(activeClient) {
	  	$("#book-client").modal({
	  		showClose: false
	  	});
	  }

	  // Searches availability when booking
	  $scope.searchAvail = function(activeClient){
	  	
	  	var searchedDate = $('#book-datepicker').val();
	  	var formattedPDs = $scope.pantryDays;

	  	for (var i = 0; i < $scope.pantryDays.length; i++) {
	  		formattedPDs[i].date_time = moment(formattedPDs[i].date_time).format('L');
	  	}

	  	// Check if the date is a pantry day
	  	var result = _.findWhere(formattedPDs, {date_time: searchedDate});

	  	if (!result){
	  		alert("That's not a pantry day (yet)!")
	  	}
	  	// If it is...
	  	if (result) {
	  		// Checks if there is availability on that day
	  		if (result.open_slot === false) {
	  			alert("No availability on this day!");
	  		}
	  		else {
	  			$("#found-avail").append('<i class="fa fa-check"></i>');
	  		}
	  	}
	  }

	  $scope.addAppt = function(activeClient) {

	  	// Format the pantry days array for searching
	  	var formattedPDs = $scope.pantryDays;
	  	var date = $("#book-datepicker").val();

	  	for (var i = 0; i < $scope.pantryDays.length; i++) {
	  		formattedPDs[i].date_time = moment(formattedPDs[i].date_time).format('L');
	  	}

	  	// Check if the date is a pantry day
	  	var apptDate = _.findWhere(formattedPDs, {date_time: date});
	  	
	  	// Send appt to server
	  	$http.post("http://bookmefish.herokuapp.com/appointments", {
	  		appointment: { 
	  			pantry_day_id: apptDate.id, 
	  			client_id: activeClient.client.id,
	  			utilities: activeClient.utilities
	  		}
	  	}).
	  	success(function(data){
	  		$.modal.close();
	  	}).
	  	error(function(data){
	  		console.log("Error! Couldn't book appt!")
	  	})

	  }
})

// effect for sticking the menu to the top of the page on scoll up
$("#link-list").sticky();





