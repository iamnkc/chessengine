/*Add link to index.html */


/*
    Workflow

    PvTable[10000]

    Entry .posKey .Move
    index = posKey%10000
    PvTable[index].move = move from AB posKey = GameBoard.posKey
*/

function ProbePvTable()
{
    var index = GameBoard.posKey%PVENTRIES;

    if(GameBoard.PvTable[index].posKey == GameBoard.posKey)
    {
        return GameBoard.PvTable[index].move;
    }
    return NOMOVE;
}

function StorePvMove(move)
{
    var index = GameBoard.posKey%PVENTRIES;
    GameBoard.PvTable[index].posKey = GameBoard.posKey;
    GameBoard.PvTable[index].move = move;
}