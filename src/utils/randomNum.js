// export default function randomNum(minNum, maxNum) {
//   return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
// }
export default function randomNum(minNum, maxNum, float = 1) {
  const pow = Math.pow(10, float);
  minNum = minNum * pow;
  maxNum = maxNum * pow;
  return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10) / pow;
}
