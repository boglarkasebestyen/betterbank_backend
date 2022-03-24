'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); 
};
    


module.exports = {

    deposit: async(ctx) => {

        const transaction = JSON.parse(ctx.request.body); 
        ctx.response.status = 200;

        if (!transaction.amount || !transaction.to || !transaction.from) {
            return {"error": "invalid amount"};
        }
        
        const newtransaction = await strapi.services.transactions.create(transaction);
        if (!newtransaction) {
            return {"error": "something went wrong"};
        } 
        return {}       
    },

    balance: async(ctx) => {
        const user = JSON.parse(ctx.request.body); 
        ctx.response.status = 200;

        if (!user.username) {
            return {"error": "No username provided!"};            
        }

        const incoming = await strapi.services.transactions.find({"to":user.username});
        if (!incoming) {
            return {"error": "Could not query transactions!"};
        }

        let incomingSum = 0;
        for (var i = 0; i < incoming.length; ++i) {
            incomingSum += parseFloat(incoming[i].amount);
        }

        const outgoing = await strapi.services.transactions.find({"from":user.username});
        if (!outgoing) {
            return {"error": "Could not query transactions!"};
        }

        let outgoingSum = 0;
        for (var i = 0; i < outgoing.length; ++i) {
            if (outgoing[i].to !== user.username) {
                outgoingSum += parseFloat(outgoing[i].amount);
            }
        }

        let balance = incomingSum - outgoingSum;
        return {"balance": balance};
    },

    withdraw: async(ctx) => {
        const transaction = JSON.parse(ctx.request.body); 
        if (!transaction.amount || !transaction.to || !transaction.from) {
            return {"error": "Missing input"};
        }
        ctx.response.status = 200;

        transaction.amount = -transaction.amount;
        const newtransaction = await strapi.services.transactions.create(transaction);

        if (!newtransaction) {
            return {"error": "Invalid amount"};
        } 

        return {}
    },

    transfer: async(ctx) => {
        const transaction = JSON.parse(ctx.request.body); 
        ctx.response.status = 200;

        const targetUsers = await strapi.services.newusers.find({"username": transaction.to});
        if (!transaction.amount || !transaction.to || !transaction.from) {
            return {"error": "Missing input"};
        }


        const newtransaction = await strapi.services.transactions.create(transaction);

        if (!newtransaction) {
            return {"error": "Invalid transaction"};
        } 
        return {}
    },

    alltransactions: async(ctx) => {
        const user = JSON.parse(ctx.request.body); 
        ctx.response.status = 200;

        const allDataTo =  await strapi.services.transactions.find({"to": user.username});
        const allDataFrom = await strapi.services.transactions.find({"from": user.username});

        return allDataFrom.concat(allDataTo);
    },

    invest: async(ctx) => {
        const transaction = JSON.parse(ctx.request.body); 
        ctx.response.status = 200;

        if (!transaction.amount) {
            return {"error": "invalid amount"};
        }
        
        let balanceResponse = await module.exports.balance({
            "request" : { 
                "body" : JSON.stringify({"username" : transaction.to})
            },
            "response" : {
                "status" : 200
            }
        });
        let currentBalance = balanceResponse.balance;

        if (transaction.amount > currentBalance) {
            return {"error" : "Insufficient balance!"};
        }

        let result = getRandomInt(0,1)
        let newAmount = (result == 0) ? -transaction.amount : 2 * transaction.amount;
        transaction.amount = newAmount;
        const newtransaction = await strapi.services.transactions.create(transaction);
        if (!newtransaction) {
            return {"error": "something went wrong"};
        } 
        return {"result": result};  
    }
};

