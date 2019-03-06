const 	EtherMiumApi = require('./EtherMium.js'),
		BigNumber 	= require('bignumber.js');


// This is an exampla of a basic Market Making bot
// You set up a list of tokens and the markup levels for buy and sell orders
// The bot will post one order to each side of the orderbook according to these settings
class EtherMiumBot {


	constructor()
	{
		// The private key to your wallet.
		// If you use this module inside a repository, we recommend using a 
		// separate .yaml file to store your private key and adding it
		// to the .gitignore file so that the private key does not end up
		// in unprotected environments.
		//
		// The private key is the secret value associated with your Ethereum wallet,
		// if you don't have a wallet simply visit https://ethermium.com/wallet to create
		// one. Once created top up your wallet and use the interface to deposit funds to 
		// the contract.
		this.privateKey = '...';

		EtherMiumApi.init(this.privateKey);


		// the list of tokens you want to market make for
		// add as many tokens as you like using the address and the decimals number
		// you can also update this list dynamically using the tickerList and selecting
		// tokens with high spreads
		this.tokensList = [
			['0xEA38eAa3C86c8F9B751533Ba2E562deb9acDED40', '18'], // FUEL (18 decimals) 
			['0xA4e8C3Ec456107eA67d3075bF9e3DF3A75823DB0', '18']  // LOOM (18 decimals) 
		];

		// markup for orders on the buy side in fractional form
		// 0.05 means 5%
		this.buyOrderMarkUp = 0.05;


		// markup for orders on the sell side in fractional form
		// 0.05 means 5%
		this.sellOrderMarkUp = 0.05;

		// the number of blocks after which the order will expire and will be 
		// automatically canceled, currently 1 block is mined approx every 12 seconds
		// so 10 blocks means approx 120 seconds (or 2 minutes)
		// by setting an expiration for your orders you don't need to bother to cancel orders
		// as they will cancel automatically
		this.orderLife = 10;


		// the value of the posted order in ETH terms
		// if 0.2 it means that the bot will post orders of 0.2ETH in value to both buy
		// and sell sides
		this.orderEthValue = 0.2;

		// the address of the ETH token
		this.ethAddress = '0x0000000000000000000000000000000000000000';

		this.initBot();
	}

	// this function will run a cycle every 5 seconds
	// calling the sendOrders() function
	async intiBot()
	{
		while (true)
		{
			try {
				await this.sendOrders();
			}
			catch (error)
			{
				console.error(`[intiBot] Error=${error.message}`);
			}

			await this.sleep(5000);
		}
	}


	// goes through the token list
	// checks if there are active buy/sell orders
	// places orders if no active orders found
	// all orders have an expiration block based on the orderLife value 
	// so we don't have to bother to cancel them
	async sendOrders()
	{
		var currentBlock = await EtherMiumApi.getCurrentBlockNumber();
		try {
			for (let token of this.tokensList)
			{
				var found_buy_order = false;
				var found_sell_order = false;

				// check if there active orders
				var orders = await EtherMiumApi.getMyTokenOrders(token[0]);

				for (let order of orders)
				{
					if (order.is_buy)
					{
						found_buy_order = true;
					}
					else
					{
						found_sell_order = true;
					}
				}

				if (found_buy_order && found_sell_order) continue;

				// get the latest ticker for the token
				var ticker = await EtherMiumApi.getTickers(token[0], this.ethAddress);

				if (!found_buy_order)
				{
					var balance = await EtherMiumApi.getMyBalance(this.ethAddress);
					if (balance.decimal_adjusted_balance - balance.decimal_adjusted_in_orders < 0.2)
					{
						console.error(`[updateOrders] Insufficient balance to place BUY order`);
					}

					var highestBid = ticker.highestBid;

					var orderPrice = new BigNumber(highestBid).times(1-this.buyOrderMarkUp);
					var amount = new BigNumber(this.orderEthValue).div(orderPrice).toFixed(8);

					var result = await EtherMiumApi.placeLimitOrder(
						'BUY', 
						orderPrice.toFixed(0), 
						amount, 
						token[0], 
						token[1], 
						this.ethAddress, 
						18, 
						currentBlock+this.orderLife
					);
				}

				if (!found_sell_order)
				{
					var balance = await EtherMiumApi.getMyBalance(token[0]);
					var lowestAsk = ticker.lowestAsk;
					if ((balance.decimal_adjusted_balance - balance.decimal_adjusted_in_orders)*lowestAsk < 0.2)
					{
						console.error(`[updateOrders] Insufficient balance to place SELL order`);
					}

					var orderPrice = new BigNumber(lowestAsk).times(1+this.sellOrderMarkUp);
					var amount = new BigNumber(this.orderEthValue).div(orderPrice).toFixed(8);

					var result = await EtherMiumApi.placeLimitOrder(
						'SELL', 
						orderPrice.toFixed(0), 
						amount, 
						token[0], 
						token[1], 
						this.ethAddress, 
						18, 
						currentBlock+this.orderLife
					);
				}
			}
		}
		catch (error)
		{
			console.error(`[updateOrders] Error=${error.message}`);
		}
	}


	sleep(ms)
	{
	    return new Promise(resolve=>{
	        setTimeout(function () {
	        	resolve();
	        },ms)
	    })
	}
}

module.exports = new EtherMiumBot();