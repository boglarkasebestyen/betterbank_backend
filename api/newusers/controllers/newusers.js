'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {


  login: async(ctx) => {
    const user = JSON.parse(ctx.request.body); 
    ctx.response.status = 200;
    const targetUsers = await strapi.services.newusers.find({"username": user.username});

    for (var i = 0; i < targetUsers.length; ++i) {
        let foundUser = targetUsers[i];
        if (foundUser.password === user.password) {
            return {"result": "success", "username" : foundUser.username};  
        }
    }
    
    return {"result": "Failed to log in."};
  },

  create: async (ctx) => {
    const user = JSON.parse(ctx.request.body); 
    ctx.response.status = 200;

    // validation
    if (!user.username) {
        return {"error": "invalid username"}
    }

    if (!user.firstname) {
        return {"error": "invalid firstname"}
    }

    if (!user.lastname) {
        return {"error": "invalid lastname"}
    }

    if (!user.email) {
        return {"error": "invalid email"}
    }

    const existingUsersWithEmail = await strapi.services.newusers.find({"email": user.email});
    if (existingUsersWithEmail.length > 0) {
        return {"error": "User already exists! Try logging in."}
    }

    const existingUsername = await strapi.services.newusers.find({"username": user.username});
    if (existingUsername.length > 0) {
        return {"error": "Username taken!"}
    }
    
    if (!user.password) {
        return {"error": "invalid password"}
    }

    // register the user in the database
    const newuser = await strapi.services.newusers.create(user);
    return newuser;
  }

};
