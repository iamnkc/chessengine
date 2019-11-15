var MvvLvaValue = [ 0, 100, 200, 300, 400, 500, 600, 100, 200, 300, 400, 500, 600 ];
var MvvLvaScores = new Array(14 * 14);

function InitMvvLva() {
	var Attacker;
	var Victim;
	
	for(Attacker = PIECES.wP; Attacker <= PIECES.bK; ++Attacker) {
		for(Victim = PIECES.wP; Victim <= PIECES.bK; ++Victim) {
			MvvLvaScores[Victim * 14 + Attacker] = MvvLvaValue[Victim] + 6 - (MvvLvaValue[Attacker]/100);
		}
	}

}
function MoveExists(move)
{
    GenerateMoves();

    var index;
    var moveFound = NOMOVE;

    for(index = GameBoard.moveListStart[GameBoard.ply] ; index < GameBoard.moveListStart[GameBoard.ply+1] ; ++index )
    {
        moveFound = GameBoard.moveList[index];
        if(MakeMove(moveFound) == BOOL.FALSE)
        {
            continue;
        }
        TakeMove();

        if(move == moveFound)
        {
            return BOOL.TRUE;
        }
    }
    return BOOL.FALSE;
}
function MOVE(from,to,captured,promoted,flag)
{
    return(from | (to <<7) | (captured <<14) | (promoted<<20) | flag);
}
/*
    Usage of movelist
    GameBoard.moveListStart[] -> 'index' for the first move at tha give ply
    GameBoard.moveList[index]

    say ply 1 loop all moves

    for(index = GameBoard.moveListStart[1] ; index < GameBoard.moveListStart[2] ; ++index)
        move = moveList[index];

        ..use move

    GameBoard.moveListStart[2] = GameBoard.moveListStart[1];
    
    AddMove(Move)
    {
        GameBoard.moveList[GameBoard.moveListStart[2]] = Move;
        GameBoard.moveListStart[2]++;
    }
*/

//functions to add move
// reasons for different functions is for giving different score for each move
function AddCaptureMove(move)
{
    GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply+1]] = move; // storing move
    GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply+1]++] = 
    MvvLvaScores[CAPTURED(move) * 14 + GameBoard.pieces[FROMSQ(move)]] + 1000000;
     // for alpha-beta search tree
}
function AddQuietMove(move)
{
    //console.log(move);
    GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply+1]] = move; // storing move
    //console.log(GameBoard.moveListStart[GameBoard.ply+1]);
    GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply+1]] =0; // for alpha-beta search tree

    if(move == GameBoard.searchKillers[GameBoard.ply])
    {
        GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply+1]] = 900000;
    }
    else if(move == GameBoard.searchKillers[MAXDEPTH+GameBoard.ply])
    {
        GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply+1]] = 900000;
    }
    else
    {
        GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply+1]] = 
            GameBoard.searchHistory[GameBoard.pieces[FROMSQ(move)] * BRD_SQ_NUM + TOSQ(move)];
    }

    GameBoard.moveListStart[GameBoard.ply+1]++;
}
function AddEnPassantMove(move)
{
    GameBoard.moveList[GameBoard.moveListStart[GameBoard.ply+1]] = move; // storing move
    GameBoard.moveScores[GameBoard.moveListStart[GameBoard.ply+1]++] = 105 + 1000000; // for alpha-beta search tree constant score
}

//white pawn capture along with promotions move

function AddWhitePawnCaptureMove(from,to,cap)
{
    if(RanksBrd[from]==RANKS.RANK_7)
    {
        AddCaptureMove(MOVE(from,to,cap,PIECES.wQ,0));
        AddCaptureMove(MOVE(from,to,cap,PIECES.wR,0));
        AddCaptureMove(MOVE(from,to,cap,PIECES.wB,0));
        AddCaptureMove(MOVE(from,to,cap,PIECES.wN,0));
    }
    else
    {
        AddCaptureMove(MOVE(from,to,cap,PIECES.EMPTY,0));
    }
}
// black pawn capture along with promotion move
function AddBlackPawnCaptureMove(from,to,cap)
{
    if(RanksBrd[from]==RANKS.RANK_2)
    {
        AddCaptureMove(MOVE(from,to,cap,PIECES.bQ,0));
        AddCaptureMove(MOVE(from,to,cap,PIECES.bR,0));
        AddCaptureMove(MOVE(from,to,cap,PIECES.bB,0));
        AddCaptureMove(MOVE(from,to,cap,PIECES.bN,0));
    }
    else{
        AddCaptureMove(MOVE(from,to,cap,PIECES.EMPTY,0));
    }
}
//simple  quiet move with promotion move
function AddWhitePawnQuietMove(from,to)
{
    if(RanksBrd[from]==RANKS.RANK_7)
    {
        AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.wQ,0));
        AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.wR,0));
        AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.wB,0));
        AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.wN,0));
    }
    else
    {
        AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.EMPTY,0));
    }
}

function AddBlackPawnQuietMove(from,to)
{
    if(RanksBrd[from]==RANKS.RANK_2)
    {
        AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.bQ,0));
        AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.bR,0));
        AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.bB,0));
        AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.bN,0));
    }
    else
    {
        AddQuietMove(MOVE(from,to,PIECES.EMPTY,PIECES.EMPTY,0));
    }
}
// In castling rook movement is handled by movegeneration(idk)
// In enPassant the capturing is handled by movegeneration(idk)

function GenerateMoves()
{
    //console.log("Working move generation");
    GameBoard.moveListStart[GameBoard.ply+1] = GameBoard.moveListStart[GameBoard.ply];

    var pceType;
    var pceNum;
    var sq;
    var pceIndex;
    var pce;
    var index;
    var t_sq;
    var dir;

    if(GameBoard.side == COLOURS.WHITE)
    {
        pceType = PIECES.wP;
        //console.log(pceType);
        //console.log("Number of white pawn pieces - " + GameBoard.pceNum[pceType]);
        for(pceNum =0 ; pceNum < GameBoard.pceNum[pceType] ; ++pceNum)
        {
            sq = GameBoard.pList[PCEINDEX(pceType,pceNum)];
            //pawn moves
            //console.log(sq);
            if(GameBoard.pieces[sq+10]==PIECES.EMPTY)
            {
                // Add pawn move
                //console.log(sq);
                AddWhitePawnQuietMove(sq,sq+10);
                if(RanksBrd[sq]==RANKS.RANK_2 && GameBoard.pieces[sq+20]==PIECES.EMPTY)
                {
                    //console.log(sq);
                    //Add quiet move here
                    AddQuietMove( MOVE(sq,sq+20,PIECES.EMPTY,PIECES.EMPTY,MFLAGPS));
                }
            }

            if(SQOFFBOARD(sq+9) == BOOL.FALSE && PieceCol[GameBoard.pieces[sq+9]]==COLOURS.BLACK)
            {
                // Add capture Move
                AddWhitePawnCaptureMove(sq,sq+9,GameBoard.pieces[sq+9]);
            }

            if(SQOFFBOARD(sq+11) == BOOL.FALSE && PieceCol[GameBoard.pieces[sq+11]]==COLOURS.BLACK)
            {
                // Add capture Move
                AddWhitePawnCaptureMove(sq,sq+11,GameBoard.pieces[sq+11]);
            }

            //enpassant move

            if(GameBoard.enPas != SQUARES.NO_SQ)
            {
                if(sq+9 == GameBoard.enPas)
                {
                    // Add enpassant move
                    AddEnPassantMove( MOVE(sq,sq+9,PIECES.EMPTY,PIECES.EMPTY,MFLAGEP));
                }

                if(sq+11 == GameBoard.enPas)
                {
                    // Add enpassant Move
                    AddEnPassantMove( MOVE(sq,sq+11,PIECES.EMPTY,PIECES.EMPTY,MFLAGEP));
                }
            }

        }
        //castling check

        //King Side castling king e1->g1 and rook h1->f1
        if(GameBoard.castlePerm & CASTLEBIT.WKCA)
        {
            if(GameBoard.pieces[SQUARES.F1] == PIECES.EMPTY && GameBoard.pieces[SQUARES.G1]==PIECES.EMPTY)
            {
                if(SqAttacked(SQUARES.F1,COLOURS.BLACK)==BOOL.FALSE && SqAttacked(SQUARES.E1,COLOURS.BLACK)==BOOL.FALSE)
                {
                    //Add quiet Move
                    //castling flag
                    AddQuietMove(MOVE(SQUARES.E1,SQUARES.G1,PIECES.EMPTY,PIECES.EMPTY,MFLAGCA));
                }
            }

        }
        //Queen Side Castling king e1->c1 and rook a1 ->d1
        //King cannot be castled through check that's why we are checking d1
        if(GameBoard.castlePerm & CASTLEBIT.WQCA)
        {
            if(GameBoard.pieces[SQUARES.D1] == PIECES.EMPTY && GameBoard.pieces[SQUARES.C1]==PIECES.EMPTY
                && GameBoard.pieces[SQUARES.B1] == PIECES.EMPTY)
                {
                    if(SqAttacked(SQUARES.D1,COLOURS.BLACK)==BOOL.FALSE && SqAttacked(SQUARES.E1,COLOURS.BLACK)==BOOL.FALSE)
                    {
                        //ADD quiet Move
                        AddQuietMove(MOVE(SQUARES.E1,SQUARES.C1,PIECES.EMPTY,PIECES.EMPTY,MFLAGCA));
                    }
                }
        } 
        //pceType = PIECES.wN;
    }
    else
    {
        pceType = PIECES.bP;
        for(pceNum =0 ; pceNum < GameBoard.pceNum[pceType] ; ++pceNum)
        {
            sq = GameBoard.pList[PCEINDEX(pceType,pceNum)];
            //pawn moves
            if(GameBoard.pieces[sq-10]==PIECES.EMPTY)
            {
                // Add pawn move
                AddBlackPawnQuietMove(sq,sq-10);
                if(RanksBrd[sq]==RANKS.RANK_7 && GameBoard.pieces[sq-20]==PIECES.EMPTY)
                {
                    //Add quiet move here
                    AddQuietMove( MOVE(sq,sq-20,PIECES.EMPTY,PIECES.EMPTY,MFLAGPS));
                }
            }

            if(SQOFFBOARD(sq-9) == BOOL.FALSE && PieceCol[GameBoard.pieces[sq-9]]==COLOURS.WHITE)
            {
                // Add capture Move
                AddBlackPawnCaptureMove(sq,sq-9,GameBoard.pieces[sq-9]);
            }

            if(SQOFFBOARD(sq-11) == BOOL.FALSE && PieceCol[GameBoard.pieces[sq-11]]==COLOURS.WHITE)
            {
                // Add capture Move
                AddBlackPawnCaptureMove(sq,sq-11,GameBoard.pieces[sq-11]);
            }

            //enpassant move

            if(GameBoard.enPas != SQUARES.NO_SQ)
            {
                if(sq-9 == GameBoard.enPas)
                {
                    // Add enpassant move
                    AddEnPassantMove( MOVE(sq,sq-9,PIECES.EMPTY,PIECES.EMPTY,MFLAGEP));
                }

                if(sq-11 == GameBoard.enPas)
                {
                    // Add enpassant Move
                    AddEnPassantMove( MOVE(sq,sq-11,PIECES.EMPTY,PIECES.EMPTY,MFLAGEP));
                }
            }

        }
        //castling check
        //King Side castling king e8->g8 and rook h8->f8
        if(GameBoard.castlePerm & CASTLEBIT.BKCA)
        {
            if(GameBoard.pieces[SQUARES.F8] == PIECES.EMPTY && GameBoard.pieces[SQUARES.G8]==PIECES.EMPTY)
            {
                if(SqAttacked(SQUARES.F8,COLOURS.WHITE)==BOOL.FALSE && SqAttacked(SQUARES.E8,COLOURS.WHITE)==BOOL.FALSE)
                {
                    //Add quiet Move
                    AddQuietMove(MOVE(SQUARES.E8,SQUARES.G8,PIECES.EMPTY,PIECES.EMPTY,MFLAGCA));
                }
            }

        }
        //Queen Side Castling king e8->c8 and rook a8 ->d8
        //King cannot be castled through check that's why we are checking d8
        if(GameBoard.castlePerm & CASTLEBIT.BQCA)
        {
            if(GameBoard.pieces[SQUARES.D8] == PIECES.EMPTY && GameBoard.pieces[SQUARES.C8]==PIECES.EMPTY
                && GameBoard.pieces[SQUARES.B8] == PIECES.EMPTY)
                {
                    if(SqAttacked(SQUARES.D8,COLOURS.WHITE)==BOOL.FALSE && SqAttacked(SQUARES.E8,COLOURS.WHITE)==BOOL.FALSE)
                    {
                        //ADD quiet Move
                        AddQuietMove(MOVE(SQUARES.E8,SQUARES.C8,PIECES.EMPTY,PIECES.EMPTY,MFLAGCA));
                    }
                }
        }
        //pceType = PIECES.bN;
    }

    // Non sliding pieces

    pceIndex = LoopNonSlideIndex[GameBoard.side];
    pce = LoopNonSlidePce[pceIndex++];

    while(pce!=0)
    {
        for(pceNum =0 ; pceNum < GameBoard.pceNum[pce] ; ++pceNum)
        {
            sq = GameBoard.pList[PCEINDEX(pce,pceNum)];

            for(index =0 ; index < DirNum[pce] ; index++)
            {
                dir = PceDir[pce][index];
                t_sq = sq+dir;

                if(SQOFFBOARD(t_sq)==BOOL.TRUE){continue;}

                if(GameBoard.pieces[t_sq]!=PIECES.EMPTY)
                {
                    if(PieceCol[GameBoard.pieces[t_sq]] !=GameBoard.side)
                    {
                        // add capture move
                        AddCaptureMove(MOVE(sq,t_sq,GameBoard.pieces[t_sq],PIECES.EMPTY,0));
                    }
                }
                else
                {
                    // quiet move
                    AddQuietMove(MOVE(sq,t_sq,PIECES.EMPTY,PIECES.EMPTY,0));
                }
            }
        }
        pce = LoopNonSlidePce[pceIndex++];
    }

    //Sliding Pieces

    pceIndex = LoopSlidePieceIndex[GameBoard.side];
    pce = LoopSlidePiece[pceIndex++];

    while(pce!=0)
    {
        for(pceNum =0 ; pceNum < GameBoard.pceNum[pce] ; ++pceNum)
        {
            sq = GameBoard.pList[PCEINDEX(pce,pceNum)];

            for(index =0 ; index < DirNum[pce] ; index++)
            {
                dir = PceDir[pce][index];
                t_sq = sq+dir;
                while(SQOFFBOARD(t_sq) == BOOL.FALSE)
                {
                    if(GameBoard.pieces[t_sq] != PIECES.EMPTY)
                    {
                        if(PieceCol[GameBoard.pieces[t_sq]]!=GameBoard.side)
                        {
                            //Add Capture Move
                            AddCaptureMove(MOVE(sq,t_sq,GameBoard.pieces[t_sq],PIECES.EMPTY,0));
                        }
                        break;
                    }
                    //Add Quiet Move
                    AddQuietMove(MOVE(sq,t_sq,PIECES.EMPTY,PIECES.EMPTY,0));
                    t_sq+=dir;
                }
            }
        }
        pce = LoopSlidePiece[pceIndex++];
    }
}
function GenerateCaptures() {
	GameBoard.moveListStart[GameBoard.ply+1] = GameBoard.moveListStart[GameBoard.ply];
	
	var pceType;
	var pceNum;
	var sq;
	var pceIndex;
	var pce;
	var t_sq;
	var dir;
	
	if(GameBoard.side == COLOURS.WHITE) {
		pceType = PIECES.wP;
		
		for(pceNum = 0; pceNum < GameBoard.pceNum[pceType]; ++pceNum) {
			sq = GameBoard.pList[PCEINDEX(pceType, pceNum)];				
			
			if(SQOFFBOARD(sq + 9) == BOOL.FALSE && PieceCol[GameBoard.pieces[sq+9]] == COLOURS.BLACK) {
				AddWhitePawnCaptureMove(sq, sq + 9, GameBoard.pieces[sq+9]);
			}
			
			if(SQOFFBOARD(sq + 11) == BOOL.FALSE && PieceCol[GameBoard.pieces[sq+11]] == COLOURS.BLACK) {
				AddWhitePawnCaptureMove(sq, sq + 11, GameBoard.pieces[sq+11]);
			}			
			
			if(GameBoard.enPas != SQUARES.NOSQ) {
				if(sq + 9 == GameBoard.enPas) {
					AddEnPassantMove( MOVE(sq, sq+9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP ) );
				}
				
				if(sq + 11 == GameBoard.enPas) {
					AddEnPassantMove( MOVE(sq, sq+11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP ) );
				}
			}			
			
		}			

	} else {
		pceType = PIECES.bP;
		
		for(pceNum = 0; pceNum < GameBoard.pceNum[pceType]; ++pceNum) {
			sq = GameBoard.pList[PCEINDEX(pceType, pceNum)];			
			
			if(SQOFFBOARD(sq - 9) == BOOL.FALSE && PieceCol[GameBoard.pieces[sq-9]] == COLOURS.WHITE) {
				AddBlackPawnCaptureMove(sq, sq - 9, GameBoard.pieces[sq-9]);
			}
			
			if(SQOFFBOARD(sq - 11) == BOOL.FALSE && PieceCol[GameBoard.pieces[sq-11]] == COLOURS.WHITE) {
				AddBlackPawnCaptureMove(sq, sq - 11, GameBoard.pieces[sq-11]);
			}			
			
			if(GameBoard.enPas != SQUARES.NOSQ) {
				if(sq - 9 == GameBoard.enPas) {
					AddEnPassantMove( MOVE(sq, sq-9, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP ) );
				}
				
				if(sq - 11 == GameBoard.enPas) {
					AddEnPassantMove( MOVE(sq, sq-11, PIECES.EMPTY, PIECES.EMPTY, MFLAGEP ) );
				}
			}
		}			
	}	
	
	pceIndex = LoopNonSlideIndex[GameBoard.side];
	pce = LoopNonSlidePce[pceIndex++];
	
	while (pce != 0) {
		for(pceNum = 0; pceNum < GameBoard.pceNum[pce]; ++pceNum) {
			sq = GameBoard.pList[PCEINDEX(pce, pceNum)];
			
			for(index = 0; index < DirNum[pce]; index++) {
				dir = PceDir[pce][index];
				t_sq = sq + dir;
				
				if(SQOFFBOARD(t_sq) == BOOL.TRUE) {
					continue;
				}
				
				if(GameBoard.pieces[t_sq] != PIECES.EMPTY) {
					if(PieceCol[GameBoard.pieces[t_sq]] != GameBoard.side) {
						AddCaptureMove( MOVE(sq, t_sq, GameBoard.pieces[t_sq], PIECES.EMPTY, 0 ));
					}
				}
			}			
		}	
		pce = LoopNonSlidePce[pceIndex++];
	}
	
	pceIndex = LoopSlidePieceIndex[GameBoard.side];
	pce = LoopSlidePiece[pceIndex++];
	
	while(pce != 0) {		
		for(pceNum = 0; pceNum < GameBoard.pceNum[pce]; ++pceNum) {
			sq = GameBoard.pList[PCEINDEX(pce, pceNum)];
			
			for(index = 0; index < DirNum[pce]; index++) {
				dir = PceDir[pce][index];
				t_sq = sq + dir;
				
				while( SQOFFBOARD(t_sq) == BOOL.FALSE ) {	
				
					if(GameBoard.pieces[t_sq] != PIECES.EMPTY) {
						if(PieceCol[GameBoard.pieces[t_sq]] != GameBoard.side) {
							AddCaptureMove( MOVE(sq, t_sq, GameBoard.pieces[t_sq], PIECES.EMPTY, 0 ));
						}
						break;
					}
					t_sq += dir;
				}
			}			
		}	
		pce = LoopSlidePiece[pceIndex++];
	}
}
