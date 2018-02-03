
let types = ['Exp', 'Lin', 'Sqrt'];
// let types = ['Exp'];

types.forEach(type => {
  require('./BondingCurve.test')(type);
});
