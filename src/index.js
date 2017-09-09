/**
 * Created by Andrea on 9/9/2017.
 */

import express from 'express';
import {o} from 'atp-sugar';

export const NOT_IMPLEMENTED = (req, res) => {
    res.status(404).send({messages: [{type: 'error', text: "TODO:  Implement this endpoint"}]});
};

export const createRoutes = (app, routes) => o(routes).reduce(
    (router, controller, action) => ['get', 'post', 'patch', 'put', 'delete'].includes(action)
        ? router[action]('/', controller)
        : router.use('/' + action, createRoutes(express.Router(), controller)),
    app
);
