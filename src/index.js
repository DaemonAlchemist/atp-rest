/**
 * Created by Andrea on 9/9/2017.
 */

import express from 'express';
import {o, a} from 'atp-sugar';
import validator from 'atp-validator';

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
        try {
            res.status(a(errors.map(err => err.code)).max()).send({
                messages: errors.map(err => message.error(err.msg))
            });
        } catch(e) {
            respondWith.InternalServerError(req, res)(errors);
        }
    }
};

export const basicRestController = ({getValidator, loadResource}) => (req, res) => {
    getValidator(req).then(
        () => {
            loadResource(req)
                .then(respondWith.Success(req, res))
                .catch(respondWith.InternalServerError(req, res));
        },
        respondWith.ValidationFail(req, res)
    )
}

export const basicCollectionController = ({model, permission, validate = v => v}) => basicRestController({
    getValidator: req => validate(
        validator()
            .loggedIn(req)
            .hasPermission(permission, req)
            .validCollectionFilters(req.query),
        req
    ),
    loadResource: req => new model().filter(req.query).list()
});

export const basicEntityController = ({model, permission, idField = "id", validate = v => v}) => basicRestController({
    getValidator: req => validate(
        validator()
            .loggedIn(req)
            .hasPermission(permission)
            .required(req.params[idField], idField),
        req
    ),
    loadResource: req => new model().getById(req.params[idField])
});

export const basicEntityDeleteController = ({model, permission, idField = "id", validate = v => v}) => basicRestController({
    getValidator: req => validate(
        validator()
            .loggedIn(req)
            .hasPermission(permission)
            .required(req.params[idField], idField),
        req
    ),
    loadResource: req => null,  //TODO:  Implement this
});