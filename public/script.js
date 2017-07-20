(function () {
    var field = [
        [
            {index: 0, sign: ''},
            {index: 1, sign: ''},
            {index: 2, sign: ''}
        ],
        [
            {index: 3, sign: ''},
            {index: 4, sign: ''},
            {index: 5, sign: ''}
        ],
        [
            {index: 6, sign: ''},
            {index: 7, sign: ''},
            {index: 8, sign: ''}
        ]
    ];
    var playerTracer={
        rows: [{num:0,sum:0}, {num:0,sum:0}, {num:0,sum:0}],
        cols: [{num:0,sum:0}, {num:0,sum:0}, {num:0,sum:0}],
        diag: {num:0,sum:0},
        backDiag: {num:0,sum:0}
    };
    var signs = ["☮", "⛌"];
    var app = angular.module("xo", ['directs']);

    app.controller("gameController", function ($scope) {
        $scope.userFace = 1;//default index of user's symbol
        $scope.userScore = 0;//initial value of user's score
        $scope.computerScore = 0;//initial value of computer's score
        $scope.field = JSON.parse(JSON.stringify(field));//trick to get a copy of array with objects
        $scope.launched = false;//indicates if game was started
        $scope.infoMessage = "Choose symbol and press start!";//message on the start screen
        var stepsCount = 9;//count of possible moves (without $scope, because will not be used on the view part)
        var userTrace = JSON.parse(JSON.stringify(playerTracer));//trick to get a copy of object
        var compTrace=JSON.parse(JSON.stringify(playerTracer));

        $scope.startGame = function () {//launching the game
            $scope.launched = true;
            $scope.infoMessage = '';//and start screen will become hidden
            console.log($scope.userFace);
        };

        $scope.startAgain = function () {//continue the game (reset to several initial values)
            $scope.userFace = 1;
            $scope.field = JSON.parse(JSON.stringify(field));
            userTrace = JSON.parse(JSON.stringify(playerTracer));
            compTrace=JSON.parse(JSON.stringify(playerTracer));
            $scope.launched = false;
            $scope.infoMessage = "Choose symbol and press start!";
            stepsCount = 9;
        };

        function isEmpty (index) {//check if cell is empty
            var column = index % 3;
            var row = parseInt(index / 3);
            return $scope.field[row][column].sign === '';
         }

        function checkWinner (index) {//check for winner. This method is often invoked after making moves
            var column = index % 3;
            var row = parseInt(index / 3);
            var res = {col: true, row: true, diag: column == row, backDiag: column + row == 2};
            for (var i = 0; i < 3; i++) {
                if (res.row && $scope.field[row][i].sign !== $scope.field[row][column].sign) {
                    res.row = false;
                }
                if (res.col && $scope.field[i][column].sign !== $scope.field[row][column].sign) {
                    res.col = false;
                }
                if (res.diag && $scope.field[i][i].sign !== $scope.field[row][column].sign) {
                    res.diag = false;
                }
                if (res.backDiag && $scope.field[i][2 - i].sign !== $scope.field[row][column].sign) {
                    res.backDiag = false;
                }
            }
            return (~Object.values(res).indexOf(true));//some boolean fields remain 'true' if winner is defined
        }

        $scope.markSquare = function (index) {//user makes a move
            if (isEmpty(index)) {
                var column = index % 3;
                var row = parseInt(index / 3);
                $scope.field[row][column].sign = signs[$scope.userFace];
                stepsCount--;
                if (checkWinner(index)) {
                    $scope.infoMessage = 'The winner is USER';
                    $scope.userScore++;
                } else {
                    if (stepsCount) {
                        computerLogic(index);
                    } else {
                        $scope.infoMessage = 'Field is Filled!';
                    }
                }
            }
        };

        function tracing(index, trace) {//tracing moves of user or computer
            var col = index % 3;
            var row = parseInt(index / 3);
            trace.rows[row].num++;
            trace.rows[row].sum+=col;
            trace.cols[col].num++;
            trace.cols[col].sum+=row;
            if(row==col){
                trace.diag.num++;
                trace.diag.sum+=row;
            }
            if(row+col==2){
                trace.backDiag.num++;
                trace.backDiag.sum+=row;
            }
        }

        function compMakeStep(trace){//computer's action according to special tracing objects (for user and computer).
            var symbol = signs[Math.abs($scope.userFace - 1)];
            if ($scope.field[1][1].sign == '') {//to reduce users chances to win computer takes central cell if it is empty
                $scope.field[1][1].sign = symbol;
                tracing(4,compTrace);
                if (checkWinner(4)) {
                    $scope.infoMessage = 'The winner is COMPUTER';
                    $scope.computerScore++;
                }
                return true;
            }else{
                for(var i=0; i<3;i++){
                    if(trace.rows[i].num==2){//two identical symbols in row
                        var colToInsert=3-trace.rows[i].sum;
                        if($scope.field[i][colToInsert].sign==''){
                            $scope.field[i][colToInsert].sign = symbol;
                            tracing(3*i+colToInsert,compTrace);
                            trace.rows[i].num++;
                            if (checkWinner(3*i+colToInsert)) {
                                $scope.infoMessage = 'The winner is COMPUTER';
                                $scope.computerScore++;
                            }
                            return true;
                        }else{
                            trace.rows[i].num++;
                        }
                    }
                    if(trace.cols[i].num==2){//two identical symbols in column
                        var rowToIns=3-trace.cols[i].sum;
                        if($scope.field[rowToIns][i].sign==''){
                            $scope.field[rowToIns][i].sign = symbol;
                            tracing(3*rowToIns+i,compTrace);
                            trace.cols[i].num++;
                            if (checkWinner(3*rowToIns+i)) {
                                $scope.infoMessage = 'The winner is COMPUTER';
                                $scope.computerScore++;
                            }
                            return true;
                        }else{
                            trace.cols[i].num++;
                        }
                    }
                }
                if(trace.diag.num==2){//two identical symbols in diagonal
                    var ind=3-trace.diag.sum;
                    if($scope.field[ind][ind].sign==''){
                        $scope.field[ind][ind].sign = symbol;
                        tracing(4*ind,compTrace);
                        trace.diag.num++;
                        if (checkWinner(4*ind)) {
                            $scope.infoMessage = 'The winner is COMPUTER';
                            $scope.computerScore++;
                        }
                        return true;
                    }else{
                        trace.diag.num++;
                    }
                }
                if(trace.backDiag.num==2){//two identical symbols in another diagonal
                    var rowToInsert=3-trace.backDiag.sum;
                    if($scope.field[rowToInsert][2-rowToInsert].sign==''){
                        $scope.field[rowToInsert][2-rowToInsert].sign = symbol;
                        tracing(2*(rowToInsert+1),compTrace);
                        trace.backDiag.num++;
                        if (checkWinner(2*(rowToInsert+1))) {
                            $scope.infoMessage = 'The winner is COMPUTER';
                            $scope.computerScore++;
                        }
                        return true;
                    }else{
                        trace.backDiag.num++;
                    }
                }
            }
            return false;
        }

        function computerLogic(index){//takes index of last user's step
            tracing(index,userTrace);
            if(!compMakeStep(compTrace)&&!compMakeStep(userTrace)){
                outerLoop:
                for (var k = 0; k < 3; k++) {//if step doesn't require a logic - computer goes to the first empty cell on it's way
                    for (var l = 0; l < 3; l++) {
                        if ($scope.field[k][l].sign == '') {
                            $scope.field[k][l].sign = signs[Math.abs($scope.userFace - 1)];
                            tracing(3*k+l,compTrace);
                            if (checkWinner(3*k+l)) {
                                $scope.infoMessage = 'The winner is COMPUTER';
                                $scope.computerScore++;
                            }
                            break outerLoop;
                        }
                    }
                }
            }
            stepsCount--;
        }
    });
})();