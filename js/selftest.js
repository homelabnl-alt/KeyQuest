/* Node-friendly copy of scoring math used by the game. */
function calcWpm(correctChars, elapsedMs) {
  if (!elapsedMs || elapsedMs <= 0) return 0;
  const minutes = elapsedMs / 60000;
  return (correctChars / 5) / minutes;
}
function calcAccuracy(correct, incorrect) {
  const total = correct + incorrect;
  if (total <= 0) return 100;
  return (correct / total) * 100;
}
function starsFromAccuracy(acc) {
  if (acc >= 98) return 3;
  if (acc >= 92) return 2;
  if (acc >= 85) return 1;
  return 0;
}

const tests = [
  ["wpm 60 from 300 chars in 60s", Math.abs(calcWpm(300, 60000) - 60) < 1e-9],
  ["wpm 0 when no time", calcWpm(10, 0) === 0],
  ["accuracy 90", Math.abs(calcAccuracy(9, 1) - 90) < 1e-9],
  ["accuracy empty is 100", calcAccuracy(0, 0) === 100],
  ["stars 0 under 85", starsFromAccuracy(84) === 0],
  ["stars 1 at 85", starsFromAccuracy(85) === 1],
  ["stars 2 at 92", starsFromAccuracy(92) === 2],
  ["stars 3 at 98", starsFromAccuracy(98) === 3]
];

let failed = 0;
tests.forEach(([name, ok]) => {
  if (!ok) {
    failed += 1;
    console.error("FAIL", name);
  } else {
    console.log("PASS", name);
  }
});
process.exit(failed ? 1 : 0);
