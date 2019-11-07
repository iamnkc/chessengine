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

function SearchPosition()
{
    var bestMove = NOMOVE; // best move
    var bestScore = -INFINITE; // best score
    var currentDepth = 0; // iterator

    //iterator deepning approach 1->max_depth if time exceeds stop the search

    for(currentDepth = 1 ; currentDepth <= SearchController.depth ; ++currentDepth)
    {
        //Alpha-Beta tree

        if(SearchController.stop == BOOL.TRUE)
        {
            break;
        }
    }

    SearchController.best = bestMove;
    SearchController.thinking = BOOL.FALSE;
    
}