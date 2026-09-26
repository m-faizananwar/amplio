// Where the stats row's pieces sit on wide frames. The comp was drawn with
// two three-digit numbers; real counts are narrower or wider, so everything
// after a number moves by the difference and the rhythm holds.
const DIGIT_EM = 0.58; // Inter 200's figures, on average
const OTHER_EM = 0.3; // separators: comma, thin space, full stop
const NUM_U = 100; // the numbers' font size in comp units
const COMP_DIGITS = 3;

const COMP = { num1: 64, lbl1: 295, slash: 418, num2: 480, lbl2: 716 };
const SX = { num1: 1, num2: 0.9858 };

function width(text: string, sx: number) {
  let em = 0;
  for (const ch of text) em += /\d/.test(ch) ? DIGIT_EM : OTHER_EM;
  return em * NUM_U * sx;
}

export function statLayout(first: string, second: string) {
  const shift1 = width(first, SX.num1) - COMP_DIGITS * DIGIT_EM * NUM_U * SX.num1;
  const shift2 = width(second, SX.num2) - COMP_DIGITS * DIGIT_EM * NUM_U * SX.num2;
  return {
    num1: COMP.num1,
    lbl1: COMP.lbl1 + shift1,
    slash: COMP.slash + shift1,
    num2: COMP.num2 + shift1,
    lbl2: COMP.lbl2 + shift1 + shift2,
  };
}
