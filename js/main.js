'use strict'

/*
Functionality and Features
● Show a timer that starts on first click (right / left) and stops
when game is over.
● Left click reveals the cell’s content
● Right click flags/unflags a suspected cell (you cannot reveal a
flagged cell)
● Game ends when:
o LOSE: when clicking a mine, all mines should be revealed
o WIN: all the mines are flagged, and all the other cells are
shown
● Support 3 levels of the game
o Beginner (4*4 with 2 MINES)
o Medium (8 * 8 with 12 MINES)
o Expert (12 * 12 with 30 MINES)
● If you have the time, make your Minesweeper look great.
● Expanding: When left clicking on cells there are 3 possible
cases we want to address:
o MINE – reveal the mine clicked
o Cell with neighbors – reveal the cell alone
o Cell without neighbors – expand it and its 1st degree
neighbors
*/

// TODO-1: the seed app
// ##########################
// 1. Create a 4x4 gBoard Matrix containing Objects. 
// Place 2 mines manually when each cell’s isShown set to true.
// 2. Present the mines using renderBoard() function.
// ##########################
// TODO-2: counting neighbors
// ##########################
// 1. Create setMinesNegsCount() and store the numbers
// (isShown is still true)
// 2. Present the board with the neighbor count and the mines
// using renderBoard() function.
// 3. Have a console.log presenting the board content – to help
// you with debugging
// ##########################
// TODO-3: click to reveal
// ##########################
// 1. Make sure your renderBoard() function adds the cell ID to
// each cell and onclick on each cell calls cellClicked()
// function.
// 2. Make the default “isShown” to be “false”
// 3. Implement that clicking a cell with “number” reveals the
// number of this cell
// ##########################
// TODO-4: randomize mines' location
// ##########################
// 1. Randomly locate the 2 mines on the board
// 2. Present the mines using renderBoard() function.



const MINE = '💣'
const SMILEY = '😄'
const EMPTY = ' '

const MINEPATH = 'img/naval-mine.png'
const FLAGPATH = 'img/kisspng-flag.png'

const MINEHTML = `<img class="mine" src="${MINEPATH}" alt="mine-image" hidden>`
const FLAGHTML = `<img class="flag" src="${FLAGPATH}" alt="flag-image" hidden>`

var gTimer

var gMinesNegCount

// The model
var gBoard

// var gCell = {
//     minesAroundCount: 4,
//     isShown: true,
//     isMine: false,
//     isMarked: true
// }


// This is an object by which the
// board size is set (in this case:
// 4x4 board and how many mines
// to put)
var gLevel = {
    SIZE: 4,
    MINES: 2
}


// This is an object in which you
// can keep and update the
// current game state:
// isOn: Boolean, when true we
// let the user play
// shownCount: How many cells
// are shown
// markedCount: How many cells
// are marked (with a flag)
// secsPassed: How many seconds passed 
// var gGame = {
//     isOn: false,
//     shownCount: 0,
//     markedCount: 0,
//     secsPassed: 0
// }


// This is called when page loads
function initGame() {
    /**
     * initializes the minesweeper game
     */
    console.log('called init')
    gBoard = buildBoard()
    setRandMines()
    // setMinesNegsCount()
    renderBoard(gBoard, '.game-board')

}



function buildBoard() {
    /**
     * Builds the board
     * Set mines at random locations
     * Call setMinesNegsCount()
     * Return the created board
     */
    var mat = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        var row = []
        for (var j = 0; j < gLevel.SIZE; j++) {
            var gCell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            row.push(gCell)
        }
        mat.push(row)
    }
    // change later -  Place 2 mines manually when each cell’s isShown set to true. 
    // mat[0][2].isMine = true
    // mat[0][2].isShown = true

    // mat[2][3].isMine = true
    // mat[2][3].isShown = true

    return mat
}

function setRandMines() {
    /**
     * Set mines at random locations
     */
    for (var i = 0; i < gLevel.MINES; i++) {
        var randI = getRandomInt(0, gLevel.SIZE)
        var randJ = getRandomInt(0, gLevel.SIZE)
        gBoard[randI][randJ].isMine = true
    }
}

function renderBoard(mat, selector) {
    var strHTML = '<table border="0"><tbody>'
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {
            // const cell = mat[i][j]
            // var cell = (mat[i][j].isMine) ? MINE : EMPTY
            var cellImg = (mat[i][j].isMine) ? MINEHTML : FLAGHTML
            const className = `cell cell-${i}-${j}`
            strHTML += `<td class="${className}"> ${cellImg} </td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'
    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

// ##########################
// TODO-2: counting neighbors
// ##########################
// 1. Create setMinesNegsCount() and store the numbers
// (isShown is still true)
// 2. Present the board with the neighbor count and the mines
// using renderBoard() function.
// 3. Have a console.log presenting the board content – to help
// you with debugging

function countNeighbors(cellI, cellJ, mat) {
    /**
     * counts neighbors
     */
    var neighborsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= mat[i].length) continue;
            if (mat[i][j] === MINE) neighborsCount++;
        }
    }
    return neighborsCount;
}

// function manuallyCells() {
// }

// var gCell = {
//     minesAroundCount: 4,
//     isShown: true,
//     isMine: false,
//     isMarked: true
// }
function createCell(rowIdx, colIdx, inCell = '') {
    /**
     * Creates a minesweeper cell
     */
    return {
        // i: rowIdx,
        // j: colIdx,
        minesAroundCount: 4,
        isShown: true,
        isMine: false,
        isMarked: true
        // element: inCell
    }


}

function setMinesNegsCount(board) {
    /**
     * Count mines around each cell
     * and set the cell's
     * minesAroundCount
     */
}

// function with same name on utils.js!!
// function renderBoard(board) {
//     /**
//      * Render the board as a <table> to the page
//      */
// }


// Search the web (and
// implement) how to hide the
// context menu on right click
function cellClicked(elCell, i, j) {
    /**
     * Called on right click to mark a cell 
     * (suspected to be a mine)
     */
}

function checkGameOver() {
    /**
     * Game ends when all mines are marked, 
     * and all the other cells are shown

     */
}

// NOTE: start with a basic
// implementation that only opens
// the non-mine 1st degree
// neighbors
// BONUS: if you have the time
// later, try to work more like the
// real algorithm (see description
// at the Bonuses section below)
function expandShown(board, elCell, i, j) {
    /**
     * When user clicks a cell with no mines around, 
     * we need to open not only that cell, 
     * but also its neighbors. 
     */
}

function setLevel() {
    /**sets level of game by chosen button element */
}