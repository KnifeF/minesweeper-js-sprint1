'use strict'


/*
The goal of the game is to uncover all the squares that do
not contain mines without being "blown up" by clicking on a
square with a mine underneath.
*/

// Further Tasks for fun:
// TODO-1: The Smiley. Add smiley (feel free to switch icons \ images).
//   Normal 😃. Sad & Dead – LOSE 🤯(stepped on a mine). Sunglasses – WIN 😎. 
//   Clicking the smiley should reset the game - V
// TODO-2: Lives - Add support for “LIVES” - The user has 3 LIVES. When a MINE is clicked, there is an 
//   indication to the user that he clicked a mine. The LIVES counter decrease. The user can 
//   continue playing. - V
// TODO-3: Add support for HINTS - The user has 3 hints. - V
//   When a hint is clicked, it changes its look, example. 
//   Now, when a cell (unrevealed) is clicked, the cell and its neighbors are revealed 
// for a second, and the clicked hint disappears.
// TODO-4: Best Score -Keep the best score in local storage (per level) and show it on the page
// TODO-5: First click is never a Mine - Make sure the first clicked cell 
//   is never a mine (like in the real game). HINT: place the mines and count the neighbors 
//   only on first click.


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
const FLAGHTML = `<img class="flag" src="${FLAGPATH}" alt="flag-image">`
const WINHTML = `<img class="win-img" onclick="initGame()" src="${WINPATH}" alt="win-image" title="Click to reset">`
const LOSEHTML = `<img class="lose-img" onclick="initGame()" src="${LOSEPATH}" alt="lose-image" title="Click to reset">`
const PLAYINGHTML = `<img class="playing-img" onclick="initGame()" src="${PLAYINGPATH}" alt="playing-image" title="Click to reset">`

// TODO-5: to include a timer interval??
var gTimer
// countdown for a hint
var countdownHint
// The level data model
var gLevel
// The game data model
var gGame
// The board data model (will include matrix)
var gBoard

function initGame(size = 4) {
    /**
     * This is called when page loads initializes the minesweeper game
     */

    // reset interval
    if (gTimer) clearInterval(gTimer)

    // each level is with different board size and num of mines
    var mines = 2
    if (size === 8) mines = 12
    else if (size === 12) mines = 30

    var nOfLives = (size > 4) ? 3 : 2
    // initializes object that includes level data - board size (for matrix) and mines to put
    gLevel = { SIZE: size, MINES: mines }
    // initializes object that includes some game data
    gGame = {
        isOn: false, friendlyShownCount: 0, markedCount: 0, minesRevealedCount: 0,
        secsPassed: 0, lifeRemainCount: nOfLives, hintsRemainCount: 3, safeClicksRemainCount: 3
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

    // render game details
    renderGameDetails()
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
        minesAroundCount: 0, isShown: false, isMine: false, isMarked: false
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
            // str of an img element
            if (currCell.isMine) cellImg = MINEHTML
            else cellImg = NUMSHTML[currCell.minesAroundCount]

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

function cellClicked(elCell, event, i, j) {
    /**
     * cell clicked functionality - Left click reveals the cell’s content.
     * right click marks a cell with a flag (suspected to be a mine), if it's hidden
     */
    var currCell = gBoard[i][j]

    // when cell is clicked and the game is not started yet, it starts the time
    if (!gGame.isOn) {
        gTimer = setInterval(increaseTime, 1000)
        gGame.isOn = true
    }

    // Case 1: left click. Case 2: right click.
    switch (event.buttons) {
        case 1:
            if (currCell.isMarked) return

            // for left clicking on cells there are 3 possible cases
            if (currCell.isMine) {

                currCell.isShown = true
                // expose cell and not allowing clicks on this element
                setNotAllowed(elCell, true)
                // when the clicked cell is a mine and the user loses a game.
                if (checkLose(i, j)) return

                gGame.minesRevealedCount++

            } else if (currCell.minesAroundCount >= 0) {

                if (!currCell.isShown && !currCell.isMarked) gGame.friendlyShownCount++

                currCell.isShown = true
                // expose cell and not allowing clicks on this element
                setNotAllowed(elCell)
                // open cell's neighbors
                if (currCell.minesAroundCount === 0) expandShown(gBoard, i, j)
            }
            break
        case 2:
            if (!currCell.isMarked && currCell.isShown) return
            markCell(elCell, i, j)
            break

        default:
            break;
    }

    if (gGame.markedCount + gGame.friendlyShownCount + gGame.minesRevealedCount === gLevel.SIZE ** 2) {
        checkWin(gBoard)
    }
}

function markCell(elCell, i, j) {
    /**Right click flags/unflags a suspected cell 
     * (you cannot reveal a flagged cell*/

    var currCell = gBoard[i][j]

    // check if cell is not flagged
    if (!currCell.isMarked) {
        elCell.innerHTML = FLAGHTML
        gGame.markedCount++
    }
    else {
        gGame.markedCount--
        if (currCell.isMine) elCell.innerHTML = MINEHTML
        else elCell.innerHTML = NUMSHTML[currCell.minesAroundCount]
    }

    currCell.isMarked = !currCell.isMarked
    currCell.isShown = !currCell.isShown
}

function checkLose(rowIdx, colIdx) {
    /**
     * for now the functionality of lives does not exist yet, 
     * so just declares losing game
     */
    decreaseLives()
    // not lose when player has lives remaining
    if (gGame.lifeRemainCount > 0) {
        return false
    }

    console.log('You Lose!')

    // when clicking a mine, all other mines should be revealed too
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[rowIdx][colIdx]

            if (currCell.isMine === true) {
                // set cell isShown val to true
                currCell.isShown = true

                // find td element according to cell index on board (i, j)
                // var elCurrCell = document.querySelector('.' + getClassName({ i, j }))

                var CellClassName = getClassName({ i, j })
                var elCell = document.querySelector('.' + CellClassName)
                setNotAllowed(elCell, true)
            }
        }
    }
    finishGame(LOSEHTML)
    return true
}

function finishGame(smileyHtml = LOSEHTML) {
    /**
     * functionality that repeats when game is ended
     */

    // select all td elements and remove onmousedown attr - 
    // not allowing more clicks after loosing the game
    var elTds = document.querySelectorAll('td')
    for (var i = 0; i < elTds.length; i++) {
        setNotAllowed(elTds[i])
    }

    // clears the interval and stops the timer
    clearInterval(gTimer)
    gTimer = null
    // set isOn to false (game ended)
    gGame.isOn = false
    // render lose smiley image
    renderSmiley(smileyHtml)
}

function checkWin(board) {
    /**
     * Game ends when all mines are marked, 
     * and all the other cells are shown - than declare that the player has won the game
     */
    var totalCount = 0
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var currCell = gBoard[i][j]

            // player cannot win yet if the board includes 'friendly' cells that are not shown
            // player cannot win yet if the board includes 'friendly' cells that are marked as suspicious by a flag
            if ((!currCell.isMine && !currCell.isShown)
                || (!currCell.isMine && currCell.isMarked)) return false
            // increase total count when player marked correctly a mine, or revealed cells without being exploded
            if ((currCell.isMine && currCell.isMarked)
                || (!currCell.isMine && currCell.isShown)) totalCount++
        }
    }

    if (totalCount + gGame.minesRevealedCount === gLevel.SIZE ** 2) {
        console.log('You Won!')

        finishGame(WINHTML)
        return true
    }
    return false
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

            // not shown or marked (by a flag) cell
            if (!currCell.isShown && !currCell.isMarked) {
                currCell.isShown = true
                gGame.friendlyShownCount++
                // match img element within a relevant class name, using a selector
                var CellClassName = getClassName({ i, j })

                var elCell = document.querySelector('.' + CellClassName)
                var elCellImg = elCell.querySelector('img')
                // var elCellImg = document.querySelector('.' + CellClassName + ' img')

                setNotAllowed(elCell)
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

function decreaseLives() {
    /**
     * updates lives after clicking a mine and render updated lives count to html
     */
    // updates lives remain count in the game model
    gGame.lifeRemainCount--
    // update lives count inside the element's innerText
    var elLivesCount = document.querySelector('span.lives')
    elLivesCount.innerText = `Lives: ${gGame.lifeRemainCount}\t`
}

function flashHint() {
    /** show a hint*/
    var elHint = document.querySelector('span.hints')
    if (gGame.hintsRemainCount > 0) {
        gGame.hintsRemainCount--
        showRadnomCell()
    } else {
        elHint.removeAttribute('onmousedown')
    }
    elHint.innerText = `Hints: ${gGame.hintsRemainCount}\t`
}

function showRadnomCell() {
    /**
     * show random cell for 1 second
     */
    var emptyCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[i][j]
            if (!currCell.isMine && !currCell.isMarked && !currCell.isShown) {
                emptyCells.push({ i, j })
            }
        }
    }
    if (emptyCells) {
        var randCell = getRandomInt(0, emptyCells.length)
        var CellClassName = getClassName(emptyCells[randCell])
        var elCellImg = document.querySelector('.' + CellClassName + ' img')

        elCellImg.hidden = false
        setTimeout(function () {
            elCellImg.hidden = true
        }, 1000);
    }

}

function renderGameDetails() {
    /**
     * renders to html some game details
     */
    // reset lives count
    var elLivesCount = document.querySelector('span.lives')
    elLivesCount.innerText = `Lives: ${gGame.lifeRemainCount}\t`

    // reset safe clicks count
    var elSafeClick = document.querySelector('span.safe-clicks')
    elSafeClick.innerText = `Safe Clicks: ${gGame.safeClicksRemainCount}\t`

    // reset hints count
    var elHint = document.querySelector('span.hints')
    elHint.innerText = `Hints: ${gGame.hintsRemainCount}\t`

    // resets represented time on web page (html)
    resetTimeHtml()
}

function resetTimeHtml() {
    /**reset time and renders to an html element */
    // update time inside the element's innerText
    var elTime = document.querySelector('span.time')
    elTime.innerText = `Time: ${0}`
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

function setNotAllowed(elCell, isMine = false) {
    /**
     * set element's cursor style to not allowed 
     * and remove attr 'onmousedown'
     */
    elCell.removeAttribute('onmousedown')
    // change cursor to not allowed
    elCell.style.cursor = 'not-allowed'

    // selector to match img element within clicked td element
    var elCellImg = (isMine) ? elCell.querySelector('img.mine') : elCell.querySelector('img')

    if (elCellImg) {
        // display content of the Cell (remove hidden attr)
        elCellImg.removeAttribute('hidden')
        // change mine background to a red shade
        if (isMine) elCell.style.backgroundColor = 'rgba(209, 33, 33, 0.663)'
    }
}
