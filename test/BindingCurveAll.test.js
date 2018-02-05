
let types = ['Exp', 'Lin', 'Sqrt'];
// let types = ['Exp'];
// let types = [];

types.forEach(type => {
  require('./BondingCurve.test')(type);
});
