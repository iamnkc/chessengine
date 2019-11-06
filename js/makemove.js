/*
    workflow of removing pieces from the plist

    let wP
    sq = s3 //piece to be removed

    pList[wP 0] = s1
    pList[wP 1] = s2
    pList[wP 2] = s3
    pList[wP 3] = s4
    pList[wP 4] = s5

    after iterating the pList t_pceNum = 2
    we will decrease the pceNum[pce] and swap the last index with the t_pceNum index

    final output
    pList[wP 0] = s1
    pList[wP 1] = s2
    pList[wP 2] = s5
    pList[wP 3] = s4
    ------------removed ------
    pList[wP 4] = s5

*/

function ClearPiece(sq)
{
    var pce = GameBoard.pieces[sq];
    var col = PieceCol[pce];
    var index;
    var t_pceNum;

    HASH_PCE(pce,sq); //Removing the piece

    GameBoard.pieces[sq] = PIECES.EMPTY; //Emptying the square position
    GameBoard.material[col] -= PieceVal[pce]; // Reducing the material score

    // Removing the piece from the pList

    for(index =0 ; index < GameBoard.pceNum[pce] ; ++index)
    {
        if(GameBoard.pList[PCEINDEX(pce,index)] == sq)
        {
            t_pceNum = index;
            break;
        }
    }

    GameBoard.pceNum[pce]--;
    GameBoard.pList[PCEINDEX(pce,t_pceNum)] = GameBoard.pList[PCEINDEX(pce,GameBoard.pceNum[pce])];
}

// Adding a piece 
function AddPiece(sq,pce)
{
    var col = PieceCol[pce];

    HASH_PCE(pce,sq);

    GameBoard.pieces[sq] = pce;
    GameBoard.material[col] += PieceVal[pce];

    GameBoard.pList[PCEINDEX(pce,GameBoard.pceNum[pce])] = sq;
    GameBoard.pceNum[pce]++;
}

function MovePiece(from,to)
{
    var index =0 ;
    var pce = GameBoard.pieces[from];

    HASH_PCE(pce,from); //removing the piece
    GameBoard.pieces[from] = PIECES.EMPTY;

    HASH_PCE(pce,to); //adding a piece
    GameBoard.pieces[to] = pce;

    //updating the pList
    for(index =0 ; index < GameBoard.pceNum[pce] ; ++index)
    {
        if(GameBoard.pList[PCEINDEX(pce,index)]==from)
        {
            GameBoard.pList[PCEINDEX(pce,index)] = to;
            break;
        }
    }

}

function MakeMove(move)
{
    /*
    from,sq

    undo ..?
    GameBoard.his[]

    his -> {move,key,enPass,fifty,castlePerm}
    */

    var from = FROMSQ(move);
    var to = TOSQ(move);
    var side = GameBoard.side;

    //setting up the GameBoard.history

    GameBoard.history[GameBoard.hisPly].posKey = GameBoard.posKey;
    
    //Clearning enPassanted piece
    if((move & MFLAGEP)!=0)
    {
        if(side==COLOURS.WHITE)
        {
            ClearPiece(to-10);
        }
        else
        {
            ClearPiece(to+10);
        }
    }
    else if((move & MFLAGCA) !=0)
    {
        //castling move
        // Moving Rooks
        // check for generate moves in movegen file for more details
        switch(to)
        {
            case SQUARES.C1:
                MovePiece(SQUARES.A1,SQUARES.D1);
                break;
            case SQUARES.G1:
                MovePiece(SQUARES.H1,SQUARES.F1);
                break;
            case SQUARES.C8:
                MovePiece(SQUARES.A8,SQUARES.D8);
                break;
            case SQUARES.G8:
                MovePiece(SQUARES.H8,SQUARES.F8);
                break;
            default:
                console.log("Rook Castling Move Unsuccesfull");
                break;

        }
    }

    //removing enpassant
    if(GameBoard.enPas != SQUARES.NO_SQ) HASH_EP();
    HASH_CA();

    //filling the history for hisPly index
    GameBoard.history[GameBoard.hisPly].move = move;
    GameBoard.history[GameBoard.hisPly].fiftyMove = GameBoard.fiftyMove;
    GameBoard.history[GameBoard.hisPly].enPas = GameBoard.enPas;
    GameBoard.history[GameBoard.hisPly].castlePerm = GameBoard.castlePerm;

    GameBoard.castlePerm &= CastlePerm[from];
    GameBoard.castlePerm &= CastlePerm[to];
    GameBoard.enPas = SQUARES.NO_SQ;

    HASH_CA();

    //for capture move , emptying the captured square

    var captured = CAPTURED(move);
    GameBoard.fiftyMove++;

    if(captured != PIECES.EMPTY)
    {
        ClearPiece(to);
        GameBoard.fiftyMove=0;
    }

    GameBoard.hisPly++;
    GameBoard.ply++;


    //Setting up enpassant move

    if(PiecePawn[GameBoard.pieces[from]] == BOOL.TRUE)
    {
        
        GameBoard.fiftyMove = 0;

        if((move & MFLAGPS) != 0)
        {
            if(side == COLOURS.WHITE)
            {
                GameBoard.enPas = from+10;
            }
            else
            {
                GameBoard.enPas = from -10;
            }
            HASH_EP();
        }
    }

    //Moving a piece
    MovePiece(from,to);

    //promoting a piece

    var prPce = PROMOTED(move);
    if(prPce != PIECES.EMPTY)
    {
        //removing pawn and adding promoted piece
        ClearPiece(to);
        AddPiece(to,prPce);
    }

    GameBoard.side ^= 1;
    HASH_SIDE();

    // checking whether king is in check after move

    if(SqAttacked(GameBoard.pList[PCEINDEX(Kings[side],0)],GameBoard.side))
    {
        //TakeMove();
        return BOOL.FALSE;
    }

    return BOOL.TRUE;
}