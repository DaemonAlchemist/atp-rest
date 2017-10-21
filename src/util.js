/**
 * Created by Andrea on 10/17/2017.
 */
import express from 'express';
import {o} from 'atp-sugar';

export const NOT_IMPLEMENTED = (req, res) => {
    res.status(404).send({messages: [{
        type: 'error',
        text: "Endpoint not implemented yet"
    }]});
};

export const NOT_SUPPORTED = (req, res) => {
    res.status(405).send({messages: [{
        type: 'error',
        text: "Endpoint not supported"
    }]});
};

export const createRoutes = (app, routes) => o(routes).reduce(
    (router, controller, action) => ['get', 'post', 'patch', 'put', 'delete'].includes(action)
        ? router[action]('/', controller)
        : router.use('/' + action, createRoutes(express.Router({mergeParams: true}), controller)),
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

export const databaseError = reject => err => {
    reject(!err.code ? err : o(err.code).switch({
        ["ER_DUP_ENTRY"]: () => [{code: 409, msg: "Duplicate entry"}],
        default: () => [{code: 400, msg: "Could not insert new record: " + err.code}]
    }));
};
