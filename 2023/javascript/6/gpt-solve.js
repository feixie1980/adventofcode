// Simulating the reading of a file with hardcoded values based on the corrected example provided earlier
const raceTime = 35937366;
const recordDistance = 212206012011044;

// Function to calculate the number of ways to beat the record for the single race
function calculateWaysToWinSingleRace(raceTime, recordDistance) {
  let waysToWin = 0;

  // We start the loop at buttonHoldTime = 1 since holding the button for 0 milliseconds won't move the boat.
  // We loop until raceTime - 1 since holding the button for the entirety of the race time will also result in 0 distance.
  for (let buttonHoldTime = 1; buttonHoldTime < raceTime; buttonHoldTime++) {
    const distance = buttonHoldTime * (raceTime - buttonHoldTime);
    if (distance > recordDistance) {
      waysToWin++;
    }
  }

  return waysToWin;
}

// Calculate the result using the provided example race time and distance
const result = calculateWaysToWinSingleRace(raceTime, recordDistance);
console.log(result); // Output the total number of ways to win the race
