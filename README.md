# soccer-command
Step-by-step creation of a football team in the form of the implementation of various intelligent systems for participation in the tournament (https://rcsoccersim.github.io/).

All scripts are run using the command: `node ./app.js`

## 📐 Player positioning
Based on the known coordinates of the flags, the location of the player on the football field is determined using mathematical calculations.

Directory: `./player-positioning`

## 🏃 Player movement
Using the calculated coordinates of the players, the players move along the flags specified in the code and score the ball into the goal (taking into account calculation errors).

Directory: `./player-movement`

## 🌳 Decision tree
The attacking players form a triangle-shaped unit and move along a given route (the ultimate goal is to score the ball into the goal), and the goalkeeper protects the right goal from the attacking players.
Player behavior is selected using decision trees.

Directory: `./decision-tree`

## 👟 Coordination of actions
Decision trees are used to coordinate the actions of players on one team to complete a pass and then score the ball into the goal.

Directory: `./coordination`

## 🤖 Temporal automate
A temporal automate is interpreted into the implementation of the soccer team, ensuring coordination of the attacking players and the goalkeeper.

Directory: `./temporal-automate`

## 🏁 Multi-level controllers (final version)
The final version of the team used multi-level controllers, each of which was responsible for its own task (calculating coordinates, determining a goal, making decisions, moving, etc.).

Directory: `./controllers`

# 🎖️ Result
During the competition between students of the Department of MOEVM of St. Petersburg Electrotechnical University, this team took second place.
