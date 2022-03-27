/*
 * File: fetchWrapper.ts
 * Project: next-cms
 * File Created: Sunday, 27th March 2022 3:46:26 pm
 * Author: Allan Nava (allan.nava@hiway.media)
 * -----
 * Last Modified: Sunday, 27th March 2022 3:46:31 pm
 * Modified By: Allan Nava (allan.nava@hiway.media>)
 * -----
 * Copyright 2022 - 2022 © 
 */

export const fetchWrapper = {
    get,
    post,
    put,
    delete: _delete
};

async function get(url, context) {
    const requestOptions = {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', ...authHeader(context) }
    };
    const response = await fetch(url, requestOptions);
    return response;
    //return handleResponse(response);
}


async function post(url, body, context) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader(context) },
        body: JSON.stringify(body)
    };
    const response = await fetch(url, requestOptions);
    return handleResponse(response);
}

function put(url, body, context) {
    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader(context) },
        body: JSON.stringify(body)
    };
    return fetch(url, requestOptions)
}

// prefixed with underscored because delete is a reserved word in javascript
function _delete(url, context) {
    const requestOptions = {
        method: 'DELETE',
        headers: authHeader(context)
    };
    return fetch(url, requestOptions)
}



// helper functions

function authHeader(context) {
    //
    //var token = userService.access_token;
    if (context.req) {
        if (context.req.cookies) {
            /*if (context.req.cookies.access_token) {
                token = context.req.cookies.access_token
            }*/
            
        }
    }
    /*if (token) {
        return { Authorization: `Bearer ${token}` }
    } else {
        return {};
    }*/
    return {};
}

//
async function handleResponse(response) {
    if (!response.ok) {
        const message = await response.text()
        return {
            "response": "KO",
            "message": message,
            "data": null
        }
    }
    const json = await response.json();
    return json
}
