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

//clear pvTable
function ClearPvTable()
{
    for(index =0 ; index < PVENTRIES ; ++index)
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

function AlphaBeta(alpha,beta,depth)
{
    SearchController.nodes++;
    if(depth <=0)
    {
        // return Evaluate()
        return EvalPosition();
    }

    // check time function every 2048 calls
    if((SearchController.nodes & 2047) == 0)
    {
        CheckUp();
    }

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
    /*  Get PvMove
        order PvMove
    */
    //console.log(GameBoard.moveListStart[GameBoard.ply+1] - GameBoard.moveListStart[GameBoard.ply]+1);

    for(MoveNum = GameBoard.moveListStart[GameBoard.ply]; MoveNum < GameBoard.moveListStart[GameBoard.ply+1]; ++MoveNum )
    {
        /* Pick Next Best Move */
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
                return beta;
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
    ClearForSearch();
    //iterator deepning approach 1->max_depth if time exceeds stop the search

    for(currentDepth = 1 ; currentDepth <= /*SearchController.depth*/ 5 ; ++currentDepth)
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

        console.log(line);
    }

    SearchController.best = bestMove;
    SearchController.thinking = BOOL.FALSE;
    
}