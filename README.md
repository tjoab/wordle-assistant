# Wordle Assistant
[![Link To App](https://img.shields.io/badge/-Link%20To%20App-blue)](https://tjoab-wordle-assistant.netlify.app/)&nbsp; 
![Netlify Status](https://api.netlify.com/api/v1/badges/739eb0fc-bef0-4ff5-8b61-b3336dd4b481/deploy-status)

A web app built using React.js handling assistant logic through a RESTful API built using Flask and Python.

The API is hosted using PythonAnywhere, while the app itself is hosted on Netlify.

# Summary of Wordle

Wordle is a game that came out not so recently anymore, but gained popularity very quickly when it was released. The premise of the game is to guess what the secret 5 letter word of the day is within 6 guesses. Each time you make a guess, the game reveals a color pattern associated with your guess that serves as a hint to tweak your next guess. 
<br></br>

Suppose your prompt the game with:

`C  R  A  N  E`
<br></br>

And it shows you the following pattern:

![#30a616](https://placehold.co/15x15/30a616/30a616.png)
![#8c8c8c](https://placehold.co/15x15/8c8c8c/8c8c8c.png)
![#8c8c8c](https://placehold.co/15x15/8c8c8c/8c8c8c.png)
![#8c8c8c](https://placehold.co/15x15/8c8c8c/8c8c8c.png)
![#edcc0e](https://placehold.co/15x15/edcc0e/edcc0e.png)
<br></br>

This means that the secret word has a `C` is the same location, an `E` in a location other than were it was in your guess, and no `R`, `A` or `N`. Each of your guesses reveals some new information that you can use to help you make progress in the game.


# How the Assistant Works

The web app makes use of a pattern matching algorithm where **information theory** and the concept of **entropy** are at its core. The fundemental idea is that the best next guess you can make, is the one that reveals the most amount of information. The program ranks 5 letter words based on the amount of information they reveal in the current state of the game. 

Quantifying a concept like information seems complicated but we've actually been doing it for quite a while. Ever heard of a **bit**? That is a unit of information. The app ranks and reports the best three next guesses based on the number of bits &mdash; or the amount of information &mdash; it should reveal should you guess it. In some instances, it can tell you what the answer is before you even guess it.

**Note that at no point does the app have access to Wordle's answer key.**


# How to Use

The assistant is to be used in conjuction with Wordle. 

1. Have both Wordle and the assistant open
2. Make your initial guess on Wordle
3. Type in the same guess into the assistant and specify the pattern that Wordle returned to you; hit enter
4. Let the assistant think; note that on the first guess it may take some time for a response
5. Of the three reported next guess suggestion, select one
6. Enter your chosen next guess into Wordle
7. Report the same guess and the associated pattern returned to you to the assistant
8. Rinse and repeat


