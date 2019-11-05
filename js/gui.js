$("#SetFen").click(function(){
    var fenStr = $("#fenIn").val();
    console.log(fenStr);
    ParseFen(fenStr);
    PrintBoard();
});