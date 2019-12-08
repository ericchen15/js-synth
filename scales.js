// JI scales
const harmonicScale = [9/8, 10/8, 11/8, 12/8, 13/8, 14/8, 15/8, 16/8];
const lambdaScale = [25/21, 9/7, 7/5, 5/3, 9/5, 15/7, 7/3, 25/9, 3/1];
const wellTunedScale = [567/512, 9/8, 147/128, 21/16, 1323/1024, 189/128, 3/2, 49/32, 7/4, 441/256, 63/32, 2/1];
const fiveLimitScale = [16/15, 9/8, 6/5, 5/4, 4/3, 45/32, 3/2, 8/5, 5/3, 9/5, 15/8, 2/1];
const experimentalScale = [9/8, 7/6, 6/5, 5/4, 4/3, 7/5, 3/2, 8/5, 5/3, 7/4, 15/8, 2.0001];

// ET scales
const tet12Scale = createEtScale(2, 12);
const tet10Scale = createEtScale(2, 10);

// EDO scales
const edo31ExperimentalScale = createEdoScale(2, 31,
  [2, 3, 5, 7, 8, 10, 13, 15, 18, 20, 21, 23, 25, 26, 28, 31]);
const blackjackScale = createEdoScale(2, 72,
  [5, 7, 12, 14, 19, 21, 23, 28, 30, 35, 37, 42, 44, 49, 51, 56, 58, 63, 65, 70, 72]);
const pajara10Scale = createEdoScale(2, 22,
  [2, 4, 7, 9, 11, 13, 15, 18, 20, 22]);

// temperaments
const meantoneScale = createGeneratorScale(2, QUARTER_COMMA_FIFTH, 12, 3);
const topMeantone12Scale = createGeneratorScale(centsToRatio(1201.7), centsToRatio(1899.26), 12, 3);
const werckmeisterScale = [90.2, 192.2, 294.1, 390.2, 498.0, 588.3, 696.1, 792.2, 888.3, 996.1, 1092.2, 1200]
  .map(centsToRatio);
