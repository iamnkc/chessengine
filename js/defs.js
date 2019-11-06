var PIECES = {EMPTY:0, wP : 1, wN : 2 , wB : 3, wR : 4, wQ : 5, wK : 6,
            bP : 7, bN : 8 , bB : 9, bR : 10, bQ : 11, bK : 12};

var BRD_SQ_NUM = 120;

var FILES = {FILE_A:0, FILE_B:1, FILE_C:2, FILE_D:3,
            FILE_E:4, FILE_F:5, FILE_G:6, FILE_H:7, FILE_NONE:8};

var RANKS = {RANK_1:0, RANK_2:1, RANK_3:2, RANK_4:3,
            RANK_5:4, RANK_6:5, RANK_7:6, RANK_8:7 , RANK_NONE:8};

var COLOURS = {WHITE:0, BLACK:1, BOTH:2};

var CASTLEBIT = {WKCA:1,WQCA:2,BKCA:4,BQCA:8};

var SQUARES = {
    A1:21, B1:22, C1: 23, D1 : 24, E1:25, F1:26, G1:27, H1:28,
    A8:91, B8:92, C8: 93, D8 : 94, E8:95, F8:96, G8:97, H8:98,
    NO_SQ:99,OFFBOARD:100
};

var BOOL = {FALSE:0, TRUE:1};

var MAXGAMEMOVES = 2048;
var MAXPOSITIONMOVES = 256;
var MAXDEPTH = 64;


var FilesBrd = new Array(BRD_SQ_NUM);
var RanksBrd = new Array(BRD_SQ_NUM);

var START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1";

var PceChar = ".PNBRQKpnbrqk";
var SideChar = "wb-";
var RankChar = "123456789";
var FileChar = "abcdefgh";

function FR2SQ(f,r)
{
    return ((21+f)+r*10);
}

var PieceBig = [ BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE ];
var PieceMaj = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE ];
var PieceMin = [ BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE ];
var PieceVal= [ 0, 100, 325, 325, 550, 1000, 50000, 100, 325, 325, 550, 1000, 50000  ];
var PieceCol = [ COLOURS.BOTH, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE, COLOURS.WHITE,
	COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK, COLOURS.BLACK ];
	
var PiecePawn = [ BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE ];	
var PieceKnight = [ BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE ];
var PieceKing = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE ];
var PieceRookQueen = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE ];
var PieceBishopQueen = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE, BOOL.TRUE, BOOL.FALSE ];
var PieceSlides = [ BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE, BOOL.FALSE, BOOL.FALSE, BOOL.TRUE, BOOL.TRUE, BOOL.TRUE, BOOL.FALSE ];


//for direction of the pieces///
//queen direction will be combination of both rook and bishop //
var KnDir = [-8,-19,-21,-12,8,19,21,12]; //knight
var RkDir = [-1,-10,1,10]; // rook
var BiDir = [-9,-11,11,9]; // bishop
var KiDir = [-1,-10,1,10,-9,-11,11,9]; //king

// Piece direction numbers

var DirNum = [0,0,8,4,4,8,8,0,8,4,4,8,8]; // # of directions for each piece 
var PceDir = [0,0,KnDir,BiDir,RkDir,KiDir,KiDir,0,KnDir,BiDir,RkDir,KiDir,KiDir]; // each piece direction
var LoopNonSlidePce = [PIECES.wN,PIECES.wK,0,PIECES.bN,PIECES.bK,0]; //Non sliding pieces indices
var LoopNonSlideIndex = [0,3];
var LoopSlidePiece = [PIECES.wB,PIECES.wR,PIECES.wQ,0,PIECES.bB,PIECES.bR,PIECES.bQ,0]; //sliding piece indices
var LoopSlidePieceIndex = [0,4];


/*
    workflow of Non sliding piece directions
    //stop when zero occurs in LoopNonSlidePce;
    while(pce!=0)
    {
        pceIndex = LoopNonSlideIndex[WHITE](0);
        pce = LoopNonSlidePce[pceIndex] (wN);
        pceIndex++;
        loop pceDir[pce][#ofdirections] eg:- pceDir[wN][0-8];
    }
*/

var PieceKeys = new Array(14*120);
var SideKey;
var CastleKeys = new Array(16);


var Sq120ToSq64 = new Array(BRD_SQ_NUM);
var Sq64ToSq120 = new Array(64);


function RAND_32()
{
    return (Math.floor((Math.random()*255)+1) <<23 ) | (Math.floor((Math.random()*255)+1) <<16 )
        | (Math.floor((Math.random()*255)+1) <<8) | (Math.floor((Math.random()*255)+1));
}

function SQ64(sq120)
{
    return Sq120ToSq64[sq120];
}

function SQ120(sq64)
{
    return Sq64ToSq120[sq64];
}

var Kings = [PIECES.wK, PIECES.bK];
var CastlePerm = [
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 13, 15, 15, 15, 12, 15, 15, 14, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15,  7, 15, 15, 15,  3, 15, 15, 11, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
    15, 15, 15, 15, 15, 15, 15, 15, 15, 15
];

/*
Move storing

0000 0000 0000 0000 0000 0000 0000 - move representation
0000 0000 0000 0000 0000 0111 1111 -> From 0x7F
0000 0000 0000 0011 1111 1000 0000 -> To >>7,0x7F
0000 0000 0011 1100 0000 0000 0000 -> Captured >>14, 0xF
0000 0000 0100 0000 0000 0000 0000 -> Enpassant 0x40000
0000 0000 1000 0000 0000 0000 0000 -> Pawn start 0x80000
0000 1111 0000 0000 0000 0000 0000 -> Promoted Piece >>20, 0xF
0001 0000 0000 0000 0000 0000 0000 -> Castling 0x1000000

*/

function FROMSQ(m){return (m&0x7F);}
function TOSQ(m){return ((m >>7 )&0x7F);}
function CAPTURED(m) {return ((m>>14) & 0xF);}
function PROMOTED(m) {return ((m>>20) & 0Xf);}

var MFLAGEP  = 0x40000; //enpassant
var MFLAGPS  = 0x80000; //Pawn start
var MFLAGCA  = 0x1000000; // Castling

var MFLAGCAP = 0x7C000;  //Captured
var MFLAGPROM = 0xF00000;  //Promoted

var NOMOVE = 0; //NoMove 

//checking offboard pieces

function SQOFFBOARD(sq)
{
    if(FilesBrd[sq]==SQUARES.OFFBOARD) return BOOL.TRUE;
    return BOOL.FALSE;
}

//Hashing out the move keys

function HASH_PCE(pce,sq)
{
    GameBoard.posKey ^= PieceKeys[(pce*120)+sq];
}

function HASH_CA(){ GameBoard.posKey ^= CastleKeys[GameBoard.castlePerm];}
function HASH_SIDE() {GameBoard.posKey ^= SideKey;}
function HASH_EP() {GameBoard.posKey ^= PieceKeys[GameBoard.enPas];}