$ = function(id) {
    return document.getElementById(id);
}

var place = 0;
var answerArray = new Array(4);
var id = "";
var color = "";
var correct = 0;
var sets = 0;
var endS = 0;
var endM = 0;
var time = "";
var d = new Date();

var colorArray = ['red', 'blue', 'yellow', 'green',
    'orange', 'pink', 'purple', 'brown', 'gray',
    'black'
];

randomColor = function() {
    num = Math.floor(Math.random() * colorArray.length - 5);
    name = colorArray.splice(num, 1);
    return name;
}

answerColors = function() {
    $("answer1").style.backgroundColor = "red";
    $("answer2").style.backgroundColor = "blue";
    $("answer3").style.backgroundColor = "yellow";
    $("answer4").style.backgroundColor = "green";
    $("answer5").style.backgroundColor = "orange";
    $("answer6").style.backgroundColor = "pink";
    $("answer7").style.backgroundColor = "purple";
    $("answer8").style.backgroundColor = "brown";
    $("answer9").style.backgroundColor = "gray";
    $("answer10").style.backgroundColor = "black";
}

submit = function(user) {
    if (user == answerArray[place]) {
        console.log("correct")
        correct++;
        $("correct").innerHTML = correct;
        place++;
        if (place == 4) {
            place = 0;
            sets++;
            $("sets").innerHTML = sets;
            answerArray = []
            resetTiles();
        }
    } else {
        console.log("incorrect " + answerArray[place])
        endGame();
    }
}
endGame = function() {
    var date = d.getDate();
    var month = d.getMonth();
    var year = d.getFullYear();
    var hour = d.getHours();
    var minute = d.getMinutes();
    if (minute < 10) {
        minute = "0" + minute;
    }
    if (hour < 10) {
        hour = "0" + hour;
    }
    endM = $("minutes").innerHTML;
    time = date + "/" + month + "/" + year + " " + hour + ":" + minute;
    console.log(time);
    console.log("corrct: " + correct + " sets: " + sets);
    currentGame = { sets: +sets, correct: +correct }
    console.log(currentGame);

    $("minutes").innerHTML = 0;
    $("seconds").innerHTML = 0;
    $("correct").innerHTML = 0;
    $("sets").innerHTML = 0;
}

resetTiles = function() {
    modal.style.visibility = "hidden";
    $("answer1").disabled = true;
    $("answer2").disabled = true;
    $("answer3").disabled = true;
    $("answer4").disabled = true;
    $("answer5").disabled = true;
    $("answer6").disabled = true;
    $("answer7").disabled = true;
    $("answer8").disabled = true;
    $("answer9").disabled = true;
    $("answer10").disabled = true;
    for (i = 0; i < 4; i++) {
        color = randomColor()
        answerArray[i] = color;
        id = "cell" + i;
        $(id).style.backgroundColor = color;
    }
    console.log(answerArray)
    setTimeout(Game, 5000);
}

function Game() {
    $("cell0").style.backgroundColor = "white";
    $("cell1").style.backgroundColor = "white";
    $("cell2").style.backgroundColor = "white";
    $("cell3").style.backgroundColor = "white";
    $("answer1").disabled = false;
    $("answer2").disabled = false;
    $("answer3").disabled = false;
    $("answer4").disabled = false;
    $("answer5").disabled = false;
    $("answer6").disabled = false;
    $("answer7").disabled = false;
    $("answer8").disabled = false;
    $("answer9").disabled = false;
    $("answer10").disabled = false;
}

gameStart = function() {
    resetTiles();
    answerColors();
}