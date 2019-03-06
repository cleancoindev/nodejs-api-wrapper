# Node.js API wrapper for EtherMium

Download the `EtherMium.js` file and add it to your node.js project.

```javascript
const EtherMiumApi = require('./EtherMium.js');

EtherMiumApi.init(<private key>);

// getting tickers
var tickers = await EtherMiumApi.getTickers();
console.log(JSON.stringify(tickers));

// get order book for HOT/ETH
// ETH address is always `0x0000000000000000000000000000000000000000`
var ob = await EtherMiumApi.getTokenOrderBook('0x6c6EE5e31d828De241282B9606C8e98Ea48526E2', '0x0000000000000000000000000000000000000000');
console.log(JSON.stringify(ob));
```

Check `example.js` for an example of a market making bot using the wrapper.
