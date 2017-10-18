/**
 * Created by Andrea on 10/17/2017.
 */

import restController from "./rest";
import validator from 'atp-validator';
import {o} from 'atp-sugar';
import {databaseError} from "../util";
import {underscore} from "inflected";

export default ({model, permission, idField = "id", validate = v => v}) => restController({
    getValidator: req => validate(
        validator()
            .loggedIn(req)
            .hasPermission(permission, req)
            .required(req.params[idField], idField),
        req
    ),
    loadResource: req => new Promise((resolve, reject) => {
        const id = req.params[idField];
        const data = o(req.body)
            .mergeReduce((value, key) => ({[underscore(key)]: value}))
            .raw;
        new model()
            .where({id})
            .limit(1)
            .update(data)
            .then(info => {
                new model().getById(id).then(resolve, reject);
            })
            .catch(databaseError(reject));
    }),
});
