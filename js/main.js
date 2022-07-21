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

// TODO-1: the seed app - V
// ##########################
// 1. Create a 4x4 gBoard Matrix containing Objects. 
// Place 2 mines manually when each cell’s isShown set to true.
// 2. Present the mines using renderBoard() function.
// ##########################
// TODO-2: counting neighbors - V
// ##########################
// 1. Create setMinesNegsCount() and store the numbers
// (isShown is still true)
// 2. Present the board with the neighbor count and the mines
// using renderBoard() function.
// 3. Have a console.log presenting the board content – to help
// you with debugging
// ##########################
// TODO-3: click to reveal - V
// ##########################
// 1. Make sure your renderBoard() function adds the cell ID to
// each cell and onclick on each cell calls cellClicked()
// function.
// 2. Make the default “isShown” to be “false”
// 3. Implement that clicking a cell with “number” reveals the
// number of this cell
// ##########################
// TODO-4: randomize mines' location - V
// ##########################
// 1. Randomly locate the 2 mines on the board
// 2. Present the mines using renderBoard() function.
// https://codinhood.com/nano/dom/disable-context-menu-right-click-javascript
// 1: Primary button (usually the left button)
// 2: Secondary button (usually the right button)
// https://codinhood.com/nano/dom/disable-context-menu-right-click-javascript


// const MINE = '💣'
const EMPTY = ' '

// paths for imgs (strings)
const MINEPATH = 'img/naval-mine.png'
const FLAGPATH = 'img/kisspng-flag.png'
const WINPATH = 'img/spongebob-won.png'
const LOSEPATH = 'img/spongebob-lose.png'
const PLAYINGPATH = 'img/spongebob-playing.png'

// array to include strings with html format for relevant images of some numbers
const NUMSHTML = []
// strings with html format for relevant images
const MINEHTML = `<img class="mine" src="${MINEPATH}" alt="mine-image" hidden>`
const FLAGHTML = `<img class="flag" src="${FLAGPATH}" alt="flag-image" hidden>`
const WINHTML = `<img class="win-img" src="${WINPATH}" alt="win-image">`
const LOSEHTML = `<img class="lose-img" src="${LOSEPATH}" alt="lose-image">`
const PLAYINGHTML = `<img class="playing-img" src="${PLAYINGPATH}" alt="playing-image">`


// TODO-5: to include a timer interval??
var gTimer
// The board data model (will include matrix)
var gBoard
// The level data model
var gLevel

// var gNegs

// The game data model
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
var gGame


// This is called when page loads
function initGame(size = 4) {
    /**
     * initializes the minesweeper game
     */


    // each level is with different board size and num of mines
    var mines = 2
    if (size === 8) mines = 12
    else if (size === 12) mines = 30
    // initializes object that includes level data - board size (for matrix) and mines to put
    gLevel = {
        SIZE: size,
        MINES: mines
    }
    // initializes object that includes some game data
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    // initializes paths for imgs of numbers (or empty cell img without mines around)
    initNumsImgs()
    // renders smiley image (spongebob)
    renderSmiley()
    // initializes board (matrix with cell objs) for minesweeper
    gBoard = buildBoard()
    // Disable browser right-click
    preventRightClickMenu()
    // render relevant data from minesweeper board to html
    renderBoard(gBoard, '.game-board')
}

function buildBoard() {
    /**
     * Builds the board (with objs that represent a cell)
     * Returns the created board
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
    // Set mines at random locations
    setRandMines(mat)
    // Count mines around each cell and update the cell model
    setMinesNegsCount(mat)

    return mat
}

function setRandMines(mat) {
    /**
     * Set mines at random locations
     */
    for (var i = 0; i < gLevel.MINES; i++) {
        var isPosEmpty = false
        // need to avoid random mine on same index i, j
        while (!isPosEmpty) {
            var randI = getRandomInt(0, gLevel.SIZE)
            var randJ = getRandomInt(0, gLevel.SIZE)
            if (!mat[randI][randJ].isMine) {
                isPosEmpty = true
                mat[randI][randJ].isMine = true
                // log stuff
                // console.log(mat[randI][randJ])
                // console.log(`mine ${i + 1} : at (${randI}, ${randJ})`)
            }
        }
    }
}

function renderBoard(mat, selector) {
    /**
     * render relevant data from board (matrix of cells) to html - 
     * converted format with relevant imgs
     */
    var strHTML = '<table border="0"><tbody>'
    for (var i = 0; i < mat.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {
            // const cell = mat[i][j]
            // var cell = (mat[i][j].isMine) ? MINE : EMPTY
            // var cellImg = (mat[i][j].isMine) ? MINEHTML : EMPTY
            var currCell = mat[i][j]

            var cellImg = EMPTY
            if (currCell.isMine) {
                cellImg = MINEHTML
            } else {
                // console.log('x:', currCell)
                cellImg = NUMSHTML[currCell.minesAroundCount]
            }
            // var cellImg = (currCell.isMine) ? MINEHTML : currCell.minesAroundCount

            const className = `cell cell-${i}-${j}`
            // strHTML += `<td class="${className}" onclick="cellClicked(this, ${i}, ${j})"> ${cellImg} </td>`
            strHTML += `<td class="${className}" onmousedown="cellClicked(this, event, ${i}, ${j})"> ${cellImg} </td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'
    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML

    console.log(mat)
}

// TODO-3: click to reveal
// ##########################
// 1. Make sure your renderBoard() function adds the cell ID to
// each cell and onclick on each cell calls cellClicked()
// function.
// 2. Make the default “isShown” to be “false”
// 3. Implement that clicking a cell with “number” reveals the
// number of this cell

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
            if (mat[i][j].isMine) neighborsCount++;
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
    // console.log('x:', 'called setMinesNegsCount')
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var currCell = board[i][j]
            if (!currCell.isMine) {
                currCell.minesAroundCount = countNeighbors(i, j, board)
            }
        }
    }
}

function increaseTime() {
    /**
     * updates by 1 sec the time that passed from the beginning of the game
     */
    gGame.secsPassed++
    var elTime = document.querySelector('span.time')
    elTime.innerText = `Time: ${gGame.secsPassed}`
}

// Implement that clicking a cell with “number” reveals the number of this cell
function cellClicked(elCell, event, i, j) {
    /**
     * Called on right click to mark a cell 
     * (suspected to be a mine)
     */
    // console.log('x:', elCell)
    // console.log(event)
    // console.log('i: ', i, '\tj: ', j)

    var elCellImg
    var currCell = gBoard[i][j]

    // when cell is clicked and the game is not started yet, it starts the time
    if (!gGame.isOn) {
        gTimer = setInterval(increaseTime, 1000)
        gGame.isOn = true
    }
    //https://stackoverflow.com/questions/457826/pass-parameters-in-setinterval-function

    switch (event.buttons) {
        case 1:
            // 1: Primary button (usually the left button)
            currCell.isShown = true

            var elCellImg = elCell.querySelector('img')
            elCellImg.removeAttribute('hidden')

            if (currCell.isMine) {
                console.log('a mine!!')
                checkLose(elCell)
            }

            if (currCell.minesAroundCount === 0 && !currCell.isMine) {
                expandShown(gBoard, i, j)
            }

            // call click on cell functions from here

            break
        case 2:
            // 2: Secondary button (usually the right button)
            // markCell(elCell, i, j)


            // elCellImg.removeAttribute('hidden')
            break
        default:
            break;
    }

}


// var gCell = {
//     minesAroundCount: 0,
//     isShown: false,
//     isMine: false,
//     isMarked: false
// }
function markCell(elCell, i, j) {
    /**mark or remove a flag from cell*/
    if (elCell.isShown) return

    elCellImg = elCell.querySelector('img')
    if (!gBoard[i][j].isMarked) {
        elCell.innerHTML = FLAGHTML
        // elCellImg.removeAttribute('hidden')
        console.log(elCellImg);
    } else {

    }


    currCell.isMarked = (!currCell.isMarked) ? true : false

}

function checkLose(elCell) {
    /**
     * for now the functionality of lives does not exist yet, 
     * so just declares losing game
     */
    console.log(elCell)
    elCell.style.backgroundColor = 'rgba(209, 33, 33, 0.663)'
    clearInterval(gTimer)
    gTimer = null
    gGame.isOn = false
    renderSmiley(LOSEHTML)
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
function expandShown(board, cellI, cellJ) {
    /**
     * When user clicks a cell with no mines around, 
     * we need to open not only that cell, 
     * but also its neighbors. 
     */
    // condition to stop recursion if it is a mine??
    // call function when a cell has no mines as neighbors??

    console.log('expand shown')
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;

            var currCell = board[i][j]

            if (!currCell.isShown) {
                currCell.isShown = true

                var CellClassName = getClassName({ i, j })
                var elCellImg = document.querySelector('.' + CellClassName + ' img')
                // console.log(elCellImg)
                elCellImg.removeAttribute('hidden')
            }
        }
    }
    console.log(board)
}


function setLevel(btnNum) {
    /**sets level of game by chosen button element */
    var size = 0
    switch (btnNum) {
        case 0:
            size = 4
            break;
        case 1:
            size = 8
            break;
        case 2:
            size = 12
            break;
    }
    initGame(size)
}

function initNumsImgs() {
    /**create paths of images that represent numbers from 0 to 8
     * (possible neighbors)
     */
    for (var i = 0; i < 9; i++) {
        var numPath = `img/${i}.png`
        var numHtml = `<img class="negs-count" src="${numPath}" alt="negs-count" hidden/>`
        NUMSHTML.push(numHtml)
    }
}

function renderSmiley(smileyHtml = PLAYINGHTML) {
    /**
     * smiley image according to game status
     */
    const elSmileyStatusDiv = document.querySelector('.smiley-status')
    elSmileyStatusDiv.innerHTML = smileyHtml
    // elSmileyStatusDiv.innerHTML = WINHTML
    // elSmileyStatusDiv.innerHTML = LOSEHTML

}

function preventRightClickMenu() {
    /**
     * Disable browser right-click for the whole page
     */
    window.addEventListener("contextmenu", e => e.preventDefault());
}
