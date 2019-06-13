var game = new Chess();
var board;
var positionCount;

function bestMove()
{
	positionCount = 0;

	var moves = game.ugly_moves();
	var bestValue = 9999;
	var bestMove;
	var piecesNumber = 0;

	for(var i = 0; i < 8; i++)
	{
		for(var j = 0; j < 8; j++)
		{
			if(game.board()[i][j] !== null)
				piecesNumber++;
		}
	}

	if(piecesNumber <= 7)
	{
		var request = new XMLHttpRequest();
		var url = 'http://tablebase.lichess.ovh/standard?fen=' + game.fen();
		url = url.replace(/ /g, '_');
		request.open('GET', url, true);

		request.onload = function()
		{
			var json = JSON.parse(this.response);
			bestMove = json.moves[0].san;
			game.move(bestMove);
			board.position(game.fen());
		}

		request.send();
	}

	else
	{
		for(var i = 0; i < moves.length; i++)
		{
			game.ugly_move(moves[i]);
			var boardValue = minimax(3, game, -10000, 10000, true);
			game.undo();

			if(boardValue <= bestValue)
			{
				bestValue = boardValue;
				bestMove = moves[i];
			}
		}

		console.log("Analysed positions:", positionCount);
		game.ugly_move(bestMove);
		board.position(game.fen());
	}
}

function minimax(depth, game, alpha, beta, isMaximising)
{
	positionCount++;

	if(depth === 0)
		return evaluateBoard(game.board());

	var moves = game.ugly_moves();
	var bestValue = 9999;

	if(isMaximising)
		bestValue = -9999;

	for(var i = 0; i < moves.length; i++)
	{
		game.ugly_move(moves[i]);

		var minimaxValue = minimax(depth - 1, game, alpha, beta, !isMaximising);

		if(isMaximising)
		{
			bestValue = Math.max(minimaxValue, bestValue);
			alpha = Math.max(alpha, bestValue);
		}

		else
		{
			bestValue = Math.min(minimaxValue, bestValue);
			beta = Math.min(beta, bestValue);
		}

		game.undo();

		if(beta <= alpha)
			return bestValue;
	}

	return bestValue;
}

function evaluateBoard(board)
{
	var totalValue = 0;

	for(var i = 0; i < 8; i++)
	{
		for(var j = 0; j < 8; j++)
		{
			if(board[i][j] !== null)
				totalValue += evaluatePiece(board[i][j], i, j);
		}
	}

	return totalValue;
}

function evaluatePiece(piece, x, y)
{
	var value = 0;

	switch(piece.type)
	{
		case 'k':
			value = 900 + ((piece.color === 'w') ? kingWhite[y][x] : kingBlack[y][x]); break;
		case 'q':
			value = 90 + ((piece.color === 'w') ? queen[y][x] : queen[y][x]); break;
		case 'r':
			value = 50 + ((piece.color === 'w') ? rookWhite[y][x] : rookBlack[y][x]); break;
		case 'b':
			value = 30 + ((piece.color === 'w') ? bishopWhite[y][x] : bishopBlack[y][x]); break;
		case 'n':
			value = 30 + ((piece.color === 'w') ? knight[y][x] : knight[y][x]); break;
		case 'p':
			value = 10 + ((piece.color === 'w') ? pawnWhite[y][x] : pawnBlack[y][x]); break;
	}

	if(piece.color === 'w')
		return value;
	else
		return -value;
}

function undoMove()
{
	game.undo();
	game.undo();
	board.position(game.fen());
}

var removeGreySquares = function()
{
	$('#board .square-55d63').css('background', '');
};

var greySquare = function(square)
{
	var squareEl = $('#board .square-' + square);
  
	var background = '#a9a9a9';

	if (squareEl.hasClass('black-3c85d') === true)
		background = '#696969';

	squareEl.css('background', background);
};

var onDragStart = function(source, piece)
{
	if (game.game_over() === true || (game.turn() === 'w' && piece.search(/^b/) !== -1) || (game.turn() === 'b' && piece.search(/^w/) !== -1))
		return false;
};

var onDrop = function(source, target)
{
	removeGreySquares();

	var move = game.move({
		from: source,
		to: target,
		promotion: 'q'
	});

	if (move === null)
		return 'snapback';
	else
		setTimeout(function(){bestMove();}, 150);
};

var onMouseoverSquare = function(square, piece)
{
	var moves = game.moves({
		square: square,
		verbose: true
	});

	if (moves.length === 0) return;

	greySquare(square);

	for (var i = 0; i < moves.length; i++)
		greySquare(moves[i].to);
};

var onMouseoutSquare = function(square, piece)
{
	removeGreySquares();
};

var onSnapEnd = function()
{
	board.position(game.fen());
};

var config = {
	orientation: 'white',
	position: 'start',
	pieceTheme: 'img/chesspieces/{piece}.png',
	draggable: true,
	onDragStart: onDragStart,
	onDrop: onDrop,
	onMouseoutSquare: onMouseoutSquare,
	onMouseoverSquare: onMouseoverSquare,
	onSnapEnd: onSnapEnd
}

board = ChessBoard('board', config);

function reverseArray(array)
{
    return array.slice().reverse();
}

var pawnWhite =
	[
		[0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
		[5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0,  5.0],
		[1.0,  1.0,  2.0,  3.0,  3.0,  2.0,  1.0,  1.0],
		[0.5,  0.5,  1.0,  2.5,  2.5,  1.0,  0.5,  0.5],
		[0.0,  0.0,  0.0,  2.0,  2.0,  0.0,  0.0,  0.0],
		[0.5, -0.5, -1.0,  0.0,  0.0, -1.0, -0.5,  0.5],
		[0.5,  1.0, 1.0,  -2.0, -2.0,  1.0,  1.0,  0.5],
		[0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0]
    ];

var knight =
    [
		[-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
		[-4.0, -2.0,  0.0,  0.0,  0.0,  0.0, -2.0, -4.0],
		[-3.0,  0.0,  1.0,  1.5,  1.5,  1.0,  0.0, -3.0],
		[-3.0,  0.5,  1.5,  2.0,  2.0,  1.5,  0.5, -3.0],
		[-3.0,  0.0,  1.5,  2.0,  2.0,  1.5,  0.0, -3.0],
		[-3.0,  0.5,  1.0,  1.5,  1.5,  1.0,  0.5, -3.0],
		[-4.0, -2.0,  0.0,  0.5,  0.5,  0.0, -2.0, -4.0],
		[-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0]
    ];

var bishopWhite =
	[
		[ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
		[ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
		[ -1.0,  0.0,  0.5,  1.0,  1.0,  0.5,  0.0, -1.0],
		[ -1.0,  0.5,  0.5,  1.0,  1.0,  0.5,  0.5, -1.0],
		[ -1.0,  0.0,  1.0,  1.0,  1.0,  1.0,  0.0, -1.0],
		[ -1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0, -1.0],
		[ -1.0,  0.5,  0.0,  0.0,  0.0,  0.0,  0.5, -1.0],
		[ -2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0]
	];

var rookWhite =
	[
		[  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0],
		[  0.5,  1.0,  1.0,  1.0,  1.0,  1.0,  1.0,  0.5],
		[ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
		[ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
		[ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
		[ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
		[ -0.5,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -0.5],
		[  0.0,   0.0, 0.0,  0.5,  0.5,  0.0,  0.0,  0.0]
	];

var queen =
	[
		[ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
		[ -1.0,  0.0,  0.0,  0.0,  0.0,  0.0,  0.0, -1.0],
		[ -1.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
		[ -0.5,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
		[  0.0,  0.0,  0.5,  0.5,  0.5,  0.5,  0.0, -0.5],
		[ -1.0,  0.5,  0.5,  0.5,  0.5,  0.5,  0.0, -1.0],
		[ -1.0,  0.0,  0.5,  0.0,  0.0,  0.0,  0.0, -1.0],
		[ -2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0]
	];

var kingWhite =
	[
		[ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
		[ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
		[ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
		[ -3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
		[ -2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
		[ -1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
		[  2.0,  2.0,  0.0,  0.0,  0.0,  0.0,  2.0,  2.0],
		[  2.0,  3.0,  1.0,  0.0,  0.0,  1.0,  3.0,  2.0]
	];

var pawnBlack = reverseArray(pawnWhite);
var bishopBlack = reverseArray(bishopWhite);
var rookBlack = reverseArray(rookWhite);
var kingBlack = reverseArray(kingWhite);

/*
function flipOrientation()
{
	game.reset();
	board.clear(false);
	board.start();
	board.flip();

	if(board.orientation() === 'black')
	{
		game.move('d4');
		board.position(game.fen());
	}
}*/