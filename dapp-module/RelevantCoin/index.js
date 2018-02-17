
const RelevantCoinArtifacts = require('../../build/contracts/RelevantCoin.json')

const Web3 = require('web3')
const BN = require('bignumber.js')
const MicroEvent = require("microevent");

class RelevantCoin {
  constructor (options) {

    this.relevantCoin = null

    this.pollingInterval = null
    this.account = null
    this.unlocked = false
    this.balanceWei = 0
    this.balance = 0

    this.genesisBlock = 0
    this.loading = false
    this.options = {
      address: 'REPLACE_WITH_CONTRACT_ADDRESS',
      readonlyRpcURL: 'https://mainnet.infura.io',
      autoInit: true,
      getPastEvents: false,
      watchFutureEvents: false,
      connectionRetries: 3
    }
    Object.assign(this.options, options)
  }

  // hello world : )
  helloWorld () {
    console.log('hello world!')
  }

  /*
   * Connect
   */


  deployContract () {
    if (!this.options.address || this.options.address === 'REPLACE_WITH_CONTRACT_ADDRESS') return new Error('Please provide a contract address')
    this.relevantCoin = new global.web3.eth.Contract(RelevantCoinArtifacts.abi, this.options.address)
  }

  /*
   * Not Yet Implemented vvvv
   */

  getGenesisBlock () {
    return new Promise((resolve, reject) => {
      resolve()
    })
  }

  getPastEvents () {
    return new Promise((resolve, reject) => {
      resolve()
    })
  }

  watchFutureEvents () {
    return new Promise((resolve, reject) => {
      resolve()
    })
  }




  /*
   *
   * Constant Functions
   *
   */

  name () {
    return this.relevantCoin.methods.name().call()
      .then((resp) => {
      console.log(resp)
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  inflationSupply () {
    return this.relevantCoin.methods.inflationSupply().call()
      .then((resp) => {
      console.log(resp)
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  reserveRatio () {
    return this.relevantCoin.methods.reserveRatio().call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  totalSupply () {
    return this.relevantCoin.methods.totalSupply().call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  INITAL_BALANCE () {
    return this.relevantCoin.methods.INITAL_BALANCE().call()
      .then((resp) => {
      console.log(resp)
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  virtualSupply () {
    return this.relevantCoin.methods.virtualSupply().call()
      .then((resp) => {
      console.log(resp)
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  calculatePurchaseReturn (_supply, _connectorBalance, _connectorWeight, _depositAmount) {
    return this.relevantCoin.methods.calculatePurchaseReturn(new BN(_supply, 10), new BN(_connectorBalance, 10), new BN(_connectorWeight, 10), new BN(_depositAmount, 10)).call()
      .then((resp) => {
      console.log(resp)
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  INITIAL_SUPPLY () {
    return this.relevantCoin.methods.INITIAL_SUPPLY().call()
      .then((resp) => {
      console.log(resp)
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  decimals () {
    return this.relevantCoin.methods.decimals().call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  calculateSaleReturn (_supply, _connectorBalance, _connectorWeight, _sellAmount) {
    return this.relevantCoin.methods.calculateSaleReturn(new BN(_supply, 10), new BN(_connectorBalance, 10), new BN(_connectorWeight, 10), new BN(_sellAmount, 10)).call()
      .then((resp) => {
      console.log(resp)
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  version () {
    return this.relevantCoin.methods.version().call()
      .then((resp) => {
      console.log(resp)
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  rewardPool () {
    return this.relevantCoin.methods.rewardPool().call()
      .then((resp) => {
      console.log(resp)
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  intervalsSinceLastInflationUpdate () {
    return this.relevantCoin.methods.intervalsSinceLastInflationUpdate().call()
      .then((resp) => {
      console.log(resp)
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  balanceOf (_owner) {
    return this.relevantCoin.methods.balanceOf(_owner).call()
    .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  INITIAL_PRICE () {
    return this.relevantCoin.methods.INITIAL_PRICE().call()
      .then((resp) => {
      console.log(resp)
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  owner () {
    return this.relevantCoin.methods.owner().call()
      .then((resp) => {
      console.log(resp)
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  timeInterval () {
    return this.relevantCoin.methods.timeInterval().call()
      .then((resp) => {
      console.log(resp)
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  symbol () {
    return this.relevantCoin.methods.symbol().call()
      .then((resp) => {
      console.log(resp)
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  poolBalance () {
    return this.relevantCoin.methods.poolBalance().call()
      .then((resp) => {
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  HOURLY_INFLATION () {
    return this.relevantCoin.methods.HOURLY_INFLATION().call()
      .then((resp) => {
      console.log(resp)
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  inflationRatePerInterval () {
    return this.relevantCoin.methods.inflationRatePerInterval().call()
      .then((resp) => {
      console.log(resp)
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  CURVE_RATIO () {
    return this.relevantCoin.methods.CURVE_RATIO().call()
      .then((resp) => {
      console.log(resp)
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  virtualBalance () {
    return this.relevantCoin.methods.virtualBalance().call()
      .then((resp) => {
      console.log(resp)
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  allowance (_owner, _spender) {
    return this.relevantCoin.methods.allowance(_owner, _spender).call()
      .then((resp) => {
      console.log(resp)
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  TIME_INTERVAL () {
    return this.relevantCoin.methods.TIME_INTERVAL().call()
      .then((resp) => {
      console.log(resp)
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  gasPrice () {
    return this.relevantCoin.methods.gasPrice().call()
      .then((resp) => {
      console.log(resp)
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }
  getBalanceInEth (addr) {
    return this.relevantCoin.methods.getBalanceInEth(addr).call()
      .then((resp) => {
      console.log(resp)
      return resp
    }).catch((err) => {
      console.error(err)
    })
  }

  /*
   *
   * Transaction Functions
   *
   */

  approve (_spender, _value) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.relevantCoin.methods.approve(_spender, new BN(_value, 10)).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
      .then((resp) => {
      this.loading = false
      console.log(resp)
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  transferFrom (_from, _to, _value) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.relevantCoin.methods.transferFrom(_from, _to, new BN(_value, 10)).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
      .then((resp) => {
      this.loading = false
      console.log(resp)
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  computeInflation () {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.relevantCoin.methods.computeInflation().send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
      .then((resp) => {
      this.loading = false
      console.log(resp)
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  decreaseApproval (_spender, _subtractedValue) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.relevantCoin.methods.decreaseApproval(_spender, new BN(_subtractedValue, 10)).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
      .then((resp) => {
      this.loading = false
      console.log(resp)
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  transfer (_to, _value) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.relevantCoin.methods.transfer(_to, new BN(_value, 10)).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
      .then((resp) => {
      this.loading = false
      console.log(resp)
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  mintTokens (_to) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.relevantCoin.methods.mintTokens(_to).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
      .then((resp) => {
      this.loading = false
      console.log(resp)
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  setGasPrice (_gasPrice) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.relevantCoin.methods.setGasPrice(new BN(_gasPrice, 10)).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
      .then((resp) => {
      this.loading = false
      console.log(resp)
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  increaseApproval (_spender, _addedValue) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.relevantCoin.methods.increaseApproval(_spender, new BN(_addedValue, 10)).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
      .then((resp) => {
      this.loading = false
      console.log(resp)
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  buy (buyAmount, account) {
    console.log(buyAmount, account)
    if (!account) return Promise.reject(new Error('Unlock Account'))
    buyAmount = Web3.utils.toWei(buyAmount)

    return this.relevantCoin.methods.buy().send({from: account, value: new BN(buyAmount, 10).toString(10)})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
    .then((resp) => {
      this.loading = false
      console.log(resp)
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  sell (sellAmount, account) {
    if (!account) return Promise.reject(new Error('Unlock Account'))
    console.log('sell')
    return this.decimals().then((decimals) => {
      decimals = Web3.utils.padRight('10', parseInt(decimals, 10));
      console.log(decimals.toString())
      sellAmount = new BN(sellAmount).times(decimals).toString()
      console.log(sellAmount)
      // .mul(decimals.toString()).toString()
      return this.relevantCoin.methods.sell(new BN(sellAmount, 10)).send({from: account})
      .on('transactionHash', (hash) => {
        console.log(hash)
        this.loading = true
      })
      .then((resp) => {
        this.loading = false
        console.log(resp)
        return resp
      })
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }
  transferOwnership (newOwner) {
    if (!this.account) return Promise.reject(new Error('Unlock Account'))
    return this.relevantCoin.methods.transferOwnership(newOwner).send({from: this.account})
    .on('transactionHash', (hash) => {
      console.log(hash)
      this.loading = true
    })
      .then((resp) => {
      this.loading = false
      console.log(resp)
      return resp
    }).catch((err) => {
      this.loading = false
      console.error(err)
    })
  }

  /*
   *
   * Events
   *
   */


}
MicroEvent.mixin(RelevantCoin);

module.exports = RelevantCoin
