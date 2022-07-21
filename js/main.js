'use strict'

// TODO-1: the seed app - V
// TODO-2: counting neighbors - V
// TODO-3: click to reveal - V
// TODO-4: randomize mines' location - V
// ##########################
// https://codinhood.com/nano/dom/disable-context-menu-right-click-javascript

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

// The game data model
var gGame

function initGame(size = 4) {
    /**
     * This is called when page loads
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
            // initializes cell obj and push to an rray
            var gCell = initializeCell()
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

function initializeCell() {
    /**
     * initializes a minesweeper cell
     */
    return {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false
    }
}

function setRandMines(mat) {
    /**
     * Set mines at random locations
     */
    for (var i = 0; i < gLevel.MINES; i++) {
        var isClearFromMine = false

        // need to avoid random mine on same index i, j
        while (!isClearFromMine) {
            // 2 random numbers between 0 to size
            var randI = getRandomInt(0, gLevel.SIZE)
            var randJ = getRandomInt(0, gLevel.SIZE)
            // a random cell obj within the board
            var currCell = mat[randI][randJ]
            if (!currCell.isMine) {
                // when a cell is not a mine, complete while loop
                isClearFromMine = true
                // set cell's isMine val to true
                mat[randI][randJ].isMine = true
            }
        }
    }
}

function setMinesNegsCount(board) {
    /**
     * Count mines around each cell and set the cell's
     * minesAroundCount
     */
    for (var i = 0; i < board.length; i++) {

        for (var j = 0; j < board.length; j++) {
            var currCell = board[i][j]
            if (!currCell.isMine) {
                // counter of neighbors' cells that contain a mine
                currCell.minesAroundCount = countNeighbors(i, j, board)
            }
        }
    }
}

function renderBoard(mat, selector) {
    /**
     * render relevant data from board (matrix of cells) to html - 
     * converted format with relevant imgs
     */

    // add table element to str
    var strHTML = '<table border="0"><tbody>'
    for (var i = 0; i < mat.length; i++) {
        // add tr element to str
        strHTML += '<tr>'

        for (var j = 0; j < mat[0].length; j++) {
            // current cell (obj)
            var currCell = mat[i][j]

            var cellImg = EMPTY
            if (currCell.isMine) {
                // mine img element
                cellImg = MINEHTML
            } else {
                // nums img element
                cellImg = NUMSHTML[currCell.minesAroundCount]
            }
            // from index i,j to className str
            const className = `cell cell-${i}-${j}`
            // add td element that includes img to str
            // used onmousedown instead of onlick to catch also right click
            strHTML += `<td class="${className}" onmousedown="cellClicked(this, event, ${i}, ${j})"> ${cellImg} </td>`
        }
        // add closing of tr element
        strHTML += '</tr>'
    }
    // add closing of table element to str
    strHTML += '</tbody></table>'

    // insert str of an html element within innerHTML of relevant element 
    // that matched a selector
    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

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
            // count neighbors' cells that have a mine
            if (mat[i][j].isMine) neighborsCount++;
        }
    }
    return neighborsCount;
}

// Implement that clicking a cell with “number” reveals the number of this cell
function cellClicked(elCell, event, i, j) {
    /**
     * cell clicked functionality - Left click reveals the cell’s content.
     * right click marks a cell with a flag (suspected to be a mine), if it's hidden
     */
    var elCellImg
    var currCell = gBoard[i][j]

    // when cell is clicked and the game is not started yet, it starts the time
    if (!gGame.isOn) {
        gTimer = setInterval(increaseTime, 1000)
        gGame.isOn = true
    }

    switch (event.buttons) {
        case 1:
            // case 1: Primary button (usually the left button)

            var elCellImg = elCell.querySelector('img')

            // Left click reveals the cell’s content
            // When left clicking on cells there are 3 possible cases:
            // cases 1 & 2: mine or Cell with neighbors – reveal the cell alone
            // case 3: Cell without neighbors – expand it and its 1st degree neighbors
            if (currCell.isMine) {
                currCell.isShown = true
                // display the content of cell that includes a mine (remove hidden attr)

                // elCellImg.removeAttribute('hidden')

                // when the clicked cell is a mine and the user loses a game
                // when clicking a mine, all other mines should be revealed too
                // checkLose(elCell, i, j)
                checkLose(i, j)
            } else if (currCell.minesAroundCount === 0) {
                currCell.isShown = true
                // display content of the Cell without neighbors (remove hidden attr)
                elCellImg.removeAttribute('hidden')
                expandShown(gBoard, i, j)
            } else if (currCell.minesAroundCount > 0) {
                currCell.isShown = true
                // display content of the Cell with neighbors (remove hidden attr)
                elCellImg.removeAttribute('hidden')
            }
            break
        case 2:
            // case 2: Secondary button (usually the right button)

            // TODO-2: right click put a flag
            // count mark(flag)+not mine to win
            // WIN: all the mines are flagged, and all the other cells are
            // shown


            // markCell(elCell, i, j)
            // elCellImg.removeAttribute('hidden')
            break
        default:
            break;
    }

}

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

function checkLose(rowIdx, colIdx) {
    /**
     * for now the functionality of lives does not exist yet, 
     * so just declares losing game
     */
    // clears the interval and stops the timer
    clearInterval(gTimer)
    gTimer = null
    // set isOn to false (game ended)
    gGame.isOn = false
    // render lose smiley image
    renderSmiley(LOSEHTML)

    // when clicking a mine, all other mines should be revealed too
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[rowIdx][colIdx]

            if (currCell.isMine === true) {
                // set cell isShown val to true
                currCell.isShown = true

                // find td element according to cell index on board (i, j)
                var elCurrCell = document.querySelector('.' + getClassName({ i, j }))

                // display image (remove hidden from element)
                var elCurrCellImg = elCurrCell.querySelector('.mine')
                if (elCurrCellImg) {
                    elCurrCellImg.removeAttribute('hidden')
                    // change bg color of the relevant td element (of the mine cell)
                    elCurrCell.style.backgroundColor = 'rgba(209, 33, 33, 0.663)'
                }
            }
            // console.log(i, j)
            // console.log('x:', currCell)
        }
    }

    // select all td elements and remove onmousedown attr - 
    // not allowing more clicks after loosing the game
    var elTds = document.querySelectorAll('td')
    for (var i = 0; i < elTds.length; i++) {
        elTds[i].removeAttribute('onmousedown')
    }
}

function checkGameOver() {
    /**
     * Game ends when all mines are marked, 
     * and all the other cells are shown

     */
}

function expandShown(board, cellI, cellJ) {
    /**
     * When user clicks a cell with no mines around, 
     * we need to open not only that cell, 
     * but also its neighbors. 
     */
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue;
            if (j < 0 || j >= board[i].length) continue;

            var currCell = board[i][j]

            // not shown cell
            if (!currCell.isShown) {
                currCell.isShown = true
                // match img element within a relevant class name, using a selector
                var CellClassName = getClassName({ i, j })
                var elCellImg = document.querySelector('.' + CellClassName + ' img')
                // show relevant element that represent the cell obj within html
                elCellImg.removeAttribute('hidden')
            }
        }
    }
}

function increaseTime() {
    /**
     * updates by 1 sec the time that passed from the beginning of the game
     */
    // update time in the game model
    gGame.secsPassed++
    // update time inside the element's innerText
    var elTime = document.querySelector('span.time')
    elTime.innerText = `Time: ${gGame.secsPassed}`
}

function setLevel(btnNum) {
    /**sets board size which declare relevant level 
     * of game (by clicked button) */
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
    // initializes the minesweeper game
    initGame(size)
}

function initNumsImgs() {
    /**create paths of images that represent numbers from 0 to 8 included
     * (possible neighbors)
     */
    for (var i = 0; i < 9; i++) {
        // img element str
        var numPath = `img/${i}.png`
        var numHtml = `<img class="negs-count" src="${numPath}" alt="negs-count" hidden/>`
        // push the element str to an array
        NUMSHTML.push(numHtml)
    }
}

function renderSmiley(smileyHtml = PLAYINGHTML) {
    /**
     * smiley image according to game status
     */
    const elSmileyStatusDiv = document.querySelector('.smiley-status')
    elSmileyStatusDiv.innerHTML = smileyHtml
}

function preventRightClickMenu() {
    /**
     * Disable browser right-click for the whole page
     */
    window.addEventListener("contextmenu", e => e.preventDefault());
}
