# Node.js API wrapper for EtherMium

Download the `EtherMium.js` file and add it to your node.js project.

Check `example.js` for an example of a market making bot using the wrapper.

### Demo 
```javascript
const EtherMiumApi = require('./EtherMium.js');

EtherMiumApi.init('<private key>', '<wallet address>');

// getting tickers
var tickers = await EtherMiumApi.getTickers();
console.log(JSON.stringify(tickers));

// get order book for HOT/ETH
// ETH address is always `0x0000000000000000000000000000000000000000`
var ob = await EtherMiumApi.getTokenOrderBook('0x6c6EE5e31d828De241282B9606C8e98Ea48526E2', '0x0000000000000000000000000000000000000000');
console.log(JSON.stringify(ob));


// getting all active orders
var active_orders = await EtherMiumApi.getMyTokenOrders();
console.log(JSON.stringify(active_orders));


// getting balances
var balances = await EtherMiumApi.getMyBalance();
console.log(JSON.stringify(balances));


// getting your trades
var trades = await EtherMiumApi.getMyTokenTrades();
console.log(JSON.stringify(trades));



// placing a BUY limit order for HOT/ETH
var result = await EtherMiumApi.placeLimitOrder(
	'BUY', // side BUY or SELL 
	'0.000054', // price
	'100000', // quantity
	'0x6c6EE5e31d828De241282B9606C8e98Ea48526E2', // HOT token address
	18, // HOT decimals
	'0x0000000000000000000000000000000000000000', // ETH address
	18 // ETH decimals
);

```


