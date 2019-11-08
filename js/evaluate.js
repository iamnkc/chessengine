var PawnTable = [
    0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	,
    10	,	10	,	0	,	-10	,	-10	,	0	,	10	,	10	,
    5	,	0	,	0	,	5	,	5	,	0	,	0	,	5	,
    0	,	0	,	10	,	20	,	20	,	10	,	0	,	0	,
    5	,	5	,	5	,	10	,	10	,	5	,	5	,	5	,
    10	,	10	,	10	,	20	,	20	,	10	,	10	,	10	,
    20	,	20	,	20	,	30	,	30	,	20	,	20	,	20	,
    0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	
];
var KnightTable = [
    0	,	-10	,	0	,	0	,	0	,	0	,	-10	,	0	,
    0	,	0	,	0	,	5	,	5	,	0	,	0	,	0	,
    0	,	0	,	10	,	10	,	10	,	10	,	0	,	0	,
    0	,	0	,	10	,	20	,	20	,	10	,	5	,	0	,
    5	,	10	,	15	,	20	,	20	,	15	,	10	,	5	,
    5	,	10	,	10	,	20	,	20	,	10	,	10	,	5	,
    0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
    0	,	0	,	0	,	0	,	0	,	0	,	0	,	0		
];
    
var BishopTable = [
    0	,	0	,	-10	,	0	,	0	,	-10	,	0	,	0	,
    0	,	0	,	0	,	10	,	10	,	0	,	0	,	0	,
    0	,	0	,	10	,	15	,	15	,	10	,	0	,	0	,
    0	,	10	,	15	,	20	,	20	,	15	,	10	,	0	,
    0	,	10	,	15	,	20	,	20	,	15	,	10	,	0	,
    0	,	0	,	10	,	15	,	15	,	10	,	0	,	0	,
    0	,	0	,	0	,	10	,	10	,	0	,	0	,	0	,
    0	,	0	,	0	,	0	,	0	,	0	,	0	,	0	
];
    
var RookTable = [
    0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
    0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
    0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
    0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
    0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
    0	,	0	,	5	,	10	,	10	,	5	,	0	,	0	,
    25	,	25	,	25	,	25	,	25	,	25	,	25	,	25	,
    0	,	0	,	5	,	10	,	10	,	5	,	0	,	0		
];
    
var BishopPair = 40;
    
function whitePieces(table,score,pce)
{
    var sq;
    for(pceNum =0 ; pceNum < GameBoard.pceNum[pce] ; ++pceNum)
    {
        sq = GameBoard.pList[PCEINDEX(pce,pceNum)];
        score += table[SQ64(sq)];
    }
    //console.log("White Score " + score);
    return score;
}
function blackPieces(table,score,pce)
{
    var sq;
    for(pceNum =0 ; pceNum < GameBoard.pceNum[pce] ; ++pceNum)
    {
        sq = GameBoard.pList[PCEINDEX(pce,pceNum)];
        score -= table[MIRROR64(SQ64(sq))];
    }
    //console.log("Black Score " + score);
    return score;
}
function EvalPosition() {
        
    var score = GameBoard.material[COLOURS.WHITE] - GameBoard.material[COLOURS.BLACK];
    //console.log(score);
    //White pce
    score = whitePieces(PawnTable,score,PIECES.wP);
    score = whitePieces(BishopTable,score,PIECES.wB);
    score = whitePieces(RookTable,score,PIECES.wR);
    score = whitePieces(RookTable,score,PIECES.wQ);

    //Black pce;
    score = blackPieces(PawnTable,score,PIECES.bP);
    score = blackPieces(BishopTable,score,PIECES.bB);
    score = blackPieces(RookTable,score,PIECES.bR);
    score = blackPieces(RookTable,score,PIECES.bQ);


    if(GameBoard.pceNum[PIECES.wB] >= 2)
    {
        score += BishopPair;
    }

    if(GameBoard.pceNum[PIECES.bB] >= 2)
    {
        score -= BishopPair;
    }
    //console.log("Score : "+ score);
    if(GameBoard.side == COLOURS.WHITE) {
        return score;
    } else {
        return -score;
    }    
}