import React, { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';
import "./Layout.css";

function Layout() {
  const socketRef = useRef(null);
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    const socketInstance = io.connect('http://127.0.0.1:5000/');

    socketInstance.on('connect', () => {
      console.log('Connected to server');
      socketInstance.emit('join_game');
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    socketInstance.on('update_game', (data) => {
      console.log('Received updated game state:', data.state);
      setGameState(data.state);
    });

    socketRef.current = socketInstance;

    return () => {
      if (socketInstance) {
        socketInstance.emit('leave_game');
        socketInstance.disconnect();
      }
    };
  }, []);


  const classList = ["absent", "present", "correct"];

  var classIndex = { absent: 0, present: 1, correct: 2 };
  let col = 1;
  let maxCol = 5;

  const getPatternCode = (color) => {
    return classIndex[color].toString();
  };

  const processInput = (e) => {
    if ("KeyA" <= e.code && e.code <= "KeyZ") {
      if (col <= maxCol) {
        let specifiedTile = document.getElementById(
          "tile".concat(col.toString())
        );
        console.log(e.code);
        specifiedTile.textContent = e.code[3];
        col++;
      }
    } else if (e.code === "Backspace") {
      if (col > 1) {
        let specifiedTile = document.getElementById(
          "tile".concat((col - 1).toString())
        );
        specifiedTile.textContent = " ";
        col--;
      }
    } else if (e.code === "Restart") {
      handleRestart();
    } else if (e.code == "Enter") {
      const handleEnter = async () => {
        let patternEntered = true;
        for (let i = 1; i <= maxCol; i++) {
          if (
            document.getElementById("tile".concat(i.toString())).className ===
            "empty"
          )
            patternEntered = false;
        }

        if (col - 1 == 5 && patternEntered) {
          let userGuess = "";
          let userPatern = "";
          let updateMes = document.getElementById("updateMessage").children[0];
          updateMes.textContent = "";

          let loadDiv = document.getElementById("loading");
          loadDiv.classList.remove("hidden");
          loadDiv.classList.add("visible");

          let ranks = document.getElementsByClassName("rank");
          let guesses = document.getElementsByClassName("guess");
          let bitss = document.getElementsByClassName("bits");
          for (let j = 0; j < 3; j++) {
            ranks[j].textContent = "";
            guesses[j].textContent = "";
            bitss[j].textContent = "";
          }

          for (let i = 1; i <= maxCol; i++) {
            let t = document.getElementById("tile".concat(i.toString()));
            var currClass = t.className;
            t.classList.remove(currClass);
            t.classList.add("empty");
            userPatern += getPatternCode(currClass);
            userGuess += t.textContent.toString();
            t.textContent = " ";
          }
          col = 1;

          let resultSection = document.getElementById("resultsWrapper");

          // Send to API endpoint
          
          let res = await handlePlayRound(userGuess.toLowerCase(), userPatern);
          res = res['state']['top_three']
          console.log(res);
          let total = res.length;

          if (total === 1) {
            guesses[0].textContent =
              "The answer is " + res[0][0].toUpperCase() + "!";
            guesses[1].textContent =
              "Hit RESTART or refresh the page to play again.";
          } else if (total === 0) {
            guesses[1].textContent =
              "Something has gone wrong:( Please RESTART.";
          } else {
            let count = 0;
            for (var i in res) {
              console.log(i)
              let w = res[i][0];
              let r = res[i][1].toString();

              ranks[count].textContent = (count + 1).toString() + ".";
              guesses[count].textContent = w.toUpperCase();
              bitss[count].textContent = r.substr(0, 5) + " Bits";

              count = count + 1;
            }
          }
          loadDiv.classList.remove("visible");
          loadDiv.classList.add("hidden");

          resultSection.classList.remove("hidden");
          resultSection.classList.add("visible");
        } else {
          let updateMes = document.getElementById("updateMessage").children[0];
          if (patternEntered)
            updateMes.textContent = "Please enter a 5 letter word.";
          else updateMes.textContent = "The pattern specified is invalid.";
        }
      }
      handleEnter();
    }
  };


  const handlePlayRound = async (guess, pattern) => {
    console.log('Calling handlePlayRound with:', guess, pattern);
  
    return new Promise((resolve, reject) => {
      const socket = socketRef.current;
  
      if (!socket) {
        reject(new Error('Socket not available'));
      }
  
      // Listen for the 'update_game' event only once
      socket.once('update_game', (data) => {
        resolve(data);
      });
  
      // Emit the 'game_action' event
      socket.emit('game_action', { action: 'play_round', guess, pattern });
    });
  };
  
  const handleRestart = () => {
    const socket = socketRef.current;
    
    if (socket) {
      socket.emit('leave_game');
      window.location.reload();
    }
  };

  

  useEffect(() => {
    document.addEventListener("keydown", processInput);
    return () => {
      document.removeEventListener("keydown", processInput);
    };
  }, []);

  useEffect(() => {
    for (let i = 1; i <= maxCol; i++) {
      let t = document.getElementById("tile".concat(i.toString()));
      t.addEventListener("click", function (event) {
        var currClass = t.className;
        t.classList.remove(currClass);
        if (currClass === "empty") currClass = "correct";
        t.classList.add(classList[(classIndex[currClass] + 1) % 3]);
      });
    }

    let keyboardRows = document.getElementsByClassName("keyboardRow");

    for (let i = 0; i < keyboardRows.length; i++) {
      let currRow = keyboardRows[i].children;

      for (let j = 0; j < currRow.length; j++) {
        let key = currRow[j];

        key.addEventListener("click", handleKeyClick);
      }
    }

    return () => {
      for (let i = 1; i <= maxCol; i++) {
        let t = document.getElementById("tile".concat(i.toString()));
        t.removeEventListener("click", function (event) {
          var currClass = t.className;
          t.classList.remove(currClass);
          if (currClass === "empty") currClass = "correct";
          t.classList.add(classList[(classIndex[currClass] + 1) % 3]);
        });
      }

      for (let i = 0; i < keyboardRows.length; i++) {
        let currRow = keyboardRows[i].children;

        for (let j = 0; j < currRow.length; j++) {
          let key = currRow[j];

          // Remove the event listener
          key.removeEventListener("click", handleKeyClick);
        }
      }
    };
  }, []);

  function handleKeyClick() {
    let e = { code: this.id };
    processInput(e);
  }

  return (
    <>
      <div id="titleContainer">
        <h1 class="title">Wordle Assistant</h1>
      </div>
      <hr></hr>
      <div id="instructions">
        <p>
          Enter your guess, then click on each tile to input the pattern.
          <br></br>
          Hit enter to send the query.
        </p>
      </div>
      <div id="board">
        <div id="tileContainer">
          <div id="tile1" class="empty"></div>
          <div id="tile2" class="empty"></div>
          <div id="tile3" class="empty"></div>
          <div id="tile4" class="empty"></div>
          <div id="tile5" class="empty"></div>
        </div>
      </div>
      <div id="keyboard">
        <div id="updateMessage">
          <p class="updateText"></p>
        </div>
        <div class="keyboardRow">
          <div id="KeyQ" class="keyTile">
            Q
          </div>
          <div id="KeyW" class="keyTile">
            W
          </div>
          <div id="KeyE" class="keyTile">
            E
          </div>
          <div id="KeyR" class="keyTile">
            R
          </div>
          <div id="KeyT" class="keyTile">
            T
          </div>
          <div id="KeyY" class="keyTile">
            Y
          </div>
          <div id="KeyU" class="keyTile">
            U
          </div>
          <div id="KeyI" class="keyTile">
            I
          </div>
          <div id="KeyO" class="keyTile">
            O
          </div>
          <div id="KeyP" class="keyTile">
            P
          </div>
        </div>
        <div class="keyboardRow">
          <div id="KeyA" class="keyTile">
            A
          </div>
          <div id="KeyS" class="keyTile">
            S
          </div>
          <div id="KeyD" class="keyTile">
            D
          </div>
          <div id="KeyF" class="keyTile">
            F
          </div>
          <div id="KeyG" class="keyTile">
            G
          </div>
          <div id="KeyH" class="keyTile">
            H
          </div>
          <div id="KeyJ" class="keyTile">
            J
          </div>
          <div id="KeyK" class="keyTile">
            K
          </div>
          <div id="KeyL" class="keyTile">
            L
          </div>
        </div>
        <div class="keyboardRow">
          <div id="Enter" class="keyEnter">
            Enter
          </div>
          <div id="KeyZ" class="keyTile">
            Z
          </div>
          <div id="KeyX" class="keyTile">
            X
          </div>
          <div id="KeyC" class="keyTile">
            C
          </div>
          <div id="KeyV" class="keyTile">
            V
          </div>
          <div id="KeyB" class="keyTile">
            B
          </div>
          <div id="KeyN" class="keyTile">
            N
          </div>
          <div id="KeyM" class="keyTile">
            M
          </div>
          <div id="Backspace" class="keyTile">
            ⌫
          </div>
        </div>
        <div class="keyboardRow">
          <div id="Restart" class="keyRestart">
            ⟳ Restart
          </div>
        </div>
      </div>
      <div id="loadingWrap">
        <div id="loading" class={`custom-loader hidden`}></div>
      </div>
      <div id="resultsWrapper" class="hidden">
        <div id="resultRow">
          <div id="rowElement" class="rank"></div>
          <div id="rowElement" class="guess"></div>
          <div id="rowElement" class="bits"></div>
        </div>
        <div id="resultRow">
          <div id="rowElement" class="rank"></div>
          <div id="rowElement" class="guess"></div>
          <div id="rowElement" class="bits"></div>
        </div>
        <div id="resultRow">
          <div id="rowElement" class="rank"></div>
          <div id="rowElement" class="guess"></div>
          <div id="rowElement" class="bits"></div>
        </div>
      </div>
    </>
  );
}

export default Layout;
