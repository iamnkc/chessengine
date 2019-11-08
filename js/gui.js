$("#SetFen").click(function(){
    var fenStr = $("#fenIn").val();
    //console.log(fenStr);
    ParseFen(START_FEN);
    PrintBoard();
    //PerftTest(5);
    SearchPosition();
});