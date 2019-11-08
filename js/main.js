$(function(){
    console.log("Main Init Called");
    init();
    ParseFen(START_FEN);
    PrintBoard();
    GenerateMoves();
    PrintMoveList();
    PrintPieceLists();
    if(CheckBoard())
    {
        console.log("Board is perfect");
    }
    MakeMove(GameBoard.moveList[0]);
    PrintBoard();
    CheckBoard();
    TakeMove();
    PrintBoard();
    CheckBoard();
    
});
function InitFilesRanksBrd()
{
    var index =0 ;
    var file = FILES.FILE_A;
    var rank = RANKS.RANK_1;
    var sq = SQUARES.A1;

    for(index =0 ; index < BRD_SQ_NUM ; ++index)
    {
        FilesBrd[index] = SQUARES.OFFBOARD;
        RanksBrd[index] = SQUARES.OFFBOARD;
    }

    for(rank = RANKS.RANK_1 ; rank<=RANKS.RANK_8 ; ++rank)
    {
        for(file = FILES.FILE_A ; file <= FILES.FILE_H ; ++file)
        {
            sq = FR2SQ(file,rank);
            FilesBrd[sq] = file;
            RanksBrd[sq] = rank;
        }
    }
    //console.log(FilesBrd);
    //console.log(RanksBrd);
}
function InitHashKeys()
{
    for(var index = 0 ; index < 14*120 ; ++index)
    {
        PieceKeys[index] = RAND_32();
    }

    SideKey = RAND_32();

    for(var index =0 ; index < 16 ; ++index)
    {
        CastleKeys[index] = RAND_32();
    }
}
function InitSq120To64()
{
    var index =0;
    var file = FILES.FILE_A;
    var rank = RANKS.RANK_1;
    var sq = SQUARES.A1;
    var sq64 = 0;

    for(index =0 ; index < BRD_SQ_NUM ; ++index)
    {
        Sq120ToSq64[index] = 65;
    }

    for(index=0;index<64;++index)
    {
        Sq64ToSq120[index] = 120;
    }

    for(rank = RANKS.RANK_1 ; rank<=RANKS.RANK_8 ; ++rank)
    {
        for(file = FILES.FILE_A ; file <= FILES.FILE_H ; ++file)
        {
            sq = FR2SQ(file,rank);
            Sq64ToSq120[sq64] = sq;
            Sq120ToSq64[sq] = sq64;
            sq64++;
        }
    }
}

// Intializing 2048 empty history moves
function InitBoardVars()
{
    var index=0;
    for(index=0 ; index < MAXGAMEMOVES ; ++index)
    {
        GameBoard.history.push({
            move : NOMOVE,
            castlePerm : 0,
            enPas : 0,
            fiftyMove : 0,
            posKey :0
        });
    }

    for(index = 0; index < PVENTRIES ; ++index)
    {
        GameBoard.PvTable.push({
            move : NOMOVE,
            posKey : 0
        });
    }
}
function init()
{
    InitFilesRanksBrd();
    console.log("Board Intialized");
    InitHashKeys();
    InitSq120To64();
    InitBoardVars();
    console.log("Init Called");

}