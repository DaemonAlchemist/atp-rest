/**
 * Created by Andrea on 9/9/2017.
 */

import express from 'express';
import {o, a} from 'atp-sugar';
import validator from 'atp-validator';
import {underscore} from 'inflected';

export const NOT_IMPLEMENTED = (req, res) => {
    res.status(404).send({messages: [{
        type: 'error',
        text: "Endpoint not implemented yet"
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
    Error: (req, res, callback = e => e) => errors => {
        errors = callback(errors);
        try {
            res.status(a(errors.map(err => err.code)).max()).send({
                messages: errors.map(err => message.error(err.msg))
            });
        } catch(e) {
            respondWith.InternalServerError(req, res)(errors);
        }
    },
};

export const basicController = {
    rest: ({getValidator, loadResource, processResults}) => (req, res) => {
        try {
            getValidator(req).then(
                () => {
                    try {
                        loadResource(req)
                            .then(respondWith.Success(req, res, processResults))
                            .catch(respondWith.Error(req, res));
                    } catch (e) {
                        console.log(e);
                        respondWith.InternalServerError(req, res)(e.toString());
                    }
                },
                respondWith.Error(req, res)
            )
        } catch(e) {
            console.log(e);
            respondWith.InternalServerError(req, res)(e.toString());
        }
    },
    entity: {
        collection: ({model, permission, validate = v => v, filter = req => ({}), processResults = r => r}) => basicController.rest({
            getValidator: req => validate(
                validator()
                    .loggedIn(req)
                    .hasPermission(permission, req)
                    .validCollectionFilters(req.query),
                req
            ),
            loadResource: req => new model().filter(o(req.query).merge(filter(req)).raw).list(),
            processResults
        }),
        subCollection: ({model, permission, thisName, otherName}) => basicController.entity.collection({
            model,
            permission,
            filter: req => ({[thisName + "_id"]: req.params[thisName + "Id"]}),
            processResults: entities => entities.map(entity => ({
                id: entity[otherName + "_id"],
                version: entity[otherName + "_version"]
            }))
        }),
        create: ({model, permission, validate = v => v}) => basicController.rest({
            getValidator: req => validate(
                validator()
                    .loggedIn(req)
                    .hasPermission(permission, req),
                req
            ),
            loadResource: req => new Promise((resolve, reject) => {
                const data = o(req.body)
                    .merge(req.params)
                    .mergeReduce((value, key) => ({[underscore(key)]: value}))
                    .raw;
                new model().insert(data)
                    .then(info => {
                        new model().getById(info.insertId).then(resolve, reject);
                    })
                    .catch(err => {
                        reject(!err.code ? err : o(err.code).switch({
                            ["ER_DUP_ENTRY"]: () => [{code: 409, msg: "Duplicate entry"}],
                            default: () => [{code: 400, msg: "Could not insert new record: " + err.code + " - " + JSON.stringify(data)}]
                        }));
                    });
            }),
        }),
        view: ({model, permission, idField = "id", validate = v => v}) => basicController.rest({
            getValidator: req => validate(
                validator()
                    .loggedIn(req)
                    .hasPermission(permission, req)
                    .required(req.params[idField], idField),
                req
            ),
            loadResource: req => new model().getById(req.params[idField])
        }),
        update: ({model, permission, idField = "id", validate = v => v}) => basicController.rest({
            getValidator: req => validate(
                validator()
                    .loggedIn(req)
                    .hasPermission(permission, req)
                    .required(req.params[idField], idField),
                req
            ),
            loadResource: req => null,  //TODO:  Implement resource editing (PATCH)
        }),
        replace: ({model, permission, idField = "id", validate = v => v}) => basicController.rest({
            getValidator: req => validate(
                validator()
                    .loggedIn(req)
                    .hasPermission(permission, req)
                    .required(req.params[idField], idField),
                req
            ),
            loadResource: req => null,  //TODO:  Implement resource replacement (PUT)
        }),
        delete: ({model, permission, idField = "id", validate = v => v}) => basicController.rest({
            getValidator: req => validate(
                validator()
                    .loggedIn(req)
                    .hasPermission(permission, req)
                    .required(req.params[idField], idField),
                req
            ),
            loadResource: req => null,  //TODO:  Implement resource deleting
        }),
        unlink: ({model, permission, validate = v => v}) => basicController.rest({
            getValidator: req => validate(
                validator()
                    .loggedIn(req)
                    .hasPermission(permission, req),
                req
            ),
            loadResource: req => new Promise((resolve, reject) => {
                const data = o(req.params)
                    .mergeReduce((value, key) => ({[underscore(key)]: value}))
                    .raw;
                new model()
                    .where(data)
                    .limit(1)
                    .delete()
                    .then(resolve)
                    .catch(err => {
                        reject(!err.code ? err : o(err.code).switch({
                            ["ER_DUP_ENTRY"]: () => [{code: 409, msg: "Duplicate entry"}],
                            default: () => [{code: 400, msg: "Could not unlink resources: " + err.code + " - " + JSON.stringify(data)}]
                        }));
                    });
            }),
        })
    }
};
