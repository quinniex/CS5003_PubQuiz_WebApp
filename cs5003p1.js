$(document).ready(function() {

    generatePage();

    //show checkbox when select any difficulty option
    $("#selectDifficulty").on('change', function() {
        if ($(this).find("option:selected").val() !== "all") {
            $("#check").hide();
        } else {
            $("#check").show();
        }
    });


    //fetch url with number, difficulty and type
    $("#generate").on("click", function() {

			if($("#userNick").val().trim()==""){
				$("#userNick").val("Anonymous");
			}

        //var number = $("#number").val();
        var difficulty = $("#selectDifficulty option:selected").val();
				var category = $("#selectCategory option:selected").val();
        var type = $("#selectType option:selected").val();
        var myURL;


        //validation of input of number, integer between 10 and 50
        var isValidNumber = false;
        while (!isValidNumber) {
            var number = $("#number").val();

            if (/^[0-9]+$/.test(number) && number > 9 && number < 51) {
                myURL = "https://opentdb.com/api.php?amount=" + number;
                isValidNumber = true;
            } else {
                isValidNumber = true;
                alert("Please enter a valid number!");
                location.replace(location.href);
            }
        }

        //fetch url with different difficulty and type
        if (difficulty !== "all") {
					if(category!=="all"){
						if (type !== "all") {
						 myURL = myURL + "&difficulty=" + difficulty + "&category=" + category + "&type=" + type;
					 }else{
						 myURL = myURL + "&difficulty=" + difficulty + "&category=" + category;
					 }
				 }else {
					 if(type!=="all"){
						 myURL = myURL + "&difficulty=" + difficulty + "&type=" + type;
					 }else{
						 myURL = myURL + "&difficulty=" + difficulty;
					 }
				 }
        }else {
          if(category!=="all"){
						if(type!=="all"){
							myURL = myURL + "&category=" + category + "&type=" + type;
						}else{
							myURL = myURL + "&category=" + category;
						}
					}else{
						if(type!=="all"){
							myURL = myURL + "&type=" + type;
						}else{
							myURL;
						}
					}
        }

        $("#message").text("You quiz is ready now! ");

        console.log(myURL);

        startPage();

        //fetch url
        fetch(myURL)
            .then(response => response.json())
            .then(response => initialise(response))
            .catch("There is an error!");
    })


    //initialise game
    var answeredQuestion = 0;
    var correctAnswer = 0;
    var incorrectAnswer = 0;
    var quizOver = false;

    function initialise(json) {
			console.log(json)

        //sort question from easy to difficult when box checked
        if ($("#checkbox").is(':checked')) {
            var newJson = [];
            for (let i = 0; i < json.results.length; i++) {
                if (json.results[i].difficulty === "easy") {
                    newJson.push(json.results[i])
                }
            }
            for (let i = 0; i < json.results.length; i++) {
                if (json.results[i].difficulty === "medium") {
                    newJson.push(json.results[i])
                }
            }
            for (let i = 0; i < json.results.length; i++) {
                if (json.results[i].difficulty === "hard") {
                    newJson.push(json.results[i])
                }
            }
            json.results.splice(0, json.results.length);
            json.results = newJson;
        }


        //start game
        $("#start").on("click", function() {

            firstPage();
            displayNext();

            //a time countdown for each question
            var timetotal = 30;
            countdown(30);
            var timer;

            function countdown(timeleft) {
                timer = setInterval(function() {
                    var progressBarWidth = timeleft * $("#progressBar").width() / timetotal;
                    $("#progressBar").find("div").animate({
                            width: progressBarWidth
                        }, 1)
                        .html(timeleft + " s ");
                    --timeleft;
                    if (timeleft < 0) {
                        clearInterval(timer);
                        gameOver();
												//quizOver = true;
                        $("#message").text("Sorry, your time is out! You earned " + $("#money").text() + " in total.");
                    }
                }, 1000);
            }


            //display next question
            $("#next").on("click", function() {

                if (!quizOver) {
                    var userInput = $("input[type='radio']:checked").val();

                    if (userInput == undefined) {
                        alert("Please select an answer!")
                    } else {
                        //refresh countdown every new question is displayed
                        clearInterval(timer);
                        countdown(30);

                        //evaluate user's choice and count score
                        if (userInput === json.results[answeredQuestion].correct_answer) {
                            correctAnswer++;
                        }

                        if (json.results[answeredQuestion].incorrect_answers.includes(userInput)) {
                            incorrectAnswer++;
                        }
                        answeredQuestion++;

                        console.log("correct" + correctAnswer);
                        console.log("incorrect" + incorrectAnswer);

                        if (correctAnswer >= 5) {
													if(correctAnswer===5){
														alert("Congratulations! You have been guaranteed £500!")
													}
                            //make the number bigger to inform the guaranteed earning
                            $("#money").css({
                                "font-size": "400%"
                            });
                        }

                        if (incorrectAnswer === 3) {
                            gameOver();
														//quizOver = true;

                            if (correctAnswer >= 5) {
                                $("#message").text("You have got your minimum earning £500!");
                            } else {
                                $("#message").text("Sorry, you have lost the game and money!")
                            }
                        } else {
												 if (answeredQuestion < json.results.length) {
                            displayNext();
                        } else {
													  gameOver();
														//quizOver = true;
                            $("#message").text("Congratulations! You finished the quiz! You have earned " + $("#money").text() + " in total.");
                        }
											}
                    }
                } else {
                    //refresh page if game is over
                    window.location.reload();
                }
            });

            //user quit the game
            $("#quit").on("click", function() {
                gameOver();
								//quizOver = true;
                $("#message").text("You quitted the game. You earned " + $("#money").text() + " in total");
            });

						//page when game is over
						function gameOver() {
								$("#quit").hide();
								$("#quizBox").hide();
								$("#money").hide();
								$("#lifeline").hide();
								$("#countdown").hide();
								$("#message").show();
								$("#showBoard").show();
								$("#next").text("Play again?");
								clearInterval(timer);
								quizOver = true;
						}

        });


        //create each element of quiz box
        function createQuizBox(answeredQuestion) {

            var quizElement = $("<div id='question'></div>");

            var header = $("<h2>Question " + (answeredQuestion + 1) + ":</h2>");
            quizElement.append(header);

            var question = $("<p></p>").append(json.results[answeredQuestion].question);
            quizElement.append(question);

            var choices = createChoices(answeredQuestion);
            quizElement.append(choices);

            return quizElement;
        }


        //create choice list
        function createChoices() {
            var choiceList = $("<ul id='choiceList'></ul>");
            var choice;
            var input = "";
            var allChoices = [];

            var correctAnswerGiven = json.results[answeredQuestion].correct_answer;
            var incorrectAnswersGiven = json.results[answeredQuestion].incorrect_answers;

            allChoices.push(correctAnswerGiven);
            for (let i = 0; i < incorrectAnswersGiven.length; i++) {
                allChoices.push(incorrectAnswersGiven[i]);
            }

            allChoices = shuffle(allChoices);

            //show 50:50 button when there are more than two choices
            if (allChoices.length > 2) {
                $("#lifeline").show();
            } else {
                $("#lifeline").hide();
            }

            for (let j = 0; j < allChoices.length; j++) {
                choice = allChoices[j];
                $('<li><input type="radio" value="' + choice + '" name="dynradio" />' + choice + '</li>').appendTo(choiceList);
            }
            return choiceList;
        }


        //display the next question
        function displayNext() {
            $("#question").remove();
            var quizElement = createQuizBox(answeredQuestion);
            $("#quizBox").append(quizElement);
            displayMoney();
        }

        //display money £100 per question
        function displayMoney() {
					  //remove score of last question
					  $("#money").html("");
            $("#money").append("£" + 100 * correctAnswer);

        }

        //remove two incorrect choices from ul li
        $("#lifeline").on("click", function() {

						if(correctAnswer>=2){
							$(this).fadeOut();

							//reduce £200 and refresh money
							alert("You have spent £200 and deleted two incorrect answers!")
							correctAnswer=correctAnswer-2;
							displayMoney();

							if(correctAnswer<5){
									$("#money").css({
											"font-size": "1.5em"
									});
							}

							//grab three incorrect answers
							var incorrectChoices = [];
	            var incorrectAnswersGiven = json.results[answeredQuestion].incorrect_answers;

	            //shuffle incorrect answers and delete the first two of them
	            incorrectChoices = shuffle(incorrectAnswersGiven);
	            $('ul#choiceList li:contains(' + unescapeHTML(incorrectChoices[0]) + ')').fadeOut();
	            $('ul#choiceList li:contains(' + unescapeHTML(incorrectChoices[1]) + ')').fadeOut();

						}else{[
							alert("Sorry, you don't have enough money!")
						]}

        });

    }


		function unescapeHTML(text) {
			return $('<textarea/>').html(text).text();
		}


    //shuffle an array
    function shuffle(a) {
        var b = [];
        while (a.length > 0) {
            var index = parseInt(Math.random() * (a.length));
            b.push(a.splice(index, 1));
        }
        return b;
    }


    //page for generate quiz
    function generatePage() {
        $("#next").hide();
        $("#quit").hide();
        $("#back").hide();
        $("#start").hide();
        $("#money").hide();
        $("#lifeline").hide();
        $("#quizBox").hide();
        $("#countdown").hide();
				$("#showBoard").hide();
				$("#board").hide();
        $("#message").text("Welcome to Ye Olde Pub Quiz! Create your own quiz now:");
    }


    //page for start now
    function startPage() {
        $("#start").show();
        $("#generateQuiz").hide();
        $("#back").show();
        $("#back").on("click", function() {
            window.location.reload();
        });
    }


    //page when showing the first question
    function firstPage() {
        $("#quizBox").show();
        $("#next").show();
        $("#quit").show();
        $("#money").show();
        $("#countdown").show();
        $("#generateQuiz").hide();
        $("#start").hide();
        $("#back").hide();
        $("#message").hide();
    }


//function showLeaderboard(){
	$("#showBoard").on("click", function () {
			$("#showBoard").hide();

      //save value in web browser
			var localStorage = window.localStorage;
			var leaderBoard = JSON.parse(localStorage.getItem("leaderBoard"));
			leaderBoard = leaderBoard ? leaderBoard : [];
			leaderBoard.push({"name": $("#userNick").val(), "money": $("#money").text()});
			localStorage.setItem("leaderBoard", JSON.stringify(leaderBoard));

			//Sort money in descending order
			function sortByMoney(array, key) {
        return array.sort(function(a, b) {
        var x = a.money.replace("£",""); var y = b.money.replace("£","");//replace ”£”, only compare number
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
        });
      }
      leaderBoard = sortByMoney(leaderBoard, "money");

      //create table
			let table = $("<table></table>");

		  //table header
			table.append("<tr><td>Name</td>"+"<td>Money</td></tr>");

			//add cell
			for (let leader of leaderBoard) {
					let row = $("<tr></tr>");
					let columnName = $("<td></td>").text(leader.name);
					let columnMoney = $("<td></td>").text(leader.money);
					row.append(columnName);
					row.append(columnMoney);
					table.append(row);
			}
			$("#board").html("");
			$("#board").show();
			$("#board").append(table);

	});


});
