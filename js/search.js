var SearchController = {};

SearchController.nodes; //No of nodes gonna search
SearchController.fh; //fail high
SearchController.fhf; //fail high first
SearchController.depth; //max depth for search
SearchController.time; //time
SearchController.start; // start time of the search
SearchController.stop ; // stop time for the search
SearchController.best; //best move till now
SearchController.thinking; //whether search engine is thinking or not

function PickNextMove(MoveNum)
{
    var index=0;
    var bestScore =-1 ;
    var bestNum = MoveNum;

    for(index = MoveNum ; index < GameBoard.moveListStart[GameBoard.ply+1]; ++index)
    {
        if(GameBoard.moveScores[index] > bestScore)
        {
            bestScore = GameBoard.moveScores[index];
            bestNum = index;
        }
    }

    if(bestNum != MoveNum)
    {
        var temp =0 ;
        temp = GameBoard.moveScores[MoveNum];
        GameBoard.moveScores[MoveNum] = GameBoard.moveScores[bestNum];
        GameBoard.moveScores[bestNum] = temp;


        temp = GameBoard.moveList[MoveNum];
        GameBoard.moveList[MoveNum] = GameBoard.moveList[bestNum];
        GameBoard.moveList[bestNum] = temp;
    }
}
//clear pvTable
function ClearPvTable()
{
    for(index =0 ; index < PVENTRIES ; index++)
    {
        GameBoard.PvTable[index].move = NOMOVE;
        GameBoard.PvTable[index].posKey = 0;
    }
}
//check time
function CheckUp()
{
    if(($.now() - SearchController.start) > SearchController.time )
    {
       SearchController.stop = BOOL.TRUE; 
    }
}

// check IsRepetition()

function IsRepetition()
{
    var index  =0 ;
    // move will be repeated only if fiftyMove is set
    for(index = GameBoard.hisPly - GameBoard.fiftyMove ; index < GameBoard.hisPly -1 ; ++index)
    {
        if(GameBoard.posKey == GameBoard.history[index].posKey)
        {
            return BOOL.TRUE;
        }
    }
}

function Quiescence(alpha,beta)
{
    if((SearchController.nodes & 2047)==0)
    {
        CheckUp();
    }
    SearchController.nodes++;
    if((IsRepetition() || GameBoard.fiftyMove >= 100) && GameBoard.ply !=0)
    {
        return 0;
    }

    if(GameBoard.ply > MAXDEPTH-1)
    {
        /*return Evaluate() */
        return EvalPosition();
    }

    var Score = EvalPosition();

    if(Score >= beta)
    {
        return beta;
    }

    if(Score > alpha)
    {
        alpha = Score;
    }
    GenerateCaptures();

    var MoveNum;
    var Legal=0; // Number of legal moves
    var OldAlpha = alpha; //check the old alpha
    var BestMove = NOMOVE;
    var Move = NOMOVE;
    /*  Get PvMove
        order PvMove
    */
    //console.log(GameBoard.moveListStart[GameBoard.ply+1] - GameBoard.moveListStart[GameBoard.ply]+1);

    for(MoveNum = GameBoard.moveListStart[GameBoard.ply]; MoveNum < GameBoard.moveListStart[GameBoard.ply+1]; ++MoveNum )
    {
        /* Pick Next Best Move */
        PickNextMove(MoveNum);
        Move = GameBoard.moveList[MoveNum];
        if(MakeMove(Move) == BOOL.FALSE)
        {
            continue;
        }
        Legal++;
        Score = -Quiescence(-beta,-alpha);
        //console.log(PrMove(Move)+" Score: " + Score);
        TakeMove();
        
        if(SearchController.stop == BOOL.TRUE)
        {
            return 0;
        }

        if(Score > alpha)
        {
            if(Score>=beta)
            {
                if(Legal==1)
                {
                    SearchController.fhf++;
                }
                SearchController.fh++;
                return beta;
            }
            alpha = Score;
            BestMove = Move;
        }
    }

    if(OldAlpha != alpha)
    {
        StorePvMove(BestMove);
    }
    return alpha;
}
function AlphaBeta(alpha,beta,depth)
{
    
    if(depth <=0)
    {
        // return Evaluate()
        //return EvalPosition();
        return Quiescence(alpha,beta);
    }

    // check time function every 2048 calls
    if((SearchController.nodes & 2047) == 0)
    {
        CheckUp();
    }
    SearchController.nodes++;
    /*Check Rep() ... check Fifty Move rule draw*/
    if((IsRepetition() || GameBoard.fiftyMove >= 100) && GameBoard.ply !=0)
    {
        return 0;
    }

    if(GameBoard.ply > MAXDEPTH-1)
    {
        /*return Evaluate() */
        return EvalPosition();
    }

    // if king checked we increment the depth 
    var InCheck = SqAttacked(GameBoard.pList[PCEINDEX(Kings[GameBoard.side],0)],GameBoard.side^1);
    if(InCheck == BOOL.TRUE)
    {
        depth++;
    }

    var Score = -INFINITE;

    GenerateMoves();

    var MoveNum;
    var Legal=0; // Number of legal moves
    var OldAlpha = alpha; //check the old alpha
    var BestMove = NOMOVE;
    var Move = NOMOVE;

    // best move score ++

    var PrMove = ProbePvTable();
    if(PrMove != NOMOVE)
    {
        for(MoveNum = GameBoard.moveListStart[GameBoard.ply] ; MoveNum < GameBoard.moveListStart[GameBoard.ply+1] ; ++MoveNum)
        {
            if(GameBoard.moveList[MoveNum] == PrMove)
            {
                GameBoard.moveScores[MoveNum] = 2000000;
                break;
            }
        }
    }
    /*  Get PvMove
        order PvMove
    */
    //console.log(GameBoard.moveListStart[GameBoard.ply+1] - GameBoard.moveListStart[GameBoard.ply]+1);

    for(MoveNum = GameBoard.moveListStart[GameBoard.ply]; MoveNum < GameBoard.moveListStart[GameBoard.ply+1]; ++MoveNum )
    {
        /* Pick Next Best Move */
        PickNextMove(MoveNum);
        Move = GameBoard.moveList[MoveNum];
        if(MakeMove(Move) == BOOL.FALSE)
        {
            continue;
        }
        Legal++;
        Score = -AlphaBeta(-beta,-alpha,depth-1);
        //console.log(PrMove(Move)+" Score: " + Score);
        TakeMove();
        
        if(SearchController.stop == BOOL.TRUE)
        {
            return 0;
        }

        if(Score > alpha)
        {
            if(Score>=beta)
            {
                if(Legal==1)
                {
                    SearchController.fhf++;
                }
                SearchController.fh++;

                /*Update the killer moves */
                if((Move & MFLAGCA) ==0)
                {
                    GameBoard.searchKillers[MAXDEPTH+GameBoard.ply] = GameBoard.searchKillers[GameBoard.ply];
                    GameBoard.searchKillers[GameBoard.ply] = Move;
                }
                return beta;
            }
            if((Move & MFLAGCA)==0)
            {
                GameBoard.searchHistory[GameBoard.pieces[FROMSQ(Move)] * BRD_SQ_NUM + TOSQ(Move)]
                    += depth*depth;
            }
            alpha = Score;
            BestMove = Move;
            //Update the history table
        }
    }
    //console.log(Legal);

    /*Mate Check */
    if(Legal ==0)
    {
        if(InCheck == BOOL.TRUE)
        {
            return -MATE + GameBoard.ply;
        }
        else
        {
            return 0;
        }
    }

    if(alpha != OldAlpha)
    {
        /*Store PvMove */
        StorePvMove(BestMove);
    }
    return alpha;
}

function ClearForSearch()
{
    var index = 0;
    for(index =0 ; index < 14*BRD_SQ_NUM ; ++index)
    {
        GameBoard.searchHistory[index] = 0;
    }

    for(index =0 ; index < 3*MAXDEPTH ; ++index)
    {
        GameBoard.searchKillers[index] = 0;
    }
    ClearPvTable();
    GameBoard.ply = 0;
    SearchController.nodes = 0;
    SearchController.fh = 0;
    SearchController.fhf = 0;
    SearchController.start = $.now();
    SearchController.stop = BOOL.FALSE;
}
function SearchPosition()
{
    var bestMove = NOMOVE; // best move
    var bestScore = -INFINITE; // best score
    var currentDepth = 0; // iterator
    var line;
    var PvNum;
    var c;
    ClearForSearch();
    //iterator deepning approach 1->max_depth if time exceeds stop the search

    for(currentDepth = 1 ; currentDepth <= /*SearchController.depth*/ 6 ; ++currentDepth)
    {
        //Alpha-Beta tree
        bestScore = AlphaBeta(-INFINITE,INFINITE,currentDepth);

        if(SearchController.stop == BOOL.TRUE)
        {
            break;
        }
        bestMove = ProbePvTable();
        line = 'Depth: ' + currentDepth + ' Best: '+ PrMove(bestMove) + ' Score: '+ bestScore+
                ' nodes: ' + SearchController.nodes;

        PvNum = GetPvLine(currentDepth);
        line += " Pv : ";
        for(c = 0 ; c < PvNum ; ++c)
        {
            line += ' ' + PrMove(GameBoard.PvArray[c]);
        }

        if(currentDepth!=1)
        {
           line += (' Ordering: ' + ((SearchController.fhf/SearchController.fh)*100).toFixed(2)+"%"); 
        }
        console.log(line);
    }

    SearchController.best = bestMove;
    SearchController.thinking = BOOL.FALSE;
    
}