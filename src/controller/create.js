/**
 * Created by Andrea on 10/17/2017.
 */

import restController from "./rest";
import validator from 'atp-validator';
import {o} from 'atp-sugar';
import {databaseError} from "../util";

export default ({model, permission, validate = v => v}) => restController({
    getValidator: req => validate(
        validator()
            .loggedIn(req)
            .hasPermission(permission, req),
        req
    ),
    loadResource: req => new Promise((resolve, reject) => {
        const data = o(req.body)
            .merge(req.params)
            .mergeReduce((value, key) => ({[key]: value}))
            .raw;
        new model().insert(data)
            .then(info => {
                new model().getById(info.insertId).then(resolve, reject);
            })
            .catch(databaseError(reject));
    }),
})