
(function($){

	//console.log('js loaded....');
	var db;
	$(document).ready(function(){
        $(".labelclass").click(function(){
		$("#noteform").slideToggle("slow")
	});
    $('input').bind('keypress', function (event) {
    var regex = new RegExp("^[a-zA-Z0-9\b\\s]+$");
    var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
    if (!regex.test(key)) {
       event.preventDefault();
       return false;
    }
                });
    });

    
	var openRequest = indexedDB.open("wordlist",1);
	openRequest.onupgradeneeded = function(e) {
		console.log("Upgrading DB...");
		var thisDB = e.target.result;
		if(!thisDB.objectStoreNames.contains("wordliststore")) {
			thisDB.createObjectStore("wordliststore", { autoIncrement : true });
		}
	}
	openRequest.onsuccess = function(e) {
		console.log("Open Success!");
		db = e.target.result;
		document.getElementById('add-btn').addEventListener('click', function(){
			var text = document.getElementById('name-in').value;
			var text1 = document.getElementById('subject-in').value;
			var text2 = document.getElementById('message-in').value;
			if (!text.trim()||!text1.trim()||!text2.trim()) {
        		alert("please enter data");
        	} else {
        		addWord(text,text1,text2);
        	}
        });
        renderList();
	}
	openRequest.onerror = function(e) {
		console.log("Open Error!");
		console.dir(e);
	}

	




	function addWord(t,t1,t2) {
		console.log('adding ' + t+t1+t2);
		var transaction = db.transaction(["wordliststore"],"readwrite");
		var store = transaction.objectStore("wordliststore");
		var timeStam = new Date();
		console.log(timeStam.toLocaleString());
		var request = store.add({text: t,text1:t1,text2:t2,text3:timeStam.toLocaleString()});
		
		request.onerror = function(e) {
			console.log("Error",e.target.error.name);
	        alert("error please try again");
	    }
	    request.onsuccess = function(e) {
	    	console.log("added " + t+t1+t2);
	    	renderList();
	    	document.getElementById('name-in').value = '';
	    	document.getElementById('subject-in').value = '';
	    	document.getElementById('message-in').value = '';
	    }
	}

	function renderList(){
		$('.list-wrapper').empty();
		$('.list-wrapper').html('<table><tr><th>Timestamp</th><th>Subject</th><th>Char Count</th></tr></table>');

		//Counts the number of Objects in storage
		var transaction = db.transaction(['wordliststore'], 'readonly');
		var store = transaction.objectStore('wordliststore');
		var countRequest = store.count();
		
		countRequest.onsuccess = function(){ console.log(countRequest.result) ;
		$('#notesNumber').html('<h4>'+"Total Number of Notes Stored: " + countRequest.result     + '</h4>');};

		// Retrieves Objects from database
		var objectStore = db.transaction("wordliststore").objectStore("wordliststore");
		objectStore.openCursor().onsuccess = function(event) {
			var cursor = event.target.result;
			if (cursor) {
				var $link = $('<a href="#" data-key="' + cursor.key + '">' + cursor.value.text1.substring(0,24) + '</a>');
				$link.click(function(){
					
			if ($("#noteform").is(":visible")){
			

		$("#noteform").slideToggle("slow");}
					loadTextByKey(parseInt($(this).attr('data-key')));
                  

				});

				var $char = cursor.value.text2.replace(/\s+/g, '');
                var $charCount = $char.length;
				var $date = cursor.value.text3;
				var $row = $('<tr>');
				var $dateCell = $('<td><span></span></td>').append($date);//$('<td>' +date.getDate()+"/"+date.getMonth()+"/"+date.getFullYear()+' '+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+ '</td>');
				var $textCell = $('<td><span></span></td>').append($link);
				var $textcount=$('<td><span></span></td>').append($charCount);
				
			
				$row.append($dateCell);
				$row.append($textCell);
				$row.append($textcount);

				$('.list-wrapper table').append($row);
				$("th").css("padding", "5px").css("word-wrap","break-word");
				$("td").css("padding", "6px").css("word-wrap","break-word");


				//document.getElementById("list-wrapper").innerHTML = "no. of nodes ";
				cursor.continue();
			}
			else {
			    //no more entries
			}
		};
	}

	function loadTextByKey(key){

		var transaction = db.transaction(['wordliststore'], 'readonly');
		var store = transaction.objectStore('wordliststore');
		var request = store.get(key);
		
		request.onerror = function(event) {
		  alert("error please try again");
		};
		request.onsuccess = function(event) {
		  // Do something with the request.result!
		  $('.detail').html('<label class="cc">'+'<h4>' + "Name :-"+'</h4>'+'</label>'+request.result.text.toUpperCase()+'<br>' ).append('<label class="cc">'+'<h4>' + "Subject :-"+'</h4>'+'</label>'+ request.result.text1 + '<br>').append('<label class="cc">'+'<h4>' + "Message :-"+'</h4>'+'</label>'+ request.result.text2+ '<br>' );
		  
		  var $delBtn = $('<button class="deletemeButton">Delete me</button>');
		  var $cloBtn=$('<button class="deletemeButton">Close</button>');
		  $delBtn.click(function(){
		  	console.log('Delete ' + key);
		  	$('.detail').slideUp(600,function(){

		  		deleteWord(key);

		  	} )
		  	
		  });
		   $cloBtn.click(function(){


		   	$('.detail').slideUp(600);

		  })

		  if($('.detail').css('display','none')){

		  $('.detail').append($delBtn).append($cloBtn).slideToggle('slow');
          
          }
          else{
          		$('.detail').append($cloBtn);
          	$('.detail').append($delBtn);
          
          }
		  
		 
		  
		  
		};
	}

	function deleteWord(key) {
		var transaction = db.transaction(['wordliststore'], 'readwrite');
		var store = transaction.objectStore('wordliststore');
		var request = store.delete(key);
		request.onsuccess = function(evt){
			renderList();
			$('#detail').empty();
		};
	}






})(jQuery);