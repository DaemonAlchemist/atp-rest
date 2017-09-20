/**
 * Created by Andrea on 9/9/2017.
 */

import express from 'express';
import {o, a} from 'atp-sugar';

export const NOT_IMPLEMENTED = (req, res) => {
    res.status(404).send({messages: [{
        type: 'error',
        text: "Endpoint not implemented yet"
    }]});
};

export const createRoutes = (app, routes) => o(routes).reduce(
    (router, controller, action) => ['get', 'post', 'patch', 'put', 'delete'].includes(action)
        ? router[action]('/', controller)
        : router.use('/' + action, createRoutes(express.Router(), controller)),
    app
);

const _message = (text, type = "error", code = undefined) => typeof code === 'undefined'
    ? {type, text}
    : {type, text, code};

export const message = {
    info:    (text, code = undefined) => _message(text, "info",    code),
    success: (text, code = undefined) => _message(text, "success", code),
    warning: (text, code = undefined) => _message(text, "warning", code),
    error:   (text, code = undefined) => _message(text, "error",   code),
}

export const respondWith = {
    Success: (req, res, callback = r => r) => results => {
        res.status(200).send({results: callback(results)});
    },
    NotFound: (req, res) => {
        res.status(404).send({messages: [
            message.error("The resource at " + req.method + " " + req.path + " does not exist")
        ]});
    },
    InternalServerError: (req, res, callback = e => e) => err => {
        res.status(500).send({messages: [
            message.error("Something went wrong: " + JSON.stringify(callback(err)))
        ]});
    },
    ValidationFail: (req, res, callback = e => e) => errors => {
        errors = callback(errors);
        res.status(a(errors.map(err => err.code)).max()).send({
            messages: errors.map(err => message.error(err.msg))
        });
    }
};
